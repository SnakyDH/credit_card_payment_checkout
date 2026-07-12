import { ProductFilter } from '@domain/products/model/product-filter.model';
import { GetProductsRequestDto } from '@adapter/in/dtos/request/get-products-request.dto';
import { Product } from '@domain/products/model/product.model';

export class ProductFilterMapper {
  static fromDto(dto: GetProductsRequestDto): ProductFilter | undefined {
    const hasFilter =
      dto.name ||
      dto.minPrice !== undefined ||
      dto.maxPrice !== undefined ||
      dto.minStock !== undefined ||
      dto.maxStock !== undefined ||
      dto.orderByField ||
      dto.orderByType;

    if (!hasFilter) {
      return undefined;
    }

    const filter: ProductFilter = {};

    if (dto.name) {
      filter.name = dto.name;
    }

    if (dto.minPrice !== undefined) {
      filter.minPrice = dto.minPrice;
    }

    if (dto.maxPrice !== undefined) {
      filter.maxPrice = dto.maxPrice;
    }

    if (dto.minStock !== undefined) {
      filter.minStock = dto.minStock;
    }

    if (dto.maxStock !== undefined) {
      filter.maxStock = dto.maxStock;
    }

    if (dto.orderByField && dto.orderByType) {
      filter.orderBy = {
        field: dto.orderByField as keyof Product,
        order: dto.orderByType,
      };
    }

    return filter;
  }
}
