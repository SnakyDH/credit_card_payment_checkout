import { PresignedController } from '@adapter/in/controllers/presigned.controller';
import { GetPresignedHandler } from '@adapter/in/handlers/get-presigned-handler';
import { HttpExceptionHandler } from '@adapter/in/handlers/http-exception.handler';
import { envConstants } from '@config/env-constants';
import { GetPresignedUseCase } from '@domain/presigned/use_case/get-presigned.use-case';
import { HttpModule, HttpService } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PresignedGatewayRepository } from 'src/adapter/out/payment-gateway/repository/presigned-gateway.repository';

@Module({
  imports: [
    HttpModule.register({
      baseURL: envConstants.paymentGateway.baseUrl,
    }),
  ],
  controllers: [PresignedController],
  providers: [
    {
      provide: 'IPresignedRepository',
      useFactory: (httpService: HttpService) =>
        new PresignedGatewayRepository(httpService),
      inject: [HttpService],
    },
    {
      provide: GetPresignedUseCase,
      useFactory: (presignedRepository: PresignedGatewayRepository) =>
        new GetPresignedUseCase(presignedRepository),
      inject: ['IPresignedRepository'],
    },
    {
      provide: GetPresignedHandler,
      useFactory: (getPresignedUseCase: GetPresignedUseCase) =>
        new GetPresignedHandler(getPresignedUseCase),
      inject: [GetPresignedUseCase],
    },
    HttpExceptionHandler,
  ],
  exports: ['IPresignedRepository', GetPresignedHandler],
})
export class PresignedModule {}
