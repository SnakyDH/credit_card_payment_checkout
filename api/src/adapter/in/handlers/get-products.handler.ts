import { GetProductsUseCase } from '@domain/products/use_case/get-products.use-case';
import { ProductFilterMapper } from '@adapter/in/mappers/product-filter.mapper';
import { GetProductsResponseDto } from '@adapter/in/dtos/response/get-products-response.dto';
import { GetProductsRequestDto } from '@adapter/in/dtos/request/get-products-request.dto';
import { ProductMapper } from '@adapter/in/mappers/product.mapper';

export class GetProductsHandler {
  constructor(private readonly getProductsUseCase: GetProductsUseCase) {}

  async call(
    getProductsDto: GetProductsRequestDto,
  ): Promise<GetProductsResponseDto> {
    const { page, limit } = getProductsDto;
    const filter = ProductFilterMapper.fromDto(getProductsDto);
    const productsModel = await this.getProductsUseCase.call(
      page,
      limit,
      filter,
    );
    return ProductMapper.toPaginatedProductsDto(productsModel);
  }
}
