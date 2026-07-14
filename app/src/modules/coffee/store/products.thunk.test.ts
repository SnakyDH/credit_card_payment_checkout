import { configureStore } from "@reduxjs/toolkit";

import { productsApiService } from "@/modules/coffee/services/products-api.service";
import { productsReducer } from "@/modules/coffee/store/products.slice";
import {
  FetchProductsResult,
  fetchProducts,
} from "@/modules/coffee/store/products.thunk";

jest.mock("@/modules/coffee/services/products-api.service");

describe("products thunk", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetchProducts fulfills with mapped products", async () => {
    (productsApiService.getProducts as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 1,
          name: "Coffee",
          image: "https://example.com/coffee.jpg",
          price: 1000,
          stock: 5,
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const store = configureStore({ reducer: { products: productsReducer } });
    const result = await store.dispatch(fetchProducts({ page: 1, limit: 10 }));

    expect(fetchProducts.fulfilled.match(result)).toBe(true);
    expect((result.payload as unknown as FetchProductsResult).items[0]).toEqual(
      {
        id: "1",
        name: "Coffee",
        image: "https://example.com/coffee.jpg",
        price: 1000,
        stockAvailable: 5,
      },
    );
  });

  it("fetchProducts rejects with error message", async () => {
    (productsApiService.getProducts as jest.Mock).mockRejectedValue(
      new Error("Request failed"),
    );

    const store = configureStore({ reducer: { products: productsReducer } });
    const result = await store.dispatch(fetchProducts({ page: 1, limit: 10 }));

    expect(fetchProducts.rejected.match(result)).toBe(true);
    expect(result.payload).toBe("Request failed");
  });

  it("fetchProducts rejects with fallback message for non-Error", async () => {
    (productsApiService.getProducts as jest.Mock).mockRejectedValue("bad");

    const store = configureStore({ reducer: { products: productsReducer } });
    const result = await store.dispatch(fetchProducts({ page: 1, limit: 10 }));

    expect(fetchProducts.rejected.match(result)).toBe(true);
    expect(result.payload).toBe("Failed to fetch products");
  });
});
