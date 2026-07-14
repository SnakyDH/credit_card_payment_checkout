import { ExceptionWithStatus } from '@domain/shared/exceptions/exception-with-status';
import { AxiosError, AxiosHeaders } from 'axios';
import { GatewayErrorMapper } from './gateway-error.mapper';

const createAxiosError = (
  status: number,
  reason: string,
): AxiosError<{ error: { reason: string } }> => {
  const error = new AxiosError('Request failed');
  error.response = {
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data: { error: { reason } },
  };
  return error;
};

describe('GatewayErrorMapper', () => {
  it('should map duplicate reference to 422 with Spanish message', () => {
    const result = GatewayErrorMapper.fromUnknown(
      createAxiosError(422, 'Duplicate reference'),
    );

    expect(result).toBeInstanceOf(ExceptionWithStatus);
    expect(result.statusCode).toBe(422);
    expect(result.message).toBe(
      'Ya procesamos esta compra. Inicia una nueva transacción para continuar.',
    );
  });

  it('should map invalid amount to 422 with Spanish message', () => {
    const result = GatewayErrorMapper.fromUnknown(
      createAxiosError(422, 'Invalid amount'),
    );

    expect(result.statusCode).toBe(422);
    expect(result.message).toBe(
      'El monto del pago no es válido. Verifica tu pedido e intenta de nuevo.',
    );
  });

  it('should map invalid acceptance token to 400 with Spanish message', () => {
    const result = GatewayErrorMapper.fromUnknown(
      createAxiosError(400, 'Invalid acceptance token'),
    );

    expect(result.statusCode).toBe(400);
    expect(result.message).toBe(
      'La autorización de pago expiró. Vuelve a aceptar los términos y condiciones.',
    );
  });

  it('should map invalid authentication key to 500 with generic Spanish message', () => {
    const result = GatewayErrorMapper.fromUnknown(
      createAxiosError(401, 'Invalid authentication key'),
    );

    expect(result.statusCode).toBe(500);
    expect(result.message).toBe(
      'El servicio de pago no está disponible. Intenta más tarde.',
    );
  });

  it('should map incomplete payment method to 400 with Spanish message', () => {
    const result = GatewayErrorMapper.fromUnknown(
      createAxiosError(400, 'Incomplete payment method'),
    );

    expect(result.statusCode).toBe(400);
    expect(result.message).toBe(
      'Faltan datos de la tarjeta. Revisa la información e intenta de nuevo.',
    );
  });

  it('should return default error for unrecognized gateway errors', () => {
    const result = GatewayErrorMapper.fromUnknown(
      createAxiosError(500, 'Unknown gateway error'),
    );

    expect(result.statusCode).toBe(500);
    expect(result.message).toBe(
      'No se pudo procesar el pago. Intenta de nuevo.',
    );
  });

  it('should return default error for non-Axios errors', () => {
    const result = GatewayErrorMapper.fromUnknown(new Error('unexpected'));

    expect(result.statusCode).toBe(500);
    expect(result.message).toBe(
      'No se pudo procesar el pago. Intenta de nuevo.',
    );
  });
});
