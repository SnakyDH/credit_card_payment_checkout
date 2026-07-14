import { ExceptionCustom } from '@domain/shared/exceptions/exception-custom';
import { ExceptionConstants } from '@domain/shared/exceptions/exception-constants';
import { Product } from '@domain/products/model/product.model';
import { OrderTransaction } from '../model/transaction.model';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { ITransactionRepository } from '../repository/transaction-repository.interface';
import { GetTransactionByIdUseCase } from './get-transaction-by-id.use-case';

describe('GetTransactionByIdUseCase', () => {
  let useCase: GetTransactionByIdUseCase;
  let findByIdMock: jest.MockedFunction<ITransactionRepository['findById']>;

  const transaction: OrderTransaction = {
    id: 1,
    quantity: 2,
    product: new Product(1, 'Product A', 'image-a.jpg', 1500, 10),
    total: 30,
    status: TransactionStatus.PENDING,
    createdAt: new Date('2026-01-01'),
  };

  beforeEach(() => {
    findByIdMock = jest.fn<
      ReturnType<ITransactionRepository['findById']>,
      Parameters<ITransactionRepository['findById']>
    >();
    useCase = new GetTransactionByIdUseCase({
      findById: findByIdMock,
    } as jest.Mocked<ITransactionRepository>);
  });

  it('should return transaction when found', async () => {
    findByIdMock.mockResolvedValue(transaction);

    const result = await useCase.call(1);

    expect(findByIdMock).toHaveBeenCalledWith(1);
    expect(result).toBe(transaction);
  });

  it('should throw TRANSACTION_NOT_FOUND when transaction does not exist', async () => {
    findByIdMock.mockResolvedValue(null);

    await expect(useCase.call(99)).rejects.toThrow(ExceptionCustom);
    await expect(useCase.call(99)).rejects.toMatchObject({
      message: ExceptionConstants.TRANSACTION_NOT_FOUND,
    });
  });
});
