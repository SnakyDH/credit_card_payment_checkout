import { OrderType } from "@/modules/shared/pagination/order-type";
import { PaginatedResponse } from "@/modules/shared/api/types/pagination";

export interface ProductResponse {
  id: number;
  name: string;
  image: string;
  price: number;
  stock: number;
}

export type GetProductsResponse = PaginatedResponse<ProductResponse>;

export interface GetProductsParams {
  page?: number;
  limit?: number;
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
  orderByField?: "id" | "name" | "image" | "price" | "stock";
  orderByType?: OrderType;
}
