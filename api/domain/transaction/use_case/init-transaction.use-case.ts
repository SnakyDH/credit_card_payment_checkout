import { ExceptionConstants } from '@domain/shared/exceptions/exception-constants';
import { ITransactionRepository } from '../repository/transaction-repository.interface';
import { IProductRepository } from '../../products/repository/product-repository.interface';
import { OrderTransaction } from '../model/transaction.model';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { Presigned } from '../../presigned/model/presigned.model';
import { PresignedType } from '../../presigned/model/presigned.type';
import { Product } from '../../products/model/product.model';
import { ExceptionCustom } from '@domain/shared/exceptions/exception-custom';
import { LoggerService } from '@config/logger.service';
import { FormatCurrency } from '@domain/shared/formatters/format-currency';

export interface InitTransactionRequest {
  productId: number;
  quantity: number;
  presignedDocuments: Presigned[];
}

export interface InitTransactionResult {
  transaction: OrderTransaction;
  presignedDocuments: Presigned[];
}

export class InitTransactionUseCase {
  private readonly logger = new LoggerService(InitTransactionUseCase.name);
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly productRepository: IProductRepository,
  ) {}

  async call(request: InitTransactionRequest): Promise<InitTransactionResult> {
    this.logger.log('Initializing Transaction', { request });
    const product: Product | null = await this.productRepository.findById(
      request.productId,
    );
    this.logger.log('Product found', { product });
    if (!product) {
      throw new ExceptionCustom(ExceptionConstants.PRODUCT_NOT_FOUND);
    }
    this.logger.log('Calculating total', { request: request });
    const total = product.price * request.quantity;

    this.logger.log('Total calculated', { total });
    const transactionData: Omit<
      OrderTransaction,
      'id' | 'createdAt' | 'delivery' | 'paymentGatewayTransactionId'
    > = {
      quantity: request.quantity,
      product,
      total,
      status: TransactionStatus.PENDING,
      acceptanceEndUserPolicy: request.presignedDocuments.find(
        (p) => p.type === PresignedType.END_USER_POLICY,
      ),
      acceptancePersonalDataAuthorization: request.presignedDocuments.find(
        (p) => p.type === PresignedType.PERSONAL_DATA_AUTH,
      ),
    };
    this.logger.log('Creating Transaction', { transactionData });
    const transaction =
      await this.transactionRepository.create(transactionData);
    this.logger.log('Transaction created', { transaction });
    const transactionFormatted = {
      ...transaction,
      total: FormatCurrency.formatToUser(transaction.total!),
    };
    return {
      transaction: transactionFormatted,
      presignedDocuments: request.presignedDocuments,
    };
  }
}
