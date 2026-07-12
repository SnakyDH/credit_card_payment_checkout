import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { TransactionStatus } from '@domain/transaction/enums/transaction-status.enum';

export class PresignedDto {
  @ApiProperty({
    description: 'Presigned URL',
    example: 'https://example.com/terms',
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: 'Type of presigned document',
    example: 'END_USER_POLICY',
    enum: ['PERSONAL_DATA_AUTH', 'END_USER_POLICY'],
  })
  @IsString()
  @IsEnum(['PERSONAL_DATA_AUTH', 'END_USER_POLICY'])
  type: string;

  @ApiProperty({
    description: 'Presigned token',
    example: 'abc123token',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class InitTransactionResponseDto {
  @ApiProperty({
    description: 'Transaction ID',
    example: 1,
  })
  transactionId: number;

  @ApiProperty({
    description: 'Transaction status',
    example: 'pending',
    enum: TransactionStatus,
  })
  status: TransactionStatus;

  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  productId: number;

  @ApiProperty({
    description: 'Quantity of products',
    example: 2,
  })
  quantity: number;

  @ApiProperty({
    description: 'Total amount for the transaction',
    example: 25.99,
    required: false,
  })
  total?: number;

  @ApiProperty({
    description: 'Delivery ID if applicable',
    example: 1,
    required: false,
  })
  deliveryId?: number;

  @ApiProperty({
    description: 'Required presigned documents',
    type: [PresignedDto],
  })
  presignedDocuments: PresignedDto[];

  @ApiProperty({
    description: 'Transaction creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
