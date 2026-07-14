import { Module } from '@nestjs/common';
import { PaymentGatewayRepository } from '../adapter/out/payment-gateway/repository/payment-gateway.repository';
import { HttpModule, HttpService } from '@nestjs/axios';
import { envConstants } from '@config/env-constants';

@Module({
  imports: [
    HttpModule.register({
      baseURL: envConstants.paymentGateway.baseUrl,
      headers: {
        Authorization: `Bearer ${envConstants.paymentGateway.publicKey}`,
      },
    }),
  ],
  providers: [
    {
      provide: 'IPaymentGatewayRepository',
      useFactory: (httpService: HttpService) =>
        new PaymentGatewayRepository(httpService),
      inject: [HttpService],
    },
  ],
  exports: ['IPaymentGatewayRepository'],
})
export class PaymentModule {}
