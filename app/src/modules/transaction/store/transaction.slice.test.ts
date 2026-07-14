import {
  resetTransaction,
  setTransactionResult,
  transactionReducer,
} from "@/modules/transaction/store/transaction.slice";
import {
  finishTransaction,
  initTransaction,
} from "@/modules/transaction/store/transaction.thunk";
import { TransactionStatus } from "@/modules/transaction/types/transaction-api.types";

describe("transaction slice", () => {
  const initialState = transactionReducer(undefined, { type: "@@INIT" });

  it("returns the initial state", () => {
    expect(initialState).toEqual({
      initStatus: "idle",
      finishStatus: "idle",
      init: null,
      result: null,
      error: null,
    });
  });

  it("handles initTransaction.pending", () => {
    const state = transactionReducer(
      initialState,
      initTransaction.pending("", {
        productId: 1,
        quantity: 1,
        presignedDocuments: [],
      }),
    );

    expect(state.initStatus).toBe("loading");
    expect(state.error).toBeNull();
  });

  it("handles initTransaction.fulfilled", () => {
    const payload = {
      transactionId: 10,
      status: TransactionStatus.PENDING,
      productId: 1,
      quantity: 1,
      presignedDocuments: [],
      createdAt: "2026-01-01",
    };

    const state = transactionReducer(
      initialState,
      initTransaction.fulfilled(payload, "", {
        productId: 1,
        quantity: 1,
        presignedDocuments: [],
      }),
    );

    expect(state.initStatus).toBe("succeeded");
    expect(state.init).toEqual(payload);
  });

  it("handles initTransaction.rejected", () => {
    const state = transactionReducer(
      initialState,
      initTransaction.rejected(new Error("fail"), "", {
        productId: 1,
        quantity: 1,
        presignedDocuments: [],
      }, "Init failed"),
    );

    expect(state.initStatus).toBe("failed");
    expect(state.error).toBe("Init failed");
  });

  it("handles finishTransaction.fulfilled", () => {
    const payload = {
      id: 10,
      total: 50000,
      status: TransactionStatus.APPROVED,
      deliveryFee: 5000,
      product: { name: "Coffee", quantity: 1 },
    };

    const state = transactionReducer(
      initialState,
      finishTransaction.fulfilled(payload, "", {
        transactionId: 10,
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
      }),
    );

    expect(state.finishStatus).toBe("succeeded");
    expect(state.result).toEqual(payload);
  });

  it("handles finishTransaction.pending", () => {
    const state = transactionReducer(
      initialState,
      finishTransaction.pending("", {
        transactionId: 10,
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
      }),
    );

    expect(state.finishStatus).toBe("loading");
    expect(state.error).toBeNull();
  });

  it("handles finishTransaction.rejected", () => {
    const state = transactionReducer(
      initialState,
      finishTransaction.rejected(new Error("fail"), "", {
        transactionId: 10,
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
      }, "Payment failed"),
    );

    expect(state.finishStatus).toBe("failed");
    expect(state.error).toBe("Payment failed");
  });

  it("handles setTransactionResult", () => {
    const payload = {
      id: 10,
      total: 50000,
      status: TransactionStatus.REJECTED,
      deliveryFee: 0,
      product: { name: "Coffee", quantity: 1 },
    };

    const state = transactionReducer(
      initialState,
      setTransactionResult(payload),
    );

    expect(state.finishStatus).toBe("succeeded");
    expect(state.result).toEqual(payload);
    expect(state.error).toBeNull();
  });

  it("resets to initial state", () => {
    const populated = transactionReducer(
      initialState,
      initTransaction.fulfilled(
        {
          transactionId: 10,
          status: TransactionStatus.PENDING,
          productId: 1,
          quantity: 1,
          presignedDocuments: [],
          createdAt: "2026-01-01",
        },
        "",
        {
          productId: 1,
          quantity: 1,
          presignedDocuments: [],
        },
      ),
    );

    expect(transactionReducer(populated, resetTransaction())).toEqual(
      initialState,
    );
  });
});
