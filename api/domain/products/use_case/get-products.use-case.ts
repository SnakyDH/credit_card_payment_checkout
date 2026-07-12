import { ExceptionCustom } from '@domain/shared/exceptions/exception-custom';
import { PaginationModel } from '@domain/shared/pagination/pagination.model';
import { IProductRepository } from '@domain/products/repository/product-repository.interface';
import { ProductFilter } from '@domain/products/model/product-filter.model';
import { Product } from '@domain/products/model/product.model';
import { ExceptionConstants } from '@domain/shared/exceptions/exception-constants';
import { LoggerService } from '@config/logger.service';

export class GetProductsUseCase {
  private readonly logger = new LoggerService(GetProductsUseCase.name);
  constructor(private readonly productRepository: IProductRepository) {}

  async call(
    page: number,
    limit: number,
    filter?: ProductFilter,
  ): Promise<PaginationModel<Product>> {
    this.logger.log('Getting Products', { page, limit, filter });
    try {
      const productsPaginated = await this.productRepository.findAll(
        page,
        limit,
        filter,
      );
      this.logger.log('Products found', { productsPaginated });
      if (productsPaginated.items.length <= 0) {
        throw new ExceptionCustom(ExceptionConstants.PRODUCT_NOT_FOUND);
      }

      productsPaginated.items.forEach((product) => {
        product.price = this.formatPrice(product.price);
      });

      this.logger.log('Products formatted', { productsPaginated });
      return productsPaginated;
    } catch (error) {
      this.logger.error('Error getting Products', error);
      throw ExceptionCustom.validateException(
        error,
        ExceptionConstants.GET_PRODUCTS_ERROR,
      );
    }
  }

  private formatPrice(price: number): number {
    const formattedPrice = price / 100;
    this.logger.log('Formatting Price', { formattedPrice });
    return formattedPrice;
  }
}
