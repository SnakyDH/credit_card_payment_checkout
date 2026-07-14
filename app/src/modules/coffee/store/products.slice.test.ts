import { productsReducer } from "@/modules/coffee/store/products.slice";
import { fetchProducts } from "@/modules/coffee/store/products.thunk";

describe("products slice", () => {
  const initialState = productsReducer(undefined, { type: "@@INIT" });

  it("handles fetchProducts.pending for first page", () => {
    const state = productsReducer(
      initialState,
      fetchProducts.pending("", { page: 1, limit: 10 }),
    );

    expect(state.status).toBe("loading");
    expect(state.loadingMore).toBe(false);
  });

  it("handles fetchProducts.pending for next page", () => {
    const state = productsReducer(
      initialState,
      fetchProducts.pending("", { page: 2, limit: 10 }),
    );

    expect(state.loadingMore).toBe(true);
  });

  it("handles fetchProducts.fulfilled for first page", () => {
    const payload = {
      items: [{ id: "1", name: "Coffee", image: "", price: 1000, stockAvailable: 5 }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };

    const state = productsReducer(
      initialState,
      fetchProducts.fulfilled(payload, "", { page: 1, limit: 10 }),
    );

    expect(state.status).toBe("succeeded");
    expect(state.items).toEqual(payload.items);
    expect(state.pagination).toEqual(payload.pagination);
  });

  it("appends items when loading more", () => {
    const existing = productsReducer(
      initialState,
      fetchProducts.fulfilled(
        {
          items: [{ id: "1", name: "Coffee", image: "", price: 1000, stockAvailable: 5 }],
          pagination: { page: 1, limit: 10, total: 2, totalPages: 2 },
        },
        "",
        { page: 1, limit: 10 },
      ),
    );

    const state = productsReducer(
      existing,
      fetchProducts.fulfilled(
        {
          items: [{ id: "2", name: "Latte", image: "", price: 2000, stockAvailable: 3 }],
          pagination: { page: 2, limit: 10, total: 2, totalPages: 2 },
        },
        "",
        { page: 2, limit: 10 },
      ),
    );

    expect(state.items).toHaveLength(2);
    expect(state.loadingMore).toBe(false);
  });

  it("handles fetchProducts.rejected on first page", () => {
    const state = productsReducer(
      initialState,
      fetchProducts.rejected(new Error("fail"), "", { page: 1, limit: 10 }, "Failed"),
    );

    expect(state.status).toBe("failed");
    expect(state.error).toBe("Failed");
  });

  it("handles fetchProducts.rejected on next page without changing status", () => {
    const existing = productsReducer(
      initialState,
      fetchProducts.fulfilled(
        {
          items: [{ id: "1", name: "Coffee", image: "", price: 1000, stockAvailable: 5 }],
          pagination: { page: 1, limit: 10, total: 2, totalPages: 2 },
        },
        "",
        { page: 1, limit: 10 },
      ),
    );

    const state = productsReducer(
      existing,
      fetchProducts.rejected(new Error("fail"), "", { page: 2, limit: 10 }, "Failed"),
    );

    expect(state.status).toBe("succeeded");
    expect(state.loadingMore).toBe(false);
  });
});
