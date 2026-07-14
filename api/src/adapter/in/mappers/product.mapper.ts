import { PaginationModel } from '@domain/shared/pagination/pagination.model';
import { Product } from 'domain/products/model/product.model';
import {
  GetProductsResponseDto,
  GetProductResponseDto,
} from '@adapter/in/dtos/response/get-products-response.dto';

export class ProductMapper {
  static toProductDto(product: Product): GetProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      stock: product.stock,
    };
  }

  static toPaginatedProductsDto(
    paginationModel: PaginationModel<Product>,
  ): GetProductsResponseDto {
    const paginatedDto = new GetProductsResponseDto();
    paginatedDto.data = paginationModel.items.map((product) =>
      this.toProductDto(product),
    );
    paginatedDto.pagination = {
      page: paginationModel.page,
      totalPages: paginationModel.totalPages,
      total: paginationModel.total,
      limit: paginationModel.totalPages,
    };
    return paginatedDto;
  }
}
