import { ApiProperty } from '@nestjs/swagger';

class ProductDto {
  @ApiProperty({
    example: 'Product name',
    description: 'Product name',
  })
  name: string;

  @ApiProperty({
    example: 2,
    description: 'Product quantity',
  })
  quantity: number;
}

export class FinishTransactionResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Transaction ID',
  })
  id: number;

  @ApiProperty({
    example: 100,
    description: 'Transaction total',
  })
  total: number;

  @ApiProperty({
    example: 'pending',
    description: 'Transaction status',
  })
  status: string;

  @ApiProperty({
    example: 10,
    description: 'Delivery fee',
  })
  deliveryFee: number;

  @ApiProperty({
    type: ProductDto,
  })
  product: ProductDto;
}
