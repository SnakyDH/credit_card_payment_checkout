import { OrderType } from "@/modules/shared/pagination/order-type";
import { Coffee } from "./coffee";

export interface CoffeeSearchFilters {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
  orderBy?: CoffeeOrderBy;
}

export interface CoffeeOrderBy {
  field: keyof Coffee;
  order: OrderType;
}
