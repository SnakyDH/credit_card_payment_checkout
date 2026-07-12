import { OrderTransaction } from '../model/transaction.model';

export interface ITransactionRepository {
  create(
    transaction: Omit<OrderTransaction, 'id' | 'createdAt'>,
  ): Promise<OrderTransaction>;
  findById(id: number): Promise<OrderTransaction | null>;
  findByPaymentGatewayId(
    paymentGatewayTransactionId: string,
  ): Promise<OrderTransaction | null>;
  update(
    id: number,
    transaction: Partial<OrderTransaction>,
  ): Promise<OrderTransaction>;
}
