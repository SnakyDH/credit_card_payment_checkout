export class FormatCurrency {
  static formatToUser(amount: number): number {
    return amount / 100;
  }
}
