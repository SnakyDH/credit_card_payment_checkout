import { TransactionStatus } from '@domain/transaction/enums/transaction-status.enum';
import { GatewayTransactionStatus } from '../dtos/post-create-transaction-response.dto';

export class GatewayStatusMapper {
  static map(gatewayStatus: GatewayTransactionStatus): TransactionStatus {
    switch (gatewayStatus) {
      case GatewayTransactionStatus.PENDING:
        return TransactionStatus.PENDING;
      case GatewayTransactionStatus.APPROVED:
        return TransactionStatus.APPROVED;
      case GatewayTransactionStatus.DECLINED:
        return TransactionStatus.REJECTED;
      case GatewayTransactionStatus.ERROR:
        return TransactionStatus.REJECTED;
      case GatewayTransactionStatus.VOIDED:
        return TransactionStatus.REJECTED;
    }
  }
}
