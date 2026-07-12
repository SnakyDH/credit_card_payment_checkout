import { of } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Product } from '@domain/products/model/product.model';
import { TransactionStatus } from '@domain/transaction/enums/transaction-status.enum';
import { OrderTransaction } from '@domain/transaction/model/transaction.model';
import { PaymentCard } from '@domain/transaction/model/credit-card.model';
import { WompiTransactionStatus } from '../dtos/post-create-transaction-response.dto';
import { PaymentWompiRepository } from './payment-wompi.repository';

jest.mock('@config/env-constants', () => ({
  envConstants: {
    wompi: {
      privateKey: 'priv_test_key',
      integrityKey: 'integrity_test_key',
    },
  },
}));

const axiosResponse = <T>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as AxiosResponse<T>['config'],
});

describe('PaymentWompiRepository', () => {
  let repository: PaymentWompiRepository;
  let requestMock: jest.MockedFunction<HttpService['request']>;

  const transaction: OrderTransaction = {
    id: 7,
    quantity: 1,
    total: 30,
    status: TransactionStatus.PENDING,
    acceptanceEndUserPolicyToken: 'acceptance-token',
    product: new Product(1, 'Product A', 'image-a.jpg', 1500, 10),
    delivery: {
      id: 5,
      customer: 'John Doe',
      customerEmail: 'john@example.com',
      address: '123 Main St',
      country: 'CO',
      region: 'Antioquia',
      city: 'Medellin',
      postalCode: '050001',
      phone: '3001234567',
    },
    createdAt: new Date('2026-01-01'),
  };

  const paymentCard: PaymentCard = {
    number: '4242424242424242',
    cvv: '123',
    expirationMonth: '12',
    expirationYear: '29',
    holderName: 'John Doe',
  };

  beforeEach(() => {
    jest.useFakeTimers();
    requestMock = jest.fn();
    repository = new PaymentWompiRepository({
      request: requestMock,
    } as unknown as HttpService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return approved payment result when creation is not pending', async () => {
    requestMock
      .mockReturnValueOnce(
        of(
          axiosResponse({
            status: 'OK',
            data: { id: 'card-token-1' },
          }),
        ),
      )
      .mockReturnValueOnce(
        of(
          axiosResponse({
            data: {
              id: 'txn-123',
              status: WompiTransactionStatus.APPROVED,
            },
          }),
        ),
      );

    const result = await repository.pay(transaction, paymentCard);

    expect(requestMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        method: 'POST',
        url: '/v1/tokens/cards',
      }),
    );
    const createTransactionRequest = requestMock.mock.calls[1]?.[0];
    expect(createTransactionRequest).toMatchObject({
      method: 'POST',
      url: '/v1/transactions',
      headers: { Authorization: 'Bearer priv_test_key' },
    });
    expect(createTransactionRequest.data).toMatchObject({
      acceptance_token: 'acceptance-token',
      amount_in_cents: 3000,
      currency: 'COP',
      reference: 'SnakyDev-7',
      customer_email: 'john@example.com',
    });
    expect(result).toEqual({
      id: 'txn-123',
      status: TransactionStatus.APPROVED,
    });
  });

  it('should poll transaction status when creation returns pending', async () => {
    requestMock
      .mockReturnValueOnce(
        of(
          axiosResponse({
            status: 'OK',
            data: { id: 'card-token-1' },
          }),
        ),
      )
      .mockReturnValueOnce(
        of(
          axiosResponse({
            data: {
              id: 'txn-456',
              status: WompiTransactionStatus.PENDING,
            },
          }),
        ),
      )
      .mockReturnValueOnce(
        of(
          axiosResponse({
            data: {
              id: 'txn-456',
              status: WompiTransactionStatus.APPROVED,
            },
          }),
        ),
      );

    const payPromise = repository.pay(transaction, paymentCard);
    await jest.runAllTimersAsync();
    const result = await payPromise;

    expect(requestMock).toHaveBeenCalledTimes(3);
    expect(requestMock).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        method: 'GET',
        url: '/v1/transactions/txn-456',
      }),
    );
    expect(result).toEqual({
      id: 'txn-456',
      status: TransactionStatus.APPROVED,
    });
  });
});
