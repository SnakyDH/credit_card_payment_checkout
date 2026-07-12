import { PaginationModel } from '@domain/shared/pagination/pagination.model';
import { Product } from '@domain/products/model/product.model';
import { GetProductsUseCase } from '@domain/products/use_case/get-products.use-case';
import { GetProductsRequestDto } from '@adapter/in/dtos/request/get-products-request.dto';
import { OrderType } from '@domain/shared/pagination/order-type.enum';
import { GetProductsHandler } from './get-products.handler';

describe('GetProductsHandler', () => {
  let handler: GetProductsHandler;
  let callMock: jest.MockedFunction<GetProductsUseCase['call']>;

  const products = [new Product(1, 'Product A', 'image-a.jpg', 15, 10)];
  const paginatedProducts = PaginationModel.create(products, 1, 1, 10);

  beforeEach(() => {
    callMock = jest.fn<
      ReturnType<GetProductsUseCase['call']>,
      Parameters<GetProductsUseCase['call']>
    >();
    handler = new GetProductsHandler({
      call: callMock,
    } as unknown as GetProductsUseCase);
  });

  it('should map request, call use case, and return paginated response dto', async () => {
    const request = Object.assign(new GetProductsRequestDto(), {
      page: 1,
      limit: 10,
      name: 'Product',
      orderByField: 'price',
      orderByType: OrderType.ASC,
    });
    callMock.mockResolvedValue(paginatedProducts);

    const result = await handler.call(request);

    expect(callMock).toHaveBeenCalledWith(1, 10, {
      name: 'Product',
      orderBy: { field: 'price', order: OrderType.ASC },
    });
    expect(result.data).toEqual([
      {
        id: 1,
        name: 'Product A',
        image: 'image-a.jpg',
        price: 15,
        stock: 10,
      },
    ]);
    expect(result.pagination).toEqual({
      page: 1,
      totalPages: 1,
      total: 1,
      limit: 1,
    });
  });
});
