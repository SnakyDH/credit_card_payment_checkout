import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { SaveInitialProductsUseCase } from '@domain/products/use_case/save-initial-products.use-case';
import { HttpExceptionHandler } from './http-exception.handler';

@Injectable()
export class SeedProductsHandler implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedProductsHandler.name);

  constructor(
    private readonly httpExceptionHandler: HttpExceptionHandler,
    private readonly saveInitialProductsUseCase: SaveInitialProductsUseCase,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Starting verification of products catalog...');
    try {
      await this.saveInitialProductsUseCase.call();
      this.logger.log('Seed products completed successfully');
    } catch (error) {
      throw this.httpExceptionHandler.handle(error);
    }
  }
}
