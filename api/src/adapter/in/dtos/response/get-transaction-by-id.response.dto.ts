import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty({
    description: 'Product unique identifier',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Product name',
    example: 'Coffee Machine',
  })
  name: string;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://example.com/images/coffee-machine.jpg',
  })
  image: string;

  @ApiProperty({
    description: 'Product price',
    example: 299,
  })
  price: number;
}

export class DeliveryDto {
  @ApiProperty({
    description: 'Delivery unique identifier',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Delivery address',
    example: '123 Main St',
  })
  address: string;

  @ApiProperty({
    description: 'Delivery city',
    example: 'New York',
  })
  city: string;

  @ApiProperty({
    description: 'Delivery postal code',
    example: '10001',
  })
  postalCode: string;
}

export class PresignedDto {
  @ApiProperty({
    description: 'Presigned URL',
    example: 'https://example.com/documents/policy.pdf',
  })
  url: string;

  @ApiProperty({
    description: 'Presigned token',
    example: 'abc123xyz',
  })
  token: string;
}

export class GetTransactionByIdResponseDto {
  @ApiProperty({
    description: 'Transaction unique identifier',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Payment gateway transaction ID',
    example: 'pg_12345678',
    required: false,
  })
  paymentGatewayTransactionId?: string;

  @ApiProperty({
    description: 'Product quantity',
    example: 2,
  })
  quantity: number;

  @ApiProperty({
    description: 'Transaction total amount',
    example: 598,
    required: false,
  })
  total?: number;

  @ApiProperty({
    description: 'Transaction status',
    example: 'approved',
  })
  status: string;

  @ApiProperty({
    description: 'Transaction creation date',
    example: '2023-09-10T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Product information',
    type: ProductDto,
  })
  products: ProductDto[];

  @ApiProperty({
    description: 'Delivery information',
    type: DeliveryDto,
    required: false,
  })
  delivery?: DeliveryDto;

  @ApiProperty({
    description: 'End user policy acceptance document',
    type: PresignedDto,
    required: false,
  })
  acceptanceEndUserPolicy?: PresignedDto;

  @ApiProperty({
    description: 'Personal data authorization document',
    type: PresignedDto,
    required: false,
  })
  acceptancePersonalDataAuthorization?: PresignedDto;
}
