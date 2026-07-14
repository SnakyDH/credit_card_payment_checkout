import { TransactionStatus } from '../enums/transaction-status.enum';

export class PaymentResult {
  id: string;
  status: TransactionStatus;
}
