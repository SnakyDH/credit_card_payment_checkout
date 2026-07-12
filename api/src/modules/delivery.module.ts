import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryEntity } from '../adapter/out/postgres/entities/delivery.entity';
import { DeliveryRepositoryImpl } from '@adapter/out/postgres/repository/delivery.repository-impl';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryEntity])],

  providers: [
    {
      provide: 'IDeliveryRepository',
      useClass: DeliveryRepositoryImpl,
    },
  ],
  exports: ['IDeliveryRepository'],
})
export class DeliveryModule {}
