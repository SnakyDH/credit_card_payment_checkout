import {
  BACKEND_ERROR_MESSAGES,
  DEFAULT_ERROR_MESSAGE,
  isTransactionRejectedError,
  resolveErrorMessage,
} from "@/modules/shared/api/error-messages";

describe("resolveErrorMessage", () => {
  it("maps known backend codes to Spanish messages", () => {
    expect(resolveErrorMessage("TRANSACTION_REJECTED")).toBe(
      BACKEND_ERROR_MESSAGES.TRANSACTION_REJECTED,
    );
    expect(resolveErrorMessage("PRODUCT_NOT_FOUND")).toBe(
      "No encontramos el producto solicitado.",
    );
  });

  it("returns unknown or already-friendly messages unchanged", () => {
    const friendly =
      "La autorización de pago expiró. Vuelve a aceptar los términos y condiciones.";

    expect(resolveErrorMessage("Invalid request")).toBe("Invalid request");
    expect(resolveErrorMessage(friendly)).toBe(friendly);
  });

  it("returns default message when raw message is empty", () => {
    expect(resolveErrorMessage(undefined)).toBe(DEFAULT_ERROR_MESSAGE);
    expect(resolveErrorMessage("")).toBe(DEFAULT_ERROR_MESSAGE);
  });

  it("uses custom fallback when raw message is empty", () => {
    expect(resolveErrorMessage(undefined, "Bad Request")).toBe("Bad Request");
  });

  it("resolves array messages using the first element", () => {
    expect(resolveErrorMessage(["PRODUCT_OUT_OF_STOCK", "OTHER"])).toBe(
      "Lo sentimos, el producto está agotado.",
    );
  });
});

describe("isTransactionRejectedError", () => {
  it("returns true for backend code and localized message", () => {
    expect(isTransactionRejectedError("TRANSACTION_REJECTED")).toBe(true);
    expect(
      isTransactionRejectedError(BACKEND_ERROR_MESSAGES.TRANSACTION_REJECTED),
    ).toBe(true);
  });

  it("returns false for other errors", () => {
    expect(isTransactionRejectedError("PRODUCT_NOT_FOUND")).toBe(false);
    expect(isTransactionRejectedError(undefined)).toBe(false);
  });
});
