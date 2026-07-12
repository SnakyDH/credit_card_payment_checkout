import { ExceptionCustom } from '@domain/shared/exceptions/exception-custom';
import { ExceptionConstants } from '@domain/shared/exceptions/exception-constants';
import { Delivery } from '@domain/delivery/model/delivery';
import { IDeliveryRepository } from '@domain/delivery/repository/delivery-repository.interface';
import { Product } from '@domain/products/model/product.model';
import { IProductRepository } from '@domain/products/repository/product-repository.interface';
import { PaymentCard } from '../model/credit-card.model';
import { PaymentResult } from '../model/payment-result.model';
import { OrderTransaction } from '../model/transaction.model';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { IPaymentGatewayRepository } from '../repository/payment-gateway-repository.interface';
import { ITransactionRepository } from '../repository/transaction-repository.interface';
import { FinishTransactionUseCase } from './finish-transaction.use-case';

describe('FinishTransactionUseCase', () => {
  let useCase: FinishTransactionUseCase;
  let findByIdMock: jest.MockedFunction<ITransactionRepository['findById']>;
  let updateMock: jest.MockedFunction<ITransactionRepository['update']>;
  let updateStockMock: jest.MockedFunction<IProductRepository['updateStock']>;
  let createDeliveryMock: jest.MockedFunction<IDeliveryRepository['create']>;
  let updateDeliveryMock: jest.MockedFunction<IDeliveryRepository['update']>;
  let payMock: jest.MockedFunction<IPaymentGatewayRepository['pay']>;

  const product = new Product(1, 'Product A', 'image-a.jpg', 1500, 10);

  const deliveryInput: Omit<Delivery, 'id'> = {
    customer: 'John Doe',
    customerEmail: 'john@example.com',
    address: '123 Main St',
    country: 'CO',
    region: 'Antioquia',
    city: 'Medellin',
    postalCode: '050001',
    phone: '3001234567',
  };

  const paymentCard: PaymentCard = {
    number: '4242424242424242',
    cvv: '123',
    expirationMonth: '12',
    expirationYear: '29',
    holderName: 'John Doe',
  };

  const baseRequest = {
    transactionId: 1,
    paymentCard,
    delivery: deliveryInput,
  };

  const createPendingTransaction = (
    overrides: Partial<OrderTransaction> = {},
  ): OrderTransaction => ({
    id: 1,
    quantity: 2,
    product,
    total: 30,
    status: TransactionStatus.PENDING,
    createdAt: new Date('2026-01-01'),
    ...overrides,
  });

  beforeEach(() => {
    findByIdMock = jest.fn<
      ReturnType<ITransactionRepository['findById']>,
      Parameters<ITransactionRepository['findById']>
    >();
    updateMock = jest.fn<
      ReturnType<ITransactionRepository['update']>,
      Parameters<ITransactionRepository['update']>
    >();
    updateStockMock = jest.fn<
      ReturnType<IProductRepository['updateStock']>,
      Parameters<IProductRepository['updateStock']>
    >();
    createDeliveryMock = jest.fn<
      ReturnType<IDeliveryRepository['create']>,
      Parameters<IDeliveryRepository['create']>
    >();
    updateDeliveryMock = jest.fn<
      ReturnType<IDeliveryRepository['update']>,
      Parameters<IDeliveryRepository['update']>
    >();
    payMock = jest.fn<
      ReturnType<IPaymentGatewayRepository['pay']>,
      Parameters<IPaymentGatewayRepository['pay']>
    >();

    useCase = new FinishTransactionUseCase(
      {
        findById: findByIdMock,
        update: updateMock,
      } as jest.Mocked<ITransactionRepository>,
      { updateStock: updateStockMock } as jest.Mocked<IProductRepository>,
      {
        create: createDeliveryMock,
        update: updateDeliveryMock,
      } as jest.Mocked<IDeliveryRepository>,
      { pay: payMock },
    );
  });

  it('should throw TRANSACTION_NOT_FOUND when transaction does not exist', async () => {
    findByIdMock.mockResolvedValue(null);

    await expect(useCase.call(baseRequest)).rejects.toThrow(ExceptionCustom);
    await expect(useCase.call(baseRequest)).rejects.toMatchObject({
      message: ExceptionConstants.TRANSACTION_NOT_FOUND,
    });
  });

  it('should throw TRANSACTION_ALREADY_FINISHED when transaction is not pending', async () => {
    findByIdMock.mockResolvedValue(
      createPendingTransaction({ status: TransactionStatus.APPROVED }),
    );

    await expect(useCase.call(baseRequest)).rejects.toThrow(ExceptionCustom);
    await expect(useCase.call(baseRequest)).rejects.toMatchObject({
      message: ExceptionConstants.TRANSACTION_ALREADY_FINISHED,
    });
  });

  it('should throw PRODUCT_OUT_OF_STOCK when stock is insufficient', async () => {
    findByIdMock.mockResolvedValue(
      createPendingTransaction({
        quantity: 15,
        product: new Product(1, 'Product A', 'image-a.jpg', 1500, 10),
      }),
    );

    await expect(useCase.call(baseRequest)).rejects.toThrow(ExceptionCustom);
    await expect(useCase.call(baseRequest)).rejects.toMatchObject({
      message: ExceptionConstants.PRODUCT_OUT_OF_STOCK,
    });
  });

  it('should create delivery and finish approved transaction', async () => {
    const transaction = createPendingTransaction();
    const createdDelivery: Delivery = { id: 10, ...deliveryInput };
    const paymentResult: PaymentResult = {
      id: 'pay-123',
      status: TransactionStatus.APPROVED,
    };

    findByIdMock.mockResolvedValue(transaction);
    createDeliveryMock.mockResolvedValue(createdDelivery);
    payMock.mockResolvedValue(paymentResult);
    updateMock.mockImplementation((_id, updatedTransaction) =>
      Promise.resolve({
        ...transaction,
        ...updatedTransaction,
      }),
    );

    const result = await useCase.call(baseRequest);

    expect(createDeliveryMock).toHaveBeenCalledWith(deliveryInput);
    expect(updateDeliveryMock).not.toHaveBeenCalled();
    expect(payMock).toHaveBeenCalledWith(
      expect.objectContaining({ delivery: createdDelivery }),
      paymentCard,
    );
    expect(updateStockMock).toHaveBeenCalledWith(1, 2);
    expect(updateMock).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        status: TransactionStatus.APPROVED,
        paymentGatewayTransactionId: 'pay-123',
      }),
    );
    expect(result.transaction.status).toBe(TransactionStatus.APPROVED);
    expect(result.transaction.paymentGatewayTransactionId).toBe('pay-123');
  });

  it('should update existing delivery when transaction already has one', async () => {
    const existingDelivery: Delivery = { id: 5, ...deliveryInput };
    const transaction = createPendingTransaction({
      delivery: existingDelivery,
    });
    const updatedDelivery: Delivery = {
      ...existingDelivery,
      city: 'Bogota',
    };
    const paymentResult: PaymentResult = {
      id: 'pay-456',
      status: TransactionStatus.APPROVED,
    };

    findByIdMock.mockResolvedValue(transaction);
    updateDeliveryMock.mockResolvedValue(updatedDelivery);
    payMock.mockResolvedValue(paymentResult);
    updateMock.mockImplementation((_id, updatedTransaction) =>
      Promise.resolve({
        ...transaction,
        ...updatedTransaction,
      }),
    );

    await useCase.call(baseRequest);

    expect(createDeliveryMock).not.toHaveBeenCalled();
    expect(updateDeliveryMock).toHaveBeenCalledWith(5, existingDelivery);
  });

  it('should update transaction and throw TRANSACTION_REJECTED when payment is rejected', async () => {
    const createdDelivery: Delivery = { id: 10, ...deliveryInput };
    const paymentResult: PaymentResult = {
      id: 'pay-789',
      status: TransactionStatus.REJECTED,
    };

    findByIdMock.mockResolvedValue(createPendingTransaction());
    createDeliveryMock.mockResolvedValue(createdDelivery);
    payMock.mockResolvedValue(paymentResult);
    updateMock.mockImplementation((_id, updatedTransaction) =>
      Promise.resolve({
        ...createPendingTransaction(),
        ...updatedTransaction,
        delivery: createdDelivery,
      }),
    );

    await expect(useCase.call(baseRequest)).rejects.toMatchObject({
      message: ExceptionConstants.TRANSACTION_REJECTED,
    });
    expect(updateStockMock).not.toHaveBeenCalled();
    expect(updateMock).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        status: TransactionStatus.REJECTED,
        paymentGatewayTransactionId: 'pay-789',
      }),
    );
  });
});
