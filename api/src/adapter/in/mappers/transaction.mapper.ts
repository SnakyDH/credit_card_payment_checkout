import { OrderTransaction } from '@domain/transaction/model/transaction.model';
import { GetTransactionByIdResponseDto } from '@adapter/in/dtos/response/get-transaction-by-id.response.dto';

export class TransactionMapper {
  static toTransactionDto(
    transaction: OrderTransaction,
  ): GetTransactionByIdResponseDto {
    return {
      id: transaction.id,
      paymentGatewayTransactionId: transaction.paymentGatewayTransactionId,
      quantity: transaction.quantity,
      total: transaction.total,
      status: transaction.status,
      createdAt: transaction.createdAt,
      products: [
        {
          id: transaction.product.id,
          name: transaction.product.name,
          image: transaction.product.image,
          price: transaction.product.price,
        },
      ],
      delivery: transaction.delivery
        ? {
            id: transaction.delivery.id,
            address: transaction.delivery.address,
            city: transaction.delivery.city,
            postalCode: transaction.delivery.postalCode,
          }
        : undefined,
      acceptanceEndUserPolicy: transaction.acceptanceEndUserPolicy
        ? {
            url: transaction.acceptanceEndUserPolicy.url,
            token: transaction.acceptanceEndUserPolicy.token,
          }
        : undefined,
      acceptancePersonalDataAuthorization:
        transaction.acceptancePersonalDataAuthorization
          ? {
              url: transaction.acceptancePersonalDataAuthorization.url,
              token: transaction.acceptancePersonalDataAuthorization.token,
            }
          : undefined,
    };
  }
}
