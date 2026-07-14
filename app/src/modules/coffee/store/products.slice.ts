import { fetchProducts } from "@/modules/coffee/store/products.thunk";
import { createSlice } from "@reduxjs/toolkit";

import type { Coffee } from "@/modules/coffee/model/coffee";
import type { Pagination } from "@/modules/shared/api/types/pagination";

export type ProductsStatus = "idle" | "loading" | "succeeded" | "failed";

export interface ProductsState {
  items: Coffee[];
  status: ProductsStatus;
  error: string | null;
  pagination: Pagination | null;
  loadingMore: boolean;
}

const initialState: ProductsState = {
  items: [],
  status: "idle",
  error: null,
  pagination: null,
  loadingMore: false,
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state, action) => {
        const page = action.meta.arg.page ?? 1;
        if (page > 1) {
          state.loadingMore = true;
        } else {
          state.status = "loading";
          state.error = null;
        }
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        const page = action.meta.arg.page ?? 1;
        state.status = "succeeded";
        state.loadingMore = false;
        state.pagination = action.payload.pagination;
        state.items =
          page > 1
            ? [...state.items, ...action.payload.items]
            : action.payload.items;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        const page = action.meta.arg.page ?? 1;
        state.loadingMore = false;
        if (page > 1) {
          state.status = "succeeded";
        } else {
          state.status = "failed";
          state.error = action.payload ?? "Failed to fetch products";
        }
      });
  },
});

export const productsReducer = productsSlice.reducer;
