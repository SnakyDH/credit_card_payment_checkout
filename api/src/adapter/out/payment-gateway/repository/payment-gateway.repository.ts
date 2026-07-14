import { IPaymentGatewayRepository } from '@domain/transaction/repository/payment-gateway-repository.interface';
import { PaymentCard } from '@domain/transaction/model/credit-card.model';
import { PostCardTokenizedResponseDto } from '../dtos/post-card-tokenized-response.dto';
import { envConstants } from '@config/env-constants';
import { PostCardTokenizedRequestDto } from '../dtos/post-card-tokenized-request.dto';
import { OrderTransaction } from '@domain/transaction/model/transaction.model';
import * as crypto from 'crypto';
import { PostCreateTransactionRequestDto } from '../dtos/post-create-transaction-request.dto';
import {
  PostCreateTransactionResponseDto,
  GatewayTransactionStatus,
} from '../dtos/post-create-transaction-response.dto';
import { PaymentResult } from '@domain/transaction/model/payment-result.model';
import { GatewayStatusMapper } from '../mappers/gateway-status.mapper';
import { GetGatewayTransactionResponseDto } from '../dtos/get-gateway-transaction-response.dto';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from '@config/logger.service';
import { GatewayErrorMapper } from '../mappers/gateway-error.mapper';

export class PaymentGatewayRepository implements IPaymentGatewayRepository {
  private readonly logger = new LoggerService(PaymentGatewayRepository.name);
  constructor(private readonly paymentGatewayService: HttpService) {}

  private readonly projectKey = 'SnakyDev';

  async pay(
    transaction: OrderTransaction,
    paymentCard: PaymentCard,
  ): Promise<PaymentResult> {
    this.logger.log('Paying Transaction', { transaction, paymentCard });
    const tokenizedCard = await this.tokenizeCard({
      number: paymentCard.number,
      cvc: paymentCard.cvv,
      exp_month: paymentCard.expirationMonth,
      exp_year: paymentCard.expirationYear,
      card_holder: paymentCard.holderName,
    });
    this.logger.log('Tokenized card', { tokenizedCard });
    const amountInCents = transaction.total! * 100;
    const signature = `${this.projectKey}-${transaction.id}${amountInCents}COP${envConstants.paymentGateway.integrityKey}`;
    const encryptedSignature = crypto
      .createHash('sha256')
      .update(signature)
      .digest('hex');
    this.logger.log('Encrypted signature', { encryptedSignature });
    const createTransactionRequest: PostCreateTransactionRequestDto = {
      acceptance_token: transaction.acceptanceEndUserPolicyToken!,
      amount_in_cents: amountInCents,
      currency: 'COP',
      signature: encryptedSignature,
      customer_email: transaction.delivery!.customerEmail,
      payment_method: {
        type: 'CARD',
        token: tokenizedCard.data.id,
        installments: 1,
      },
      reference: `${this.projectKey}-${transaction.id}`,
      customer_data: {
        full_name: transaction.delivery!.customer,
      },
      shipping_address: {
        address_line_1: transaction.delivery!.address,
        city: transaction.delivery!.city,
        country: transaction.delivery!.country,
        phone_number: transaction.delivery!.phone,
        postal_code: transaction.delivery!.postalCode,
        region: transaction.delivery!.region,
      },
    };
    this.logger.log('Create transaction request', { createTransactionRequest });
    const creationResult = await this.createTransaction(
      createTransactionRequest,
    );
    this.logger.log('Creation result', { creationResult });

    if (creationResult.data.status !== GatewayTransactionStatus.PENDING) {
      this.logger.log('Transaction not pending', { creationResult });
      return {
        id: creationResult.data.id,
        status: GatewayStatusMapper.map(creationResult.data.status),
      };
    }
    let retries = 5;
    let transactionStatus = GatewayTransactionStatus.PENDING;
    while (
      retries > 0 &&
      transactionStatus === GatewayTransactionStatus.PENDING
    ) {
      this.logger.log('Getting transaction status', {
        transactionId: creationResult.data.id,
      });
      const transactionStatusResponse = await this.getTransaction(
        creationResult.data.id,
      );
      this.logger.log('Transaction status response', {
        transactionStatusResponse,
      });
      transactionStatus = transactionStatusResponse.data
        .status as GatewayTransactionStatus;
      retries--;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return {
      id: creationResult.data.id,
      status: GatewayStatusMapper.map(transactionStatus),
    };
  }

  private async getTransaction(
    transactionId: string,
  ): Promise<GetGatewayTransactionResponseDto> {
    const request: AxiosRequestConfig = {
      method: 'GET',
      url: `/v1/transactions/${transactionId}`,
    };
    this.logger.log('Getting transaction', { request });
    try {
      const { data } = await firstValueFrom(
        this.paymentGatewayService.request<GetGatewayTransactionResponseDto>(
          request,
        ),
      );
      this.logger.log('Transaction data', { data });
      return data;
    } catch (error) {
      this.logger.error('Error getting transaction', {
        error: error as Error,
      });
      throw GatewayErrorMapper.fromUnknown(error);
    }
  }

  private async createTransaction(
    gatewayRequest: PostCreateTransactionRequestDto,
  ): Promise<PostCreateTransactionResponseDto> {
    const request: AxiosRequestConfig = {
      method: 'POST',
      url: '/v1/transactions',
      data: gatewayRequest,
      headers: {
        Authorization: `Bearer ${envConstants.paymentGateway.privateKey}`,
      },
    };
    this.logger.log('Creating transaction', { request });
    try {
      const { data } = await firstValueFrom(
        this.paymentGatewayService.request<PostCreateTransactionResponseDto>(
          request,
        ),
      );
      this.logger.log('Transaction data', { data });
      return data;
    } catch (error) {
      this.logger.error('Error creating transaction', {
        error: error as Error,
      });
      throw GatewayErrorMapper.fromUnknown(error);
    }
  }
  private async tokenizeCard(
    paymentCard: PostCardTokenizedRequestDto,
  ): Promise<PostCardTokenizedResponseDto> {
    this.logger.log('Tokenizing card', { paymentCard });
    const request: AxiosRequestConfig = {
      method: 'POST',
      url: '/v1/tokens/cards',
      data: paymentCard,
    };
    try {
      const { data } = await firstValueFrom(
        this.paymentGatewayService.request<PostCardTokenizedResponseDto>(
          request,
        ),
      );
      this.logger.log('Tokenized card data', { data });
      return data;
    } catch (error) {
      this.logger.error('Error tokenizing card', { error: error as Error });
      throw GatewayErrorMapper.fromUnknown(error);
    }
  }
}
