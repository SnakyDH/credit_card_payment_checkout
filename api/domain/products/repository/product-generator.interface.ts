import { Product } from '../model/product.model';

export interface IProductGenerator {
  generate(): Promise<Product[]>;
}
