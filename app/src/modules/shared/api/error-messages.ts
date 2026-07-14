export const BACKEND_ERROR_MESSAGES: Record<string, string> = {
  PRODUCT_NOT_FOUND: "No encontramos el producto solicitado.",
  PRE_SIGNED_NOT_FOUND:
    "No pudimos obtener los documentos de aceptación. Intenta de nuevo.",
  GET_PRESIGNED_ERROR:
    "No pudimos cargar los documentos requeridos. Intenta más tarde.",
  GET_END_USER_POLICY_ERROR:
    "No pudimos cargar la política de usuario final. Intenta más tarde.",
  GET_PERSONAL_DATA_AUTH_ERROR:
    "No pudimos cargar la autorización de datos personales. Intenta más tarde.",
  DELIVERY_NOT_FOUND: "No encontramos la información de entrega.",
  TRANSACTION_NOT_FOUND: "No encontramos la transacción.",
  TRANSACTION_ALREADY_FINISHED: "Esta transacción ya fue procesada.",
  PRODUCT_OUT_OF_STOCK: "Lo sentimos, el producto está agotado.",
  TRANSACTION_REJECTED:
    "Tu pago fue rechazado. Verifica los datos de tu tarjeta e intenta de nuevo.",
  GET_PRODUCTS_ERROR: "No pudimos cargar los productos. Intenta más tarde.",
  INVALID_PRICE: "El precio del producto no es válido.",
  SAVE_INITIAL_PRODUCTS_ERROR:
    "No pudimos inicializar el catálogo de productos.",
};

export const DEFAULT_ERROR_MESSAGE =
  "Ocurrió un error inesperado. Intenta de nuevo.";

export function resolveErrorMessage(
  rawMessage?: string | string[],
  fallback: string = DEFAULT_ERROR_MESSAGE,
): string {
  const raw = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage;
  if (!raw) return fallback;
  return BACKEND_ERROR_MESSAGES[raw] ?? raw;
}

export function isTransactionRejectedError(message?: string): boolean {
  if (!message) return false;
  return (
    message === "TRANSACTION_REJECTED" ||
    message === BACKEND_ERROR_MESSAGES.TRANSACTION_REJECTED
  );
}
