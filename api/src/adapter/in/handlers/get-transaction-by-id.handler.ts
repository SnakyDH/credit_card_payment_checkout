import { GetTransactionByIdUseCase } from '@domain/transaction/use_case/get-transaction-by-id.use-case';
import { TransactionMapper } from '@adapter/in/mappers/transaction.mapper';
import { GetTransactionByIdResponseDto } from '@adapter/in/dtos/response/get-transaction-by-id.response.dto';

export class GetTransactionByIdHandler {
  constructor(
    private readonly getTransactionByIdUseCase: GetTransactionByIdUseCase,
  ) {}

  async call(id: number): Promise<GetTransactionByIdResponseDto> {
    const transaction = await this.getTransactionByIdUseCase.call(id);
    return TransactionMapper.toTransactionDto(transaction);
  }
}
