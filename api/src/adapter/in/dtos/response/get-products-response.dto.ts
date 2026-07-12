import { ApiProperty } from '@nestjs/swagger';

export class GetProductResponseDto {
  @ApiProperty({
    description: 'Product unique identifier',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Product name',
    example: 'Gaming Laptop',
  })
  name: string;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://example.com/images/laptop.jpg',
  })
  image: string;

  @ApiProperty({
    description: 'Product price',
    example: 1299,
  })
  price: number;

  @ApiProperty({
    description: 'Product stock quantity',
    example: 15,
  })
  stock: number;
}

export class PaginationDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 50,
  })
  total: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;
}

export class GetProductsResponseDto {
  @ApiProperty({
    description: 'Array of products',
    type: [GetProductResponseDto],
  })
  data: GetProductResponseDto[];

  @ApiProperty({
    description: 'Pagination information',
    type: PaginationDto,
  })
  pagination: PaginationDto;
}
