import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Delivery } from '@domain/delivery/model/delivery';

@Entity('deliveries')
export class DeliveryEntity implements Delivery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customer: string;

  @Column()
  customerEmail: string;

  @Column('text')
  address: string;

  @Column()
  country: string;

  @Column()
  region: string;

  @Column()
  city: string;

  @Column()
  postalCode: string;

  @Column()
  phone: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fee?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
