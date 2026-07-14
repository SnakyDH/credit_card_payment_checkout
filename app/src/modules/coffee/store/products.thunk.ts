import { productsApiService } from "@/modules/coffee/services/products-api.service";
import {
  CoffeeProductsQuery,
  mapCoffeeFiltersToApiParams,
} from "@/modules/coffee/utils/map-coffee-filters-to-api-params";
import { mapProductToCoffee } from "@/modules/coffee/utils/map-product-to-coffee";
import { createAsyncThunk } from "@reduxjs/toolkit";

import type { Coffee } from "@/modules/coffee/model/coffee";
import type { Pagination } from "@/modules/shared/api/types/pagination";

export interface FetchProductsResult {
  items: Coffee[];
  pagination: Pagination;
}

export const fetchProducts = createAsyncThunk<
  FetchProductsResult,
  CoffeeProductsQuery,
  { rejectValue: string }
>("products/fetchProducts", async (query, { rejectWithValue }) => {
  try {
    const response = await productsApiService.getProducts(
      mapCoffeeFiltersToApiParams(query),
    );

    return {
      items: response.data.map(mapProductToCoffee),
      pagination: response.pagination,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch products";
    return rejectWithValue(message);
  }
});
