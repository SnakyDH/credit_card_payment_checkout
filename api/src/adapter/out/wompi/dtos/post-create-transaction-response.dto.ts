export class PostCreateTransactionResponseDto {
  data: {
    id: string;
    created_at: string;
    finalized_at: string | null;
    amount_in_cents: number;
    reference: string;
    customer_email: string;
    currency: string;
    payment_method_type: string;
    payment_method: {
      type: string;
      extra: {
        bin: string;
        name: string;
        brand: string;
        exp_year: string;
        card_type: string;
        exp_month: string;
        last_four: string;
        card_holder: string;
        is_three_ds: boolean;
        three_ds_auth_type: string | null;
      };
      installments: number;
    };
    status: WompiTransactionStatus;
    status_message: string | null;
    billing_data: any | null;
    shipping_address: {
      address_line_1: string;
      country: string;
      region: string;
      city: string;
      phone_number: string;
      postal_code: string;
    };
    redirect_url: string | null;
    payment_source_id: string | null;
    payment_link_id: string | null;
    customer_data: {
      full_name: string;
    };
    bill_id: string | null;
    taxes: any[];
    tip_in_cents: number | null;
  };
  meta: any;
}

export enum WompiTransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  ERROR = 'ERROR',
  VOIDED = 'VOIDED',
}
