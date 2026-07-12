import { ExceptionCustom } from '@domain/shared/exceptions/exception-custom';
import { ExceptionConstants } from '@domain/shared/exceptions/exception-constants';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { HttpExceptionHandler } from './http-exception.handler';

describe('HttpExceptionHandler', () => {
  let handler: HttpExceptionHandler;

  beforeEach(() => {
    handler = new HttpExceptionHandler();
  });

  it('should map PRODUCT_NOT_FOUND to NotFoundException', () => {
    const exception = new ExceptionCustom(ExceptionConstants.PRODUCT_NOT_FOUND);

    const result = handler.handle(exception);

    expect(result).toBeInstanceOf(NotFoundException);
    expect(result.getResponse()).toMatchObject({
      message: ExceptionConstants.PRODUCT_NOT_FOUND,
      statusCode: 404,
    });
  });

  it('should map other ExceptionCustom to InternalServerErrorException', () => {
    const exception = new ExceptionCustom(
      ExceptionConstants.TRANSACTION_NOT_FOUND,
    );

    const result = handler.handle(exception);

    expect(result).toBeInstanceOf(InternalServerErrorException);
    expect(result.getResponse()).toMatchObject({
      message: ExceptionConstants.TRANSACTION_NOT_FOUND,
      statusCode: 500,
    });
  });

  it('should map unknown errors to InternalServerErrorException', () => {
    const error = new Error('unexpected');

    const result = handler.handle(error);

    expect(result).toBeInstanceOf(InternalServerErrorException);
    expect(result.getStatus()).toBe(500);
    expect(result.getResponse()).toBe(error);
  });
});
