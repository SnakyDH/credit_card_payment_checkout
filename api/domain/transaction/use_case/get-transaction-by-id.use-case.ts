import { ExceptionCustom } from '@domain/shared/exceptions/exception-custom';
import { ITransactionRepository } from '../repository/transaction-repository.interface';
import { ExceptionConstants } from '@domain/shared/exceptions/exception-constants';
import { OrderTransaction } from '../model/transaction.model';
import { LoggerService } from '@config/logger.service';

export class GetTransactionByIdUseCase {
  private readonly logger = new LoggerService(GetTransactionByIdUseCase.name);
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async call(id: number): Promise<OrderTransaction> {
    this.logger.log('Getting Transaction by Id', { id });
    const transaction = await this.transactionRepository.findById(id);
    this.logger.log('Transaction found', { transaction });
    if (!transaction) {
      throw new ExceptionCustom(ExceptionConstants.TRANSACTION_NOT_FOUND);
    }
    return transaction;
  }
}
