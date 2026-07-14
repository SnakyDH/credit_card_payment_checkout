import { Presigned } from '@domain/presigned/model/presigned.model';
import { PresignedType } from '@domain/presigned/model/presigned.type';
import { Product } from '@domain/products/model/product.model';
import { OrderTransaction } from '@domain/transaction/model/transaction.model';
import { TransactionStatus } from '@domain/transaction/enums/transaction-status.enum';
import { InitTransactionUseCase } from '@domain/transaction/use_case/init-transaction.use-case';
import { InitTransactionRequestDto } from '@adapter/in/dtos/request/init-transaction-request.dto';
import { InitTransactionHandler } from './init-transaction.handler';

describe('InitTransactionHandler', () => {
  let handler: InitTransactionHandler;
  let callMock: jest.MockedFunction<InitTransactionUseCase['call']>;

  const presignedDocuments = [
    {
      url: 'https://example.com/policy',
      type: PresignedType.END_USER_POLICY,
      token: 'policy-token',
    },
    {
      url: 'https://example.com/data',
      type: PresignedType.PERSONAL_DATA_AUTH,
      token: 'data-token',
    },
  ];

  const request: InitTransactionRequestDto = {
    productId: 1,
    quantity: 2,
    presignedDocuments,
  };

  beforeEach(() => {
    callMock = jest.fn<
      ReturnType<InitTransactionUseCase['call']>,
      Parameters<InitTransactionUseCase['call']>
    >();
    handler = new InitTransactionHandler({
      call: callMock,
    } as unknown as InitTransactionUseCase);
  });

  it('should map request to use case input and map result to response dto', async () => {
    const product = new Product(1, 'Product A', 'image-a.jpg', 1500, 10);
    const transaction: OrderTransaction = {
      id: 10,
      quantity: 2,
      product,
      total: 3000,
      status: TransactionStatus.PENDING,
      createdAt: new Date('2026-01-01'),
    };
    const domainPresigned = presignedDocuments.map(
      (doc) => new Presigned(doc.url, doc.type, doc.token),
    );

    callMock.mockResolvedValue({
      transaction,
      presignedDocuments: domainPresigned,
    });

    const result = await handler.call(request);

    expect(callMock).toHaveBeenCalledWith({
      productId: 1,
      quantity: 2,
      presignedDocuments: domainPresigned,
    });
    expect(result).toEqual({
      transactionId: 10,
      status: TransactionStatus.PENDING,
      productId: 1,
      quantity: 2,
      total: 3000,
      presignedDocuments,
      createdAt: transaction.createdAt,
    });
  });
});
