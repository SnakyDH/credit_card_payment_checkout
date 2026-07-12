import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './modules/products.module';
import { typeOrmConfig } from '@config/postgres.data-source';
import { PresignedModule } from '@modules/presigned.module';
import { DeliveryModule } from './modules/delivery.module';
import { TransactionModule } from './modules/transaction.module';
import { PaymentModule } from '@modules/payment.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ProductsModule,
    PresignedModule,
    DeliveryModule,
    PaymentModule,
    TransactionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
