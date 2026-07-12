import { Product } from '@domain/products/model/product.model';
import { OrderTransaction } from '@domain/transaction/model/transaction.model';
import { TransactionStatus } from '@domain/transaction/enums/transaction-status.enum';
import { GetTransactionByIdUseCase } from '@domain/transaction/use_case/get-transaction-by-id.use-case';
import { GetTransactionByIdHandler } from './get-transaction-by-id.handler';

describe('GetTransactionByIdHandler', () => {
  let handler: GetTransactionByIdHandler;
  let callMock: jest.MockedFunction<GetTransactionByIdUseCase['call']>;

  const transaction: OrderTransaction = {
    id: 1,
    quantity: 2,
    product: new Product(1, 'Product A', 'image-a.jpg', 15, 10),
    total: 30,
    status: TransactionStatus.PENDING,
    createdAt: new Date('2026-01-01'),
  };

  beforeEach(() => {
    callMock = jest.fn<
      ReturnType<GetTransactionByIdUseCase['call']>,
      Parameters<GetTransactionByIdUseCase['call']>
    >();
    handler = new GetTransactionByIdHandler({
      call: callMock,
    } as unknown as GetTransactionByIdUseCase);
  });

  it('should call use case and map transaction to response dto', async () => {
    callMock.mockResolvedValue(transaction);

    const result = await handler.call(1);

    expect(callMock).toHaveBeenCalledWith(1);
    expect(result).toEqual({
      id: 1,
      paymentGatewayTransactionId: undefined,
      quantity: 2,
      total: 30,
      status: TransactionStatus.PENDING,
      createdAt: transaction.createdAt,
      products: [
        {
          id: 1,
          name: 'Product A',
          image: 'image-a.jpg',
          price: 15,
        },
      ],
      delivery: undefined,
      acceptanceEndUserPolicy: undefined,
      acceptancePersonalDataAuthorization: undefined,
    });
  });
});
