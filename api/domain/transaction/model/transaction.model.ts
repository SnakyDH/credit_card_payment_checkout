import { Delivery } from '@domain/delivery/model/delivery';
import { Product } from '@domain/products/model/product.model';
import { TransactionStatus } from '@domain/transaction/enums/transaction-status.enum';
import { Presigned } from '@domain/presigned/model/presigned.model';

export interface OrderTransaction {
  id: number;
  paymentGatewayTransactionId?: string;
  quantity: number;
  product: Product;
  delivery?: Delivery;
  total?: number;
  status: TransactionStatus;
  acceptanceEndUserPolicy?: Presigned;
  acceptancePersonalDataAuthorization?: Presigned;
  acceptanceEndUserPolicyToken?: string;
  acceptancePersonalDataAuthorizationToken?: string;
  createdAt: Date;
}
