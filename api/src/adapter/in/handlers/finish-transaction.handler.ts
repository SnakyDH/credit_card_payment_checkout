import { FinishTransactionUseCase } from '@domain/transaction/use_case/finish-transaction.use-case';
import { FinishTransactionRequestDto } from '@adapter/in/dtos/request/finish-transaction-request.dto';
import { FinishTransactionResponseDto } from '@adapter/in/dtos/response/finish-transaction-response.dto';

export class FinishTransactionHandler {
  constructor(
    private readonly finishTransactionUseCase: FinishTransactionUseCase,
  ) {}

  async call(
    request: FinishTransactionRequestDto,
  ): Promise<FinishTransactionResponseDto> {
    const result = await this.finishTransactionUseCase.call({
      transactionId: request.transactionId,
      paymentCard: {
        number: request.paymentCard.number,
        cvv: request.paymentCard.cvc,
        expirationMonth: request.paymentCard.expMonth,
        expirationYear: request.paymentCard.expYear,
        holderName: request.paymentCard.holderName,
      },
      delivery: {
        address: request.delivery.address,
        city: request.delivery.city,
        region: request.delivery.region,
        phone: request.delivery.phone,
        postalCode: request.delivery.postalCode,
        country: request.delivery.country,
        customerEmail: request.delivery.customerEmail,
        customer: request.delivery.customer,
      },
    });
    return {
      id: result.transaction.id,
      status: result.transaction.status,
      product: {
        ...result.transaction.product,
        quantity: result.transaction.quantity,
      },
      total: result.transaction.total!,
      deliveryFee: result.transaction.delivery?.fee ?? 0,
    };
  }
}
