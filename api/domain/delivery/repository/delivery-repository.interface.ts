import { Delivery } from '../model/delivery';

export interface IDeliveryRepository {
  create(delivery: Omit<Delivery, 'id'>): Promise<Delivery>;
  findById(id: number): Promise<Delivery>;
  update(id: number, delivery: Partial<Delivery>): Promise<Delivery>;
}
