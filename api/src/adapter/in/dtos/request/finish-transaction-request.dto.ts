import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class PaymentCardDto {
  @ApiProperty()
  @IsString()
  number: string;

  @ApiProperty()
  @IsString()
  @MaxLength(4)
  cvc: string;

  @ApiProperty()
  @IsString()
  @MaxLength(2)
  expMonth: string;

  @ApiProperty()
  @IsString()
  @MaxLength(2)
  expYear: string;

  @ApiProperty()
  @IsString()
  holderName: string;
}

class DeliveryDto {
  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  region: string;

  @ApiProperty()
  @IsString()
  postalCode: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  customerEmail: string;

  @ApiProperty()
  @IsString()
  customer: string;
}

export class FinishTransactionRequestDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  transactionId: number;

  @ApiProperty({
    type: PaymentCardDto,
  })
  @ValidateNested()
  @Type(() => PaymentCardDto)
  paymentCard: PaymentCardDto;

  @ApiProperty({
    type: DeliveryDto,
  })
  @ValidateNested()
  @Type(() => DeliveryDto)
  delivery: DeliveryDto;
}
