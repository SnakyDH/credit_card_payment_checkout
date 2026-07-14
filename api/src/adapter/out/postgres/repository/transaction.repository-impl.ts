import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITransactionRepository } from '@domain/transaction/repository/transaction-repository.interface';
import { OrderTransaction } from '@domain/transaction/model/transaction.model';
import { OrderTransactionEntity } from '@adapter/out/postgres/entities/order-transaction.entity';
import { ExceptionCustom } from '@domain/shared/exceptions/exception-custom';
import { ExceptionConstants } from '@domain/shared/exceptions/exception-constants';
import { LoggerService } from '@config/logger.service';

@Injectable()
export class TransactionRepositoryImpl implements ITransactionRepository {
  private readonly logger = new LoggerService(TransactionRepositoryImpl.name);
  constructor(
    @InjectRepository(OrderTransactionEntity)
    private readonly transactionRepository: Repository<OrderTransactionEntity>,
  ) {}

  async create(
    transaction: Omit<OrderTransaction, 'id' | 'createdAt'>,
  ): Promise<OrderTransaction> {
    this.logger.log('Creating Transaction', { transaction });
    const transactionData = {
      paymentGatewayTransactionId: transaction.paymentGatewayTransactionId,
      quantity: transaction.quantity,
      total: transaction.total,
      status: transaction.status,
      productId: transaction.product.id,
      deliveryId: transaction.delivery?.id,
      acceptanceEndUserPolicyUrl: transaction.acceptanceEndUserPolicy?.url,
      acceptancePersonalDataAuthorizationUrl:
        transaction.acceptancePersonalDataAuthorization?.url,
      acceptanceEndUserPolicyToken: transaction.acceptanceEndUserPolicy!.token,
      acceptancePersonalDataAuthorizationToken:
        transaction.acceptancePersonalDataAuthorization!.token,
    };
    this.logger.log('Transaction data', { transactionData });
    const transactionEntity =
      this.transactionRepository.create(transactionData);
    this.logger.log('Transaction entity', { transactionEntity });
    const savedTransaction =
      await this.transactionRepository.save(transactionEntity);
    this.logger.log('Saved transaction', { savedTransaction });
    const completeTransaction = await this.transactionRepository.findOne({
      where: { id: savedTransaction.id },
      relations: {
        product: true,
        delivery: true,
      },
    });
    this.logger.log('Complete transaction', { completeTransaction });
    if (!completeTransaction) {
      throw new ExceptionCustom(ExceptionConstants.TRANSACTION_NOT_FOUND);
    }
    return completeTransaction;
  }

  async findById(id: number): Promise<OrderTransaction | null> {
    this.logger.log('Finding Transaction by Id', { id });
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: {
        product: true,
        delivery: true,
      },
    });
    this.logger.log('Transaction found', { transaction });
    if (!transaction) {
      throw new ExceptionCustom(ExceptionConstants.TRANSACTION_NOT_FOUND);
    }
    return transaction;
  }

  async findByPaymentGatewayId(
    paymentGatewayTransactionId: string,
  ): Promise<OrderTransaction | null> {
    this.logger.log('Finding Transaction by Payment Gateway Id', {
      paymentGatewayTransactionId,
    });
    const transaction = await this.transactionRepository.findOne({
      where: { paymentGatewayTransactionId },
      relations: {
        product: true,
        delivery: true,
      },
    });
    this.logger.log('Transaction found', { transaction });
    if (!transaction) {
      throw new ExceptionCustom(ExceptionConstants.TRANSACTION_NOT_FOUND);
    }
    return transaction;
  }

  async update(
    id: number,
    transaction: Partial<OrderTransaction>,
  ): Promise<OrderTransaction> {
    this.logger.log('Updating Transaction', { id, transaction });
    const updateData: Partial<OrderTransactionEntity> = {};

    if (transaction.paymentGatewayTransactionId !== undefined) {
      updateData.paymentGatewayTransactionId =
        transaction.paymentGatewayTransactionId;
    }
    if (transaction.quantity !== undefined) {
      updateData.quantity = transaction.quantity;
    }
    if (transaction.total !== undefined) {
      updateData.total = transaction.total;
    }
    if (transaction.status !== undefined) {
      updateData.status = transaction.status;
    }
    if (transaction.product !== undefined) {
      updateData.productId = transaction.product.id;
    }
    if (transaction.delivery !== undefined) {
      updateData.deliveryId = transaction.delivery?.id;
    }
    if (transaction.acceptanceEndUserPolicy !== undefined) {
      updateData.acceptanceEndUserPolicyUrl =
        transaction.acceptanceEndUserPolicy?.url;
    }
    if (transaction.acceptancePersonalDataAuthorization !== undefined) {
      updateData.acceptancePersonalDataAuthorizationUrl =
        transaction.acceptancePersonalDataAuthorization?.url;
    }
    this.logger.log('Update data', { updateData });
    await this.transactionRepository.update(id, updateData);
    this.logger.log('Updated transaction', { id, updateData });
    const updatedTransaction = await this.transactionRepository.findOne({
      where: { id },
      relations: {
        product: true,
        delivery: true,
      },
    });
    this.logger.log('Updated transaction', { updatedTransaction });

    if (!updatedTransaction) {
      throw new ExceptionCustom(ExceptionConstants.TRANSACTION_NOT_FOUND);
    }

    return updatedTransaction;
  }

  async findAll(): Promise<OrderTransaction[]> {
    this.logger.log('Finding All Transactions');
    const transactions = await this.transactionRepository.find({
      relations: {
        product: true,
        delivery: true,
      },
    });
    this.logger.log('Transactions found', { transactions });
    if (transactions.length === 0) {
      throw new ExceptionCustom(ExceptionConstants.TRANSACTION_NOT_FOUND);
    }
    return transactions;
  }
}
