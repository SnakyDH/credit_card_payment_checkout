export class CurrencyFormatter {
  static format(amount: number, withSymbol = true): string {
    const formatted = new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "COP",
    })
      .formatToParts(amount)
      .map((part) => part.value)
      .join("")
      .replace("$", "")
      .replace("COP", "")
      .replace(".", ",");
    if (withSymbol) {
      return `$ ${formatted} COP`;
    }
    return formatted;
  }
}
