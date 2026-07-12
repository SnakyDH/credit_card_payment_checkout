import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IDeliveryRepository } from '@domain/delivery/repository/delivery-repository.interface';
import { Delivery } from '@domain/delivery/model/delivery';
import { DeliveryEntity } from '../entities/delivery.entity';
import { ExceptionCustom } from '@domain/shared/exceptions/exception-custom';
import { ExceptionConstants } from '@domain/shared/exceptions/exception-constants';
import { LoggerService } from '@config/logger.service';

@Injectable()
export class DeliveryRepositoryImpl implements IDeliveryRepository {
  private readonly logger = new LoggerService(DeliveryRepositoryImpl.name);
  constructor(
    @InjectRepository(DeliveryEntity)
    private readonly deliveryRepository: Repository<DeliveryEntity>,
  ) {}

  async create(delivery: Omit<Delivery, 'id'>): Promise<Delivery> {
    this.logger.log('Creating Delivery', { delivery });
    const deliveryEntity = this.deliveryRepository.create(delivery);
    this.logger.log('Delivery created', { deliveryEntity });
    const savedDelivery = await this.deliveryRepository.save(deliveryEntity);
    this.logger.log('Delivery saved', { savedDelivery });
    return savedDelivery;
  }

  async findById(id: number): Promise<Delivery> {
    this.logger.log('Finding Delivery by Id', { id });
    const delivery = await this.deliveryRepository.findOne({ where: { id } });
    this.logger.log('Delivery found', { delivery });
    if (!delivery) {
      throw new ExceptionCustom(ExceptionConstants.DELIVERY_NOT_FOUND);
    }

    return delivery;
  }
  async update(id: number, delivery: Partial<Delivery>): Promise<Delivery> {
    this.logger.log('Updating Delivery', { id, delivery });
    await this.deliveryRepository.update(id, delivery);
    this.logger.log('Delivery updated', { id, delivery });
    const updatedDelivery = await this.deliveryRepository.findOne({
      where: { id },
    });
    this.logger.log('Delivery updated and found', { updatedDelivery });
    if (!updatedDelivery) {
      throw new ExceptionCustom(ExceptionConstants.DELIVERY_NOT_FOUND);
    }

    return updatedDelivery;
  }
}
