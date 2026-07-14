import { Controller, Get, Query } from '@nestjs/common';
import { GetProductsRequestDto } from '@adapter/in/dtos/request/get-products-request.dto';
import { GetProductsResponseDto } from '@adapter/in/dtos/response/get-products-response.dto';
import { HttpExceptionHandler } from '@adapter/in/handlers/http-exception.handler';
import { GetProductsHandler } from '@adapter/in/handlers/get-products.handler';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly getProductsHandler: GetProductsHandler,
    private readonly httpExceptionHandler: HttpExceptionHandler,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get products with filtering and pagination',
    description:
      'Retrieve a paginated list of products with optional filtering by name, price range, stock, and sorting options',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: GetProductsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid query parameters',
  })
  @ApiResponse({
    status: 404,
    description: 'No products found',
  })
  @ApiQuery({ type: GetProductsRequestDto, name: 'getProductsDto' })
  async getProducts(
    @Query()
    getProductsDto: GetProductsRequestDto,
  ): Promise<GetProductsResponseDto> {
    try {
      return await this.getProductsHandler.call(getProductsDto);
    } catch (error) {
      throw this.httpExceptionHandler.handle(error);
    }
  }
}
