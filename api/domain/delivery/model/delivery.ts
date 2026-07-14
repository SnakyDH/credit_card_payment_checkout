export interface Delivery {
  id: number;
  customer: string;
  customerEmail: string;
  address: string;
  country: string;
  region: string;
  city: string;
  postalCode: string;
  phone: string;
  fee?: number;
}
