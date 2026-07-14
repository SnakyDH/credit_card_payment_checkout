import { transactionApiService } from "@/modules/transaction/services/transaction-api.service";
import { apiClient } from "@/modules/shared/api/api-client";

jest.mock("@/modules/shared/api/api-client");

describe("transactionApiService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls initTransaction endpoint", async () => {
    const request = {
      productId: 1,
      quantity: 1,
      presignedDocuments: [],
    };

    (apiClient as jest.Mock).mockResolvedValue({ transactionId: 1 });

    await transactionApiService.initTransaction(request);

    expect(apiClient).toHaveBeenCalledWith("/transactions/init-transaction", {
      method: "POST",
      body: request,
    });
  });

  it("calls finishTransaction endpoint", async () => {
    const request = {
      transactionId: 1,
      paymentCard: {
        number: "4111111111111111",
        cvc: "123",
        expMonth: "12",
        expYear: "30",
        holderName: "TEST USER",
      },
      delivery: {
        address: "Street 1",
        city: "Bogota",
        region: "Cundinamarca",
        postalCode: "110111",
        country: "CO",
        phone: "3001234567",
        customerEmail: "test@example.com",
        customer: "Test User",
      },
    };

    (apiClient as jest.Mock).mockResolvedValue({ id: 1 });

    await transactionApiService.finishTransaction(request);

    expect(apiClient).toHaveBeenCalledWith("/transactions/finish-transaction", {
      method: "POST",
      body: request,
    });
  });

  it("calls getApprovedTransactionById endpoint", async () => {
    (apiClient as jest.Mock).mockResolvedValue({ id: 1 });

    await transactionApiService.getApprovedTransactionById(42);

    expect(apiClient).toHaveBeenCalledWith(
      "/transactions/approved-transaction-by-id/42",
    );
  });
});
