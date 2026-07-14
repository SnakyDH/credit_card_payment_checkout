import { ExceptionWithStatus } from '@domain/shared/exceptions/exception-with-status';
import axios from 'axios';
import { GatewayErrorResponseDto } from '../dtos/gateway-error-response.dto';

const GATEWAY_ERROR_MESSAGES: Record<
  string,
  { statusCode: number; message: string }
> = {
  'duplicate reference': {
    statusCode: 422,
    message:
      'Ya procesamos esta compra. Inicia una nueva transacción para continuar.',
  },
  'invalid amount': {
    statusCode: 422,
    message:
      'El monto del pago no es válido. Verifica tu pedido e intenta de nuevo.',
  },
  'invalid acceptance token': {
    statusCode: 400,
    message:
      'La autorización de pago expiró. Vuelve a aceptar los términos y condiciones.',
  },
  'invalid authentication key': {
    statusCode: 500,
    message: 'El servicio de pago no está disponible. Intenta más tarde.',
  },
  'incomplete payment method': {
    statusCode: 400,
    message:
      'Faltan datos de la tarjeta. Revisa la información e intenta de nuevo.',
  },
};

const DEFAULT_ERROR = new ExceptionWithStatus(
  500,
  'No se pudo procesar el pago. Intenta de nuevo.',
);

export class GatewayErrorMapper {
  static fromUnknown(error: unknown): ExceptionWithStatus {
    if (!axios.isAxiosError<GatewayErrorResponseDto>(error)) {
      return DEFAULT_ERROR;
    }

    const reason = error.response?.data?.error?.reason?.trim().toLowerCase();
    if (reason && GATEWAY_ERROR_MESSAGES[reason]) {
      const mapped = GATEWAY_ERROR_MESSAGES[reason];
      return new ExceptionWithStatus(mapped.statusCode, mapped.message);
    }

    return DEFAULT_ERROR;
  }
}
