import { apiClient } from "@/modules/shared/api/api-client";
import { ApiError } from "@/modules/shared/api/api-error";

jest.mock("@/modules/shared/api/api-config", () => ({
  apiConfig: { baseUrl: "http://localhost:3000/api" },
}));

describe("apiClient", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("returns parsed JSON on success", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    const result = await apiClient<{ ok: boolean }>("/products");

    expect(result).toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/products",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("throws ApiError with message from response body", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: async () => ({ message: "Invalid request" }),
    });

    await expect(apiClient("/products")).rejects.toThrow(ApiError);
    await expect(apiClient("/products")).rejects.toThrow("Invalid request");
  });

  it("maps backend exception codes to Spanish messages", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: async () => ({ message: "PRODUCT_NOT_FOUND" }),
    });

    await expect(apiClient("/products")).rejects.toThrow(ApiError);
    await expect(apiClient("/products")).rejects.toThrow(
      "No encontramos el producto solicitado.",
    );
  });

  it("throws ApiError with status text when body is not JSON", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Server Error",
      json: async () => {
        throw new Error("not json");
      },
    });

    await expect(apiClient("/products")).rejects.toThrow("Server Error");
  });

  it("sends query params and request body", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    await apiClient("/products", {
      method: "POST",
      params: { page: 2, ignored: undefined },
      body: { name: "coffee" },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/products?page=2",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "coffee" }),
      }),
    );
  });

  it("returns undefined for 204 responses", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 204,
    });

    const result = await apiClient<void>("/products", { method: "DELETE" });

    expect(result).toBeUndefined();
  });
});
