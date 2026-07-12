import { ExceptionCustom } from '@domain/shared/exceptions/exception-custom';
import { ExceptionConstants } from '@domain/shared/exceptions/exception-constants';
import { Presigned } from '@domain/presigned/model/presigned.model';
import { PresignedType } from '@domain/presigned/model/presigned.type';
import { Product } from '@domain/products/model/product.model';
import { IProductRepository } from '@domain/products/repository/product-repository.interface';
import { OrderTransaction } from '../model/transaction.model';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { ITransactionRepository } from '../repository/transaction-repository.interface';
import { InitTransactionUseCase } from './init-transaction.use-case';

describe('InitTransactionUseCase', () => {
  let useCase: InitTransactionUseCase;
  let findByIdMock: jest.MockedFunction<IProductRepository['findById']>;
  let createMock: jest.MockedFunction<ITransactionRepository['create']>;

  const product = new Product(1, 'Product A', 'image-a.jpg', 1500, 10);
  const presignedDocuments = [
    new Presigned(
      'https://example.com/policy',
      PresignedType.END_USER_POLICY,
      'policy-token',
    ),
    new Presigned(
      'https://example.com/data',
      PresignedType.PERSONAL_DATA_AUTH,
      'data-token',
    ),
  ];

  const request = {
    productId: 1,
    quantity: 2,
    presignedDocuments,
  };

  beforeEach(() => {
    findByIdMock = jest.fn<
      ReturnType<IProductRepository['findById']>,
      Parameters<IProductRepository['findById']>
    >();
    createMock = jest.fn<
      ReturnType<ITransactionRepository['create']>,
      Parameters<ITransactionRepository['create']>
    >();
    useCase = new InitTransactionUseCase(
      { create: createMock } as jest.Mocked<ITransactionRepository>,
      { findById: findByIdMock } as jest.Mocked<IProductRepository>,
    );
  });

  it('should create transaction with calculated total and presigned documents', async () => {
    const createdTransaction: OrderTransaction = {
      id: 1,
      quantity: 2,
      product,
      total: 3000,
      status: TransactionStatus.PENDING,
      acceptanceEndUserPolicy: presignedDocuments[0],
      acceptancePersonalDataAuthorization: presignedDocuments[1],
      createdAt: new Date('2026-01-01'),
    };
    findByIdMock.mockResolvedValue(product);
    createMock.mockResolvedValue(createdTransaction);

    const result = await useCase.call(request);

    expect(findByIdMock).toHaveBeenCalledWith(1);
    expect(createMock).toHaveBeenCalledWith({
      quantity: 2,
      product,
      total: 3000,
      status: TransactionStatus.PENDING,
      acceptanceEndUserPolicy: presignedDocuments[0],
      acceptancePersonalDataAuthorization: presignedDocuments[1],
    });
    expect(result.transaction).toBe(createdTransaction);
    expect(result.presignedDocuments).toBe(presignedDocuments);
  });

  it('should throw PRODUCT_NOT_FOUND when product does not exist', async () => {
    findByIdMock.mockResolvedValue(null as unknown as Product);

    await expect(useCase.call(request)).rejects.toThrow(ExceptionCustom);
    await expect(useCase.call(request)).rejects.toMatchObject({
      message: ExceptionConstants.PRODUCT_NOT_FOUND,
    });
    expect(createMock).not.toHaveBeenCalled();
  });
});
