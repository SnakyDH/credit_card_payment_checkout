import { PaymentCard } from "../model/credit-card.model";
import { PaymentResult } from "../model/payment-result.model";
import { OrderTransaction } from "../model/transaction.model";

export interface IPaymentGatewayRepository {
  pay(transaction: OrderTransaction, paymentCard: PaymentCard): Promise<PaymentResult>;
}