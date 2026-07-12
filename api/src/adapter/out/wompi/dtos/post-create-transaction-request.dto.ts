export class PostCreateTransactionRequestDto {
  acceptance_token: string;
  amount_in_cents: number;
  currency: string;
  signature: string;
  customer_email: string;
  payment_method: {
    type: string;
    installments: number;
    token: string;
  };
  reference: string;
  customer_data: {
    full_name: string;
  };
  shipping_address: {
    address_line_1: string;
    country: string;
    region: string;
    city: string;
    phone_number: string;
    postal_code: string;
  };
}