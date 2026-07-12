import { Module } from '@nestjs/common';
import { PaymentWompiRepository } from '../adapter/out/wompi/repository/payment-wompi.repository';
import { HttpModule, HttpService } from '@nestjs/axios';
import { envConstants } from '@config/env-constants';

@Module({
  imports: [
    HttpModule.register({
      baseURL: envConstants.wompi.baseUrl,
      headers: {
        Authorization: `Bearer ${envConstants.wompi.publicKey}`,
      },
    }),
  ],
  providers: [
    {
      provide: 'IPaymentGatewayRepository',
      useFactory: (httpService: HttpService) =>
        new PaymentWompiRepository(httpService),
      inject: [HttpService],
    },
  ],
  exports: ['IPaymentGatewayRepository'],
})
export class PaymentModule {}
