import { IProductRepository } from '@domain/products/repository/product-repository.interface';
import { ITransactionRepository } from '../repository/transaction-repository.interface';
import { IDeliveryRepository } from '@domain/delivery/repository/delivery-repository.interface';
import { IPaymentGatewayRepository } from '../repository/payment-gateway-repository.interface';
import { ExceptionCustom } from '@domain/shared/exceptions/exception-custom';
import { ExceptionConstants } from '@domain/shared/exceptions/exception-constants';
import { OrderTransaction } from '../model/transaction.model';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { PaymentCard } from '../model/credit-card.model';
import { Delivery } from '@domain/delivery/model/delivery';
import { LoggerService } from '@config/logger.service';
import { FormatCurrency } from '@domain/shared/formatters/format-currency';

export interface FinishTransactionRequest {
  transactionId: number;
  paymentCard: PaymentCard;
  delivery: Omit<Delivery, 'id'>;
}

export interface FinishTransactionResult {
  transaction: OrderTransaction;
}

export class FinishTransactionUseCase {
  private readonly logger = new LoggerService(FinishTransactionUseCase.name);
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly productsRepository: IProductRepository,
    private readonly deliveryRepository: IDeliveryRepository,
    private readonly paymentGatewayRepository: IPaymentGatewayRepository,
  ) {}

  async call(
    request: FinishTransactionRequest,
  ): Promise<FinishTransactionResult> {
    this.logger.log('Finishing Transaction', { request });
    const transaction = await this.transactionRepository.findById(
      request.transactionId,
    );
    this.logger.log('Transaction found', { transaction });
    if (!transaction) {
      throw new ExceptionCustom(ExceptionConstants.TRANSACTION_NOT_FOUND);
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new ExceptionCustom(
        ExceptionConstants.TRANSACTION_ALREADY_FINISHED,
      );
    }

    if (transaction.product.stock < transaction.quantity) {
      throw new ExceptionCustom(ExceptionConstants.PRODUCT_OUT_OF_STOCK);
    }
    if (!transaction.delivery) {
      this.logger.log('Creating Delivery', { request: request });
      transaction.delivery = await this.deliveryRepository.create(
        request.delivery,
      );
      this.logger.log('Delivery created', { transaction: transaction });
    } else {
      this.logger.log('Updating Delivery', { request: request });
      transaction.delivery = await this.deliveryRepository.update(
        transaction.delivery.id,
        transaction.delivery,
      );
      this.logger.log('Delivery updated', { transaction: transaction });
    }
    this.logger.log('Paying Transaction', { request: request });
    const paymentResult = await this.paymentGatewayRepository.pay(
      transaction,
      request.paymentCard,
    );
    this.logger.log('Payment result', { paymentResult });
    if (paymentResult.status == TransactionStatus.APPROVED) {
      this.logger.log('Updating Product Stock', { request: request });
      await this.productsRepository.updateStock(
        transaction.product.id,
        transaction.product.stock - transaction.quantity,
      );
    }
    this.logger.log('Updating Transaction Status', { request: request });
    transaction.status = paymentResult.status;
    transaction.paymentGatewayTransactionId = paymentResult.id;
    this.logger.log('Updating Transaction', { request: request });
    await this.transactionRepository.update(transaction.id, transaction);
    if (paymentResult.status == TransactionStatus.REJECTED) {
      throw new ExceptionCustom(ExceptionConstants.TRANSACTION_REJECTED);
    }
    this.logger.log('Transaction finished', { request: request });
    const transactionFormatted = {
      ...transaction,
      total: FormatCurrency.formatToUser(transaction.total!),
    };
    return {
      transaction: transactionFormatted,
    };
  }
}
