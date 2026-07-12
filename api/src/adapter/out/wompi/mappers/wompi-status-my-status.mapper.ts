import { TransactionStatus } from '@domain/transaction/enums/transaction-status.enum';
import { WompiTransactionStatus } from '../dtos/post-create-transaction-response.dto';

export class WompiStatusMyStatusMapper {
  static map(wompiStatus: WompiTransactionStatus): TransactionStatus {
    switch (wompiStatus) {
      case WompiTransactionStatus.PENDING:
        return TransactionStatus.PENDING;
      case WompiTransactionStatus.APPROVED:
        return TransactionStatus.APPROVED;
      case WompiTransactionStatus.DECLINED:
        return TransactionStatus.REJECTED;
      case WompiTransactionStatus.ERROR:
        return TransactionStatus.REJECTED;
      case WompiTransactionStatus.VOIDED:
        return TransactionStatus.REJECTED;
    }
  }
}
