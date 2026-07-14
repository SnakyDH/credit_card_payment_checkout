import { CurrencyFormatter } from "@/formatters/currency-formatter";

describe("CurrencyFormatter", () => {
  it("formats COP amounts with symbol", () => {
    const formatted = CurrencyFormatter.format(15000);
    expect(formatted).toContain("COP");
    expect(formatted).toContain("$");
  });

  it("formats COP amounts without symbol", () => {
    const formatted = CurrencyFormatter.format(15000, false);
    expect(formatted).not.toContain("COP");
  });
});
