import { OrderType } from '@domain/shared/pagination/order-type.enum';
import { Product } from './product.model';

export interface ProductOrderBy {
  field: keyof Product;
  order: OrderType;
}

export interface ProductFilter {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
  orderBy?: ProductOrderBy;
}
