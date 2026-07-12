import { Product } from '@domain/products/model/product.model';
import { ProductFilter } from '@domain/products/model/product-filter.model';
import { PaginationModel } from '@domain/shared/pagination/pagination.model';

export interface IProductRepository {
  findAll(
    page: number,
    limit: number,
    filter?: ProductFilter,
  ): Promise<PaginationModel<Product>>;
  updateStock(id: number, quantity: number): Promise<void>;
  findById(id: number): Promise<Product>;
  count(): Promise<number>;
  saveMany(products: Product[]): Promise<void>;
}
