import {
  IsInt,
  IsOptional,
  Min,
  IsString,
  IsEnum,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderType } from '@domain/shared/pagination/order-type.enum';
export class GetProductsRequestDto {
  @ApiProperty({
    description: 'Page number for pagination',
    minimum: 1,
    default: 1,
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'The page must be an integer' })
  @Min(1, { message: 'The page must be greater than or equal to 1' })
  page: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    minimum: 1,
    default: 10,
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'The limit must be an integer' })
  @Min(1, { message: 'The limit must be greater than or equal to 1' })
  limit: number = 10;

  @ApiProperty({
    description: 'Filter products by name (partial match)',
    example: 'laptop',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'The name must be a string' })
  name?: string;

  @ApiProperty({
    description: 'Minimum price filter',
    minimum: 0,
    example: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'The minPrice must be an integer' })
  @Min(0, { message: 'The minPrice must be greater than or equal to 0' })
  minPrice?: number;

  @ApiProperty({
    description: 'Maximum price filter',
    minimum: 0,
    example: 2000,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'The maxPrice must be an integer' })
  @Min(0, { message: 'The maxPrice must be greater than or equal to 0' })
  maxPrice?: number;

  @ApiProperty({
    description: 'Minimum stock filter',
    minimum: 0,
    example: 5,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'The minStock must be an integer' })
  @Min(0, { message: 'The minStock must be greater than or equal to 0' })
  minStock?: number;

  @ApiProperty({
    description: 'Maximum stock filter',
    minimum: 0,
    example: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'The maxStock must be an integer' })
  @Min(0, { message: 'The maxStock must be greater than or equal to 0' })
  maxStock?: number;

  @ApiProperty({
    description: 'Field to order by',
    enum: ['id', 'name', 'image', 'price', 'stock'],
    example: 'price',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'The orderBy field must be a string' })
  @IsIn(['id', 'name', 'image', 'price', 'stock'], {
    message: 'The orderBy field must be one of: id, name, image, price, stock',
  })
  orderByField?: string;

  @ApiProperty({
    description: 'Order type (ascending or descending)',
    enum: OrderType,
    example: OrderType.ASC,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderType, { message: 'The order must be ASC or DESC' })
  orderByType?: OrderType;
}
