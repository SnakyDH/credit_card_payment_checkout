import {
  CardBrand,
  detectCardBrand,
  formatCardNumber,
  isExpiryValid,
  luhnIsValid,
  maskCardNumber,
  onlyDigits,
} from "@/modules/transaction/utils/card-brand";

describe("card-brand utils", () => {
  describe("onlyDigits", () => {
    it("removes non-digit characters", () => {
      expect(onlyDigits("4111 1111-1111 1111")).toBe("4111111111111111");
    });
  });

  describe("detectCardBrand", () => {
    it("detects Visa", () => {
      expect(detectCardBrand("4111111111111111")).toBe(CardBrand.VISA);
    });

    it("detects Mastercard", () => {
      expect(detectCardBrand("5555555555554444")).toBe(CardBrand.MASTERCARD);
    });

    it("returns unknown for unsupported brands", () => {
      expect(detectCardBrand("378282246310005")).toBe(CardBrand.UNKNOWN);
    });
  });

  describe("formatCardNumber", () => {
    it("formats digits in groups of four", () => {
      expect(formatCardNumber("4111111111111111")).toBe("4111 1111 1111 1111");
    });

    it("limits to 16 digits", () => {
      expect(formatCardNumber("41111111111111111234")).toBe(
        "4111 1111 1111 1111",
      );
    });
  });

  describe("luhnIsValid", () => {
    it("validates a known valid Visa test number", () => {
      expect(luhnIsValid("4111111111111111")).toBe(true);
    });

    it("rejects invalid numbers", () => {
      expect(luhnIsValid("4111111111111112")).toBe(false);
    });

    it("rejects numbers with wrong length", () => {
      expect(luhnIsValid("411111")).toBe(false);
    });
  });

  describe("isExpiryValid", () => {
    it("accepts a future expiry date", () => {
      expect(isExpiryValid("12", "99")).toBe(true);
    });

    it("rejects invalid month", () => {
      expect(isExpiryValid("13", "99")).toBe(false);
    });

  it("rejects expired cards", () => {
    expect(isExpiryValid("01", "20")).toBe(false);
  });
  });

  describe("maskCardNumber", () => {
    it("masks all but the last four digits", () => {
      expect(maskCardNumber("4111111111111234")).toBe("**** **** **** 1234");
    });
  });
});
