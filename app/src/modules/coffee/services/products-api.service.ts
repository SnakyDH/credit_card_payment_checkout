import { apiClient } from "@/modules/shared/api/api-client";
import {
  GetProductsParams,
  GetProductsResponse,
} from "@/modules/coffee/types/product-api.types";

export const productsApiService = {
  getProducts(params?: GetProductsParams): Promise<GetProductsResponse> {
    return apiClient<GetProductsResponse>("/products", { params });
  },
};
