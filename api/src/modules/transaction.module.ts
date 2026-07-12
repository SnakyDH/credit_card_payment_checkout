import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderTransactionEntity } from '../adapter/out/postgres/entities/order-transaction.entity';
import { TransactionRepositoryImpl } from '@adapter/out/postgres/repository/transaction.repository-impl';
import { TransactionController } from '../adapter/in/controllers/transaction.controller';
import { InitTransactionHandler } from '../adapter/in/handlers/init-transaction.handler';
import { InitTransactionUseCase } from '../../domain/transaction/use_case/init-transaction.use-case';
import { HttpExceptionHandler } from '../adapter/in/handlers/http-exception.handler';
import { ProductsModule } from './products.module';
import { PresignedModule } from './presigned.module';
import { DeliveryModule } from './delivery.module';
import { PaymentModule } from './payment.module';
import { ITransactionRepository } from '@domain/transaction/repository/transaction-repository.interface';
import { IProductRepository } from '@domain/products/repository/product-repository.interface';
import { FinishTransactionUseCase } from '@domain/transaction/use_case/finish-transaction.use-case';
import { IPaymentGatewayRepository } from '@domain/transaction/repository/payment-gateway-repository.interface';
import { IDeliveryRepository } from '@domain/delivery/repository/delivery-repository.interface';
import { GetTransactionByIdUseCase } from '@domain/transaction/use_case/get-transaction-by-id.use-case';
import { GetTransactionByIdHandler } from '@adapter/in/handlers/get-transaction-by-id.handler';
import { FinishTransactionHandler } from '@adapter/in/handlers/finish-transaction.handler';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderTransactionEntity]),
    ProductsModule,
    PresignedModule,
    DeliveryModule,
    PaymentModule,
  ],
  controllers: [TransactionController],
  providers: [
    {
      provide: 'ITransactionRepository',
      useClass: TransactionRepositoryImpl,
    },
    {
      provide: InitTransactionUseCase,
      useFactory: (
        transactionRepo: ITransactionRepository,
        productRepo: IProductRepository,
      ) => {
        return new InitTransactionUseCase(transactionRepo, productRepo);
      },
      inject: ['ITransactionRepository', 'IProductRepository'],
    },
    {
      provide: InitTransactionHandler,
      useFactory: (initTransactionUseCase: InitTransactionUseCase) =>
        new InitTransactionHandler(initTransactionUseCase),
      inject: [InitTransactionUseCase],
    },
    {
      provide: FinishTransactionUseCase,
      useFactory: (
        transactionRepo: ITransactionRepository,
        productRepo: IProductRepository,
        deliveryRepo: IDeliveryRepository,
        paymentGatewayRepo: IPaymentGatewayRepository,
      ) =>
        new FinishTransactionUseCase(
          transactionRepo,
          productRepo,
          deliveryRepo,
          paymentGatewayRepo,
        ),
      inject: [
        'ITransactionRepository',
        'IProductRepository',
        'IDeliveryRepository',
        'IPaymentGatewayRepository',
      ],
    },
    {
      provide: GetTransactionByIdUseCase,
      useFactory: (transactionRepo: ITransactionRepository) =>
        new GetTransactionByIdUseCase(transactionRepo),
      inject: ['ITransactionRepository'],
    },
    {
      provide: GetTransactionByIdHandler,
      useFactory: (getTransactionByIdUseCase: GetTransactionByIdUseCase) =>
        new GetTransactionByIdHandler(getTransactionByIdUseCase),
      inject: [GetTransactionByIdUseCase],
    },
    {
      provide: FinishTransactionHandler,
      useFactory: (finishTransactionUseCase: FinishTransactionUseCase) =>
        new FinishTransactionHandler(finishTransactionUseCase),
      inject: [FinishTransactionUseCase],
    },
    HttpExceptionHandler,
  ],
  exports: ['ITransactionRepository'],
})
export class TransactionModule {}
