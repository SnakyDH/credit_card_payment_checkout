import { configureStore } from "@reduxjs/toolkit";

import { transactionApiService } from "@/modules/transaction/services/transaction-api.service";
import {
  finishTransaction,
  initTransaction,
} from "@/modules/transaction/store/transaction.thunk";
import { transactionReducer } from "@/modules/transaction/store/transaction.slice";
import { TransactionStatus } from "@/modules/transaction/types/transaction-api.types";

jest.mock("@/modules/transaction/services/transaction-api.service");

const paymentRequest = {
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

describe("transaction thunks", () => {
  const createTestStore = () =>
    configureStore({
      reducer: { transaction: transactionReducer },
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initTransaction fulfills with API response", async () => {
    const response = {
      transactionId: 1,
      status: TransactionStatus.PENDING,
      productId: 1,
      quantity: 1,
      presignedDocuments: [],
      createdAt: "2026-01-01",
    };

    (transactionApiService.initTransaction as jest.Mock).mockResolvedValue(
      response,
    );

    const store = createTestStore();
    const result = await store.dispatch(
      initTransaction({
        productId: 1,
        quantity: 1,
        presignedDocuments: [],
      }),
    );

    expect(initTransaction.fulfilled.match(result)).toBe(true);
    expect(result.payload).toEqual(response);
  });

  it("initTransaction rejects with error message", async () => {
    (transactionApiService.initTransaction as jest.Mock).mockRejectedValue(
      new Error("Network error"),
    );

    const store = createTestStore();
    const result = await store.dispatch(
      initTransaction({
        productId: 1,
        quantity: 1,
        presignedDocuments: [],
      }),
    );

    expect(initTransaction.rejected.match(result)).toBe(true);
    expect(result.payload).toBe("Network error");
  });

  it("initTransaction rejects with fallback message for non-Error", async () => {
    (transactionApiService.initTransaction as jest.Mock).mockRejectedValue(
      "bad",
    );

    const store = createTestStore();
    const result = await store.dispatch(
      initTransaction({
        productId: 1,
        quantity: 1,
        presignedDocuments: [],
      }),
    );

    expect(initTransaction.rejected.match(result)).toBe(true);
    expect(result.payload).toBe("Failed to init transaction");
  });

  it("finishTransaction fulfills with API response", async () => {
    const response = {
      id: 1,
      total: 50000,
      status: TransactionStatus.APPROVED,
      deliveryFee: 5000,
      product: { name: "Coffee", quantity: 1 },
    };

    (transactionApiService.finishTransaction as jest.Mock).mockResolvedValue(
      response,
    );

    const store = createTestStore();
    const result = await store.dispatch(finishTransaction(paymentRequest));

    expect(finishTransaction.fulfilled.match(result)).toBe(true);
    expect(result.payload).toEqual(response);
  });

  it("finishTransaction rejects with error message", async () => {
    (transactionApiService.finishTransaction as jest.Mock).mockRejectedValue(
      new Error("Payment failed"),
    );

    const store = createTestStore();
    const result = await store.dispatch(finishTransaction(paymentRequest));

    expect(finishTransaction.rejected.match(result)).toBe(true);
    expect(result.payload).toBe("Payment failed");
  });

  it("finishTransaction rejects with fallback message for non-Error", async () => {
    (transactionApiService.finishTransaction as jest.Mock).mockRejectedValue(
      "bad",
    );

    const store = createTestStore();
    const result = await store.dispatch(finishTransaction(paymentRequest));

    expect(finishTransaction.rejected.match(result)).toBe(true);
    expect(result.payload).toBe("Failed to finish transaction");
  });
});
