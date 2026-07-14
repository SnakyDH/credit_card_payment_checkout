import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, ValidateNested, IsArray } from 'class-validator';
import { PresignedDto } from '../response/init-transaction-response.dto';
import { Type } from 'class-transformer';

export class InitTransactionRequestDto {
  @ApiProperty({
    description: 'Product ID for the transaction',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  productId: number;

  @ApiProperty({
    description: 'Quantity of products',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: 'Presigned documents',
    type: [PresignedDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PresignedDto)
  presignedDocuments: PresignedDto[];
}
