import { ExceptionCustom } from '@domain/shared/exceptions/exception-custom';
import { ExceptionConstants } from '@domain/shared/exceptions/exception-constants';
import {
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { Logger } from '@nestjs/common';

export class HttpExceptionHandler {
  private readonly logger = new Logger(HttpExceptionHandler.name);
  handle(exception: unknown): HttpException {
    this.logger.error(exception);
    if (!(exception instanceof ExceptionCustom)) {
      return new InternalServerErrorException(exception);
    }
    if (exception.message === ExceptionConstants.PRODUCT_NOT_FOUND.toString()) {
      return new NotFoundException(exception.message);
    }
    return new InternalServerErrorException(exception.message);
  }
}
