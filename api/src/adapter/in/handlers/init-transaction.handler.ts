import { PresignedType } from '@domain/presigned/model/presigned.type';
import { InitTransactionUseCase } from '@domain/transaction/use_case/init-transaction.use-case';
import { InitTransactionRequestDto } from '@adapter/in/dtos/request/init-transaction-request.dto';
import { InitTransactionResponseDto } from '@adapter/in/dtos/response/init-transaction-response.dto';

export class InitTransactionHandler {
  constructor(
    private readonly initTransactionUseCase: InitTransactionUseCase,
  ) {}

  async call(
    request: InitTransactionRequestDto,
  ): Promise<InitTransactionResponseDto> {
    const result = await this.initTransactionUseCase.call({
      productId: request.productId,
      quantity: request.quantity,
      presignedDocuments: request.presignedDocuments.map((presigned) => ({
        url: presigned.url,
        type: presigned.type as PresignedType,
        token: presigned.token,
      })),
    });

    return {
      transactionId: result.transaction.id,
      status: result.transaction.status,
      productId: result.transaction.product.id,
      quantity: result.transaction.quantity,
      total: result.transaction.total,
      presignedDocuments: result.presignedDocuments.map((presigned) => ({
        url: presigned.url,
        type: presigned.type,
        token: presigned.token,
      })),
      createdAt: result.transaction.createdAt,
    };
  }
}
