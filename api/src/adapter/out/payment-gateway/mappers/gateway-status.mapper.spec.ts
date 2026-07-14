import { TransactionStatus } from '@domain/transaction/enums/transaction-status.enum';
import { GatewayTransactionStatus } from '../dtos/post-create-transaction-response.dto';
import { GatewayStatusMapper } from './gateway-status.mapper';

describe('GatewayStatusMapper', () => {
  it.each([
    [GatewayTransactionStatus.PENDING, TransactionStatus.PENDING],
    [GatewayTransactionStatus.APPROVED, TransactionStatus.APPROVED],
    [GatewayTransactionStatus.DECLINED, TransactionStatus.REJECTED],
    [GatewayTransactionStatus.ERROR, TransactionStatus.REJECTED],
    [GatewayTransactionStatus.VOIDED, TransactionStatus.REJECTED],
  ])('maps %s to %s', (input, expected) => {
    expect(GatewayStatusMapper.map(input)).toBe(expected);
  });
});
