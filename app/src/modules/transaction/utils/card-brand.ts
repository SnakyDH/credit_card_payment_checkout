export enum CardBrand {
  VISA = "VISA",
  MASTERCARD = "MASTERCARD",
  UNKNOWN = "UNKNOWN",
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function detectCardBrand(digits: string): CardBrand {
  if (/^4/.test(digits)) {
    return CardBrand.VISA;
  }

  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) {
    return CardBrand.MASTERCARD;
  }

  return CardBrand.UNKNOWN;
}

export function formatCardNumber(value: string): string {
  const digits = onlyDigits(value).slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function luhnIsValid(digits: string): boolean {
  if (digits.length !== 16) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function isExpiryValid(month: string, year: string): boolean {
  if (month.length !== 2 || year.length !== 2) {
    return false;
  }

  const monthNumber = Number(month);
  const yearNumber = Number(year);

  if (monthNumber < 1 || monthNumber > 12) {
    return false;
  }

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (yearNumber < currentYear) {
    return false;
  }

  if (yearNumber === currentYear && monthNumber < currentMonth) {
    return false;
  }

  return true;
}

export function maskCardNumber(number: string): string {
  const digits = onlyDigits(number);
  const lastFour = digits.slice(-4).padStart(4, "0");
  return `**** **** **** ${lastFour}`;
}
