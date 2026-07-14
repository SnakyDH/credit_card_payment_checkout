import { Delivery } from '@domain/delivery/model/delivery';
import { Product } from '@domain/products/model/product.model';
import { OrderTransaction } from '@domain/transaction/model/transaction.model';
import { TransactionStatus } from '@domain/transaction/enums/transaction-status.enum';
import { FinishTransactionUseCase } from '@domain/transaction/use_case/finish-transaction.use-case';
import { FinishTransactionRequestDto } from '@adapter/in/dtos/request/finish-transaction-request.dto';
import { FinishTransactionHandler } from './finish-transaction.handler';

describe('FinishTransactionHandler', () => {
  let handler: FinishTransactionHandler;
  let callMock: jest.MockedFunction<FinishTransactionUseCase['call']>;

  const request: FinishTransactionRequestDto = {
    transactionId: 1,
    paymentCard: {
      number: '4242424242424242',
      cvc: '123',
      expMonth: '12',
      expYear: '29',
      holderName: 'John Doe',
    },
    delivery: {
      address: '123 Main St',
      city: 'Medellin',
      region: 'Antioquia',
      postalCode: '050001',
      country: 'CO',
      phone: '3001234567',
      customerEmail: 'john@example.com',
      customer: 'John Doe',
    },
  };

  beforeEach(() => {
    callMock = jest.fn<
      ReturnType<FinishTransactionUseCase['call']>,
      Parameters<FinishTransactionUseCase['call']>
    >();
    handler = new FinishTransactionHandler({
      call: callMock,
    } as unknown as FinishTransactionUseCase);
  });

  it('should map request fields and return finish transaction response dto', async () => {
    const delivery: Delivery = {
      id: 5,
      ...request.delivery,
      fee: 700,
    };
    const transaction: OrderTransaction = {
      id: 1,
      quantity: 2,
      product: new Product(1, 'Product A', 'image-a.jpg', 15, 10),
      total: 30,
      status: TransactionStatus.APPROVED,
      delivery,
      createdAt: new Date('2026-01-01'),
    };

    callMock.mockResolvedValue({ transaction });

    const result = await handler.call(request);

    expect(callMock).toHaveBeenCalledWith({
      transactionId: 1,
      paymentCard: {
        number: '4242424242424242',
        cvv: '123',
        expirationMonth: '12',
        expirationYear: '29',
        holderName: 'John Doe',
      },
      delivery: request.delivery,
    });
    expect(result).toEqual({
      id: 1,
      status: TransactionStatus.APPROVED,
      product: {
        id: 1,
        name: 'Product A',
        image: 'image-a.jpg',
        price: 15,
        stock: 10,
        quantity: 2,
      },
      total: 30,
      deliveryFee: 700,
    });
  });

  it('should default deliveryFee to 0 when delivery is missing', async () => {
    const transaction: OrderTransaction = {
      id: 1,
      quantity: 1,
      product: new Product(1, 'Product A', 'image-a.jpg', 15, 10),
      total: 15,
      status: TransactionStatus.REJECTED,
      createdAt: new Date('2026-01-01'),
    };

    callMock.mockResolvedValue({ transaction });

    const result = await handler.call(request);

    expect(result.deliveryFee).toBe(0);
  });
});
