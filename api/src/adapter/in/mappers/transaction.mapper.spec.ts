import { TransactionMapper } from './transaction.mapper';
import { OrderTransaction } from '@domain/transaction/model/transaction.model';
import { Product } from '@domain/products/model/product.model';
import { TransactionStatus } from '@domain/transaction/enums/transaction-status.enum';

describe('TransactionMapper', () => {
  const baseTransaction: OrderTransaction = {
    id: 1,
    quantity: 2,
    product: new Product(10, 'Coffee', 'image.jpg', 15000, 5),
    total: 30000,
    status: TransactionStatus.APPROVED,
    createdAt: new Date('2026-01-01'),
    paymentGatewayTransactionId: 'pay-1',
  };

  it('maps transaction without optional relations', () => {
    const result = TransactionMapper.toTransactionDto(baseTransaction);

    expect(result.delivery).toBeUndefined();
    expect(result.acceptanceEndUserPolicy).toBeUndefined();
    expect(result.acceptancePersonalDataAuthorization).toBeUndefined();
    expect(result.products[0].name).toBe('Coffee');
  });

  it('maps transaction with delivery and presigned documents', () => {
    const result = TransactionMapper.toTransactionDto({
      ...baseTransaction,
      delivery: {
        id: 5,
        address: 'Street 1',
        city: 'Bogota',
        postalCode: '110111',
      },
      acceptanceEndUserPolicy: {
        url: 'https://example.com/policy',
        token: 'token-1',
      },
      acceptancePersonalDataAuthorization: {
        url: 'https://example.com/data',
        token: 'token-2',
      },
    });

    expect(result.delivery).toEqual({
      id: 5,
      address: 'Street 1',
      city: 'Bogota',
      postalCode: '110111',
    });
    expect(result.acceptanceEndUserPolicy?.token).toBe('token-1');
    expect(result.acceptancePersonalDataAuthorization?.token).toBe('token-2');
  });
});
