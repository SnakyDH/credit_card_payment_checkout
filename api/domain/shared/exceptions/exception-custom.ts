import { ExceptionConstants } from './exception-constants';

export class ExceptionCustom extends Error {
  constructor(message: ExceptionConstants) {
    super(message.toString());
  }
  static validateException(
    error: unknown,
    exception: ExceptionConstants,
  ): ExceptionCustom {
    if (error instanceof ExceptionCustom) {
      return error;
    }
    return new ExceptionCustom(exception);
  }
}
