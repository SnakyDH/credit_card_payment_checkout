import { LoggerService } from '@config/logger.service';
import { IProductRepository } from '../repository/product-repository.interface';
import { IProductGenerator } from '../repository/product-generator.interface';
import { ExceptionCustom } from '@domain/shared/exceptions/exception-custom';
import { ExceptionConstants } from '@domain/shared/exceptions/exception-constants';

export class SaveInitialProductsUseCase {
  private readonly logger = new LoggerService(SaveInitialProductsUseCase.name);
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly productGenerator: IProductGenerator,
  ) {}

  async call(): Promise<void> {
    try {
      const count = await this.productRepository.count();
      if (count > 0) {
        this.logger.log('Products already exist', { count });
        return;
      }
      this.logger.log('Generating products');

      const products = await this.productGenerator.generate();
      this.logger.log('Products generated', { count: products.length });
      this.logger.log('Saving products');
      await this.productRepository.saveMany(products);
      this.logger.log('Products saved successfully');
    } catch (error) {
      this.logger.error('Error saving initial products', error);
      throw ExceptionCustom.validateException(
        error,
        ExceptionConstants.SAVE_INITIAL_PRODUCTS_ERROR,
      );
    }
  }
}
