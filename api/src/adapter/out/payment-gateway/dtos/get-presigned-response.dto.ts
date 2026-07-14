import { IsNotEmpty, IsString, IsObject } from 'class-validator';

export class GetPresignedResponseDto {
  data: Data;
}

class Data {
  id?: number;
  name?: string;
  email?: string;
  contact_name?: string;
  phone_number?: string;
  active?: boolean;
  logo_url?: null;
  legal_name?: string;
  legal_id_type?: string;
  legal_id?: string;
  public_key?: string;
  accepted_currencies?: string[];
  fraud_javascript_key?: null;
  fraud_groups?: any[];
  accepted_payment_methods?: string[];
  payment_methods?: PaymentMethod[];
  @IsNotEmpty()
  @IsObject()
  presigned_acceptance: PresignedDto;
  @IsNotEmpty()
  @IsObject()
  presigned_personal_data_auth: PresignedDto;
}

export class PaymentMethod {
  name?: string;
  payment_processors?: PaymentProcessor[];
}

export class PaymentProcessor {
  name?: string;
}

export class PresignedDto {
  @IsNotEmpty()
  @IsString()
  acceptance_token: string;
  @IsNotEmpty()
  @IsString()
  permalink: string;
  @IsNotEmpty()
  @IsString()
  type: string;
}
