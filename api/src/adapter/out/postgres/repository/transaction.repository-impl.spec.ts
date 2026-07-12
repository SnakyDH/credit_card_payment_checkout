import { ExceptionCustom } from '@domain/shared/exceptions/exception-custom';
import { ExceptionConstants } from '@domain/shared/exceptions/exception-constants';
import { Product } from '@domain/products/model/product.model';
import { Presigned } from '@domain/presigned/model/presigned.model';
import { PresignedType } from '@domain/presigned/model/presigned.type';
import { TransactionStatus } from '@domain/transaction/enums/transaction-status.enum';
import { OrderTransactionEntity } from '@adapter/out/postgres/entities/order-transaction.entity';
import { ProductEntity } from '@adapter/out/postgres/entities/product.entity';
import { DeliveryEntity } from '@adapter/out/postgres/entities/delivery.entity';
import { Repository } from 'typeorm';
import { TransactionRepositoryImpl } from './transaction.repository-impl';

describe('TransactionRepositoryImpl', () => {
  let repository: TransactionRepositoryImpl;
  let typeOrmRepository: jest.Mocked<
    Pick<
      Repository<OrderTransactionEntity>,
      'create' | 'save' | 'findOne' | 'update' | 'find'
    >
  >;

  const productEntity = {
    id: 1,
    name: 'Product A',
    image: 'image-a.jpg',
    price: 1500,
    stock: 10,
  } as ProductEntity;

  const deliveryEntity = {
    id: 5,
    customer: 'John Doe',
    customerEmail: 'john@example.com',
    address: '123 Main St',
    country: 'CO',
    region: 'Antioquia',
    city: 'Medellin',
    postalCode: '050001',
    phone: '3001234567',
  } as DeliveryEntity;

  const savedEntity = {
    id: 10,
    quantity: 2,
    total: 30,
    status: TransactionStatus.PENDING,
    productId: 1,
    product: productEntity,
    delivery: deliveryEntity,
    createdAt: new Date('2026-01-01'),
  } as OrderTransactionEntity;

  beforeEach(() => {
    typeOrmRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      find: jest.fn(),
    };
    repository = new TransactionRepositoryImpl(
      typeOrmRepository as unknown as Repository<OrderTransactionEntity>,
    );
  });

  it('should create and return complete transaction', async () => {
    const transactionInput = {
      quantity: 2,
      total: 30,
      status: TransactionStatus.PENDING,
      product: new Product(1, 'Product A', 'image-a.jpg', 1500, 10),
      delivery: deliveryEntity,
      acceptanceEndUserPolicy: new Presigned(
        'https://example.com/policy',
        PresignedType.END_USER_POLICY,
        'policy-token',
      ),
      acceptancePersonalDataAuthorization: new Presigned(
        'https://example.com/data',
        PresignedType.PERSONAL_DATA_AUTH,
        'data-token',
      ),
    };
    typeOrmRepository.create.mockReturnValue(savedEntity);
    typeOrmRepository.save.mockResolvedValue(savedEntity);
    typeOrmRepository.findOne.mockResolvedValue(savedEntity);

    const result = await repository.create(transactionInput);

    expect(typeOrmRepository.create).toHaveBeenCalledWith({
      paymentGatewayTransactionId: undefined,
      quantity: 2,
      total: 30,
      status: TransactionStatus.PENDING,
      productId: 1,
      deliveryId: 5,
      acceptanceEndUserPolicyUrl: 'https://example.com/policy',
      acceptancePersonalDataAuthorizationUrl: 'https://example.com/data',
      acceptanceEndUserPolicyToken: 'policy-token',
      acceptancePersonalDataAuthorizationToken: 'data-token',
    });
    expect(result).toBe(savedEntity);
  });

  it('should throw TRANSACTION_NOT_FOUND when create reload fails', async () => {
    typeOrmRepository.create.mockReturnValue(savedEntity);
    typeOrmRepository.save.mockResolvedValue(savedEntity);
    typeOrmRepository.findOne.mockResolvedValue(null);

    await expect(
      repository.create({
        quantity: 1,
        status: TransactionStatus.PENDING,
        product: new Product(1, 'Product A', 'image-a.jpg', 1500, 10),
        acceptanceEndUserPolicy: new Presigned(
          'url',
          PresignedType.END_USER_POLICY,
          'token',
        ),
        acceptancePersonalDataAuthorization: new Presigned(
          'url',
          PresignedType.PERSONAL_DATA_AUTH,
          'token',
        ),
      }),
    ).rejects.toMatchObject({
      message: ExceptionConstants.TRANSACTION_NOT_FOUND,
    });
  });

  it('should find transaction by id', async () => {
    typeOrmRepository.findOne.mockResolvedValue(savedEntity);

    const result = await repository.findById(10);

    expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
      where: { id: 10 },
      relations: { product: true, delivery: true },
    });
    expect(result).toBe(savedEntity);
  });

  it('should throw TRANSACTION_NOT_FOUND when findById returns null', async () => {
    typeOrmRepository.findOne.mockResolvedValue(null);

    await expect(repository.findById(99)).rejects.toThrow(ExceptionCustom);
  });

  it('should find transaction by payment gateway id', async () => {
    typeOrmRepository.findOne.mockResolvedValue(savedEntity);

    const result = await repository.findByPaymentGatewayId('pay-123');

    expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
      where: { paymentGatewayTransactionId: 'pay-123' },
      relations: { product: true, delivery: true },
    });
    expect(result).toBe(savedEntity);
  });

  it('should update transaction and return reloaded entity', async () => {
    const updatedEntity = {
      ...savedEntity,
      status: TransactionStatus.APPROVED,
      paymentGatewayTransactionId: 'pay-123',
    };
    typeOrmRepository.update.mockResolvedValue({ affected: 1 } as never);
    typeOrmRepository.findOne.mockResolvedValue(updatedEntity);

    const result = await repository.update(10, {
      status: TransactionStatus.APPROVED,
      paymentGatewayTransactionId: 'pay-123',
    });

    expect(typeOrmRepository.update).toHaveBeenCalledWith(10, {
      status: TransactionStatus.APPROVED,
      paymentGatewayTransactionId: 'pay-123',
    });
    expect(result).toBe(updatedEntity);
  });

  it('should find all transactions', async () => {
    typeOrmRepository.find.mockResolvedValue([savedEntity]);

    const result = await repository.findAll();

    expect(typeOrmRepository.find).toHaveBeenCalledWith({
      relations: { product: true, delivery: true },
    });
    expect(result).toEqual([savedEntity]);
  });

  it('should throw TRANSACTION_NOT_FOUND when findAll returns empty list', async () => {
    typeOrmRepository.find.mockResolvedValue([]);

    await expect(repository.findAll()).rejects.toMatchObject({
      message: ExceptionConstants.TRANSACTION_NOT_FOUND,
    });
  });
});
