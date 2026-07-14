import { Product } from '@domain/products/model/product.model';
import { ProductEntity } from '@adapter/out/postgres/entities/product.entity';

export class ProductEntityModelMapper {
  static toDomain(entity: ProductEntity): Product {
    return new Product(
      entity.id,
      entity.name,
      entity.image,
      entity.price,
      entity.stock,
    );
  }
}
