import { ILogger } from '@domain/shared/logger/logger.interface';
import { Logger } from '@nestjs/common';

export class LoggerService implements ILogger {
  private readonly logger: Logger;
  constructor(private readonly name: string) {
    this.logger = new Logger(this.name);
  }

  log(message: string, context?: unknown): void {
    this.logger.log(message, context);
  }
  error(message: string, context?: unknown): void {
    this.logger.error(message, context);
  }
  warn(message: string, context?: unknown): void {
    this.logger.warn(message, context);
  }
  debug(message: string, context?: unknown): void {
    this.logger.debug(message, context);
  }
  verbose(message: string, context?: unknown): void {
    this.logger.verbose(message, context);
  }
}
