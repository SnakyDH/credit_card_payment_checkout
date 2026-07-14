import { productsApiService } from "@/modules/coffee/services/products-api.service";
import { apiClient } from "@/modules/shared/api/api-client";

jest.mock("@/modules/shared/api/api-client");

describe("productsApiService", () => {
  it("calls getProducts with params", async () => {
    (apiClient as jest.Mock).mockResolvedValue({ data: [], pagination: {} });

    await productsApiService.getProducts({ page: 1, limit: 10 });

    expect(apiClient).toHaveBeenCalledWith("/products", {
      params: { page: 1, limit: 10 },
    });
  });
});
