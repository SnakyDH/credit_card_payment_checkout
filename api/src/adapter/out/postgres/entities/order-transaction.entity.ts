import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderTransaction } from '../../../../../domain/transaction/model/transaction.model';
import { TransactionStatus } from '../../../../../domain/transaction/enums/transaction-status.enum';
import { DeliveryEntity } from './delivery.entity';
import { ProductEntity } from './product.entity';

@Entity('order_transactions')
export class OrderTransactionEntity implements Omit<
  OrderTransaction,
  | 'product'
  | 'delivery'
  | 'acceptanceEndUserPolicy'
  | 'acceptancePersonalDataAuthorization'
> {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  paymentGatewayTransactionId?: string;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  total?: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column()
  productId: number;

  @Column({ nullable: true })
  deliveryId?: number;

  @Column({ nullable: true })
  acceptanceEndUserPolicyUrl?: string;

  @Column({ nullable: true })
  acceptanceEndUserPolicyToken?: string;

  @Column({ nullable: true })
  acceptancePersonalDataAuthorizationUrl?: string;

  @Column({ nullable: true })
  acceptancePersonalDataAuthorizationToken?: string;

  @ManyToOne(() => ProductEntity, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @ManyToOne(() => DeliveryEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'deliveryId' })
  delivery?: DeliveryEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
