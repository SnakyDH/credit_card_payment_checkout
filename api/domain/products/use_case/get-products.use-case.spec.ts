import { ExceptionCustom } from '@domain/shared/exceptions/exception-custom';
import { ExceptionConstants } from '@domain/shared/exceptions/exception-constants';
import { PaginationModel } from '@domain/shared/pagination/pagination.model';
import { ProductFilter } from '../model/product-filter.model';
import { Product } from '../model/product.model';
import { IProductRepository } from '../repository/product-repository.interface';
import { GetProductsUseCase } from './get-products.use-case';

describe('GetProductsUseCase', () => {
  let useCase: GetProductsUseCase;
  let productRepository: jest.Mocked<IProductRepository>;
  let findAllMock: jest.MockedFunction<IProductRepository['findAll']>;

  const products = [
    new Product(1, 'Product A', 'image-a.jpg', 1500, 10),
    new Product(2, 'Product B', 'image-b.jpg', 2500, 5),
  ];

  const paginatedProducts = PaginationModel.create(products, 2, 1, 10);

  beforeEach(() => {
    findAllMock = jest.fn<
      ReturnType<IProductRepository['findAll']>,
      Parameters<IProductRepository['findAll']>
    >();
    productRepository = {
      findAll: findAllMock,
    } as jest.Mocked<IProductRepository>;
    useCase = new GetProductsUseCase(productRepository);
  });

  it('should return paginated products with formatted prices', async () => {
    findAllMock.mockResolvedValue(paginatedProducts);
    const filter: ProductFilter = { name: 'Product' };

    const result = await useCase.call(1, 10, filter);

    expect(findAllMock).toHaveBeenCalledWith(1, 10, filter);
    expect(result.items[0].price).toBe(15);
    expect(result.items[1].price).toBe(25);
    expect(result.total).toBe(2);
  });

  it('should throw PRODUCT_NOT_FOUND when repository returns empty list', async () => {
    findAllMock.mockResolvedValue(PaginationModel.create([], 0, 1, 10));

    await expect(useCase.call(1, 10)).rejects.toThrow(ExceptionCustom);
    await expect(useCase.call(1, 10)).rejects.toMatchObject({
      message: ExceptionConstants.PRODUCT_NOT_FOUND,
    });
  });

  it('should throw GET_PRODUCTS_ERROR when repository fails', async () => {
    findAllMock.mockRejectedValue(new Error('database'));

    await expect(useCase.call(1, 10)).rejects.toThrow(ExceptionCustom);
    await expect(useCase.call(1, 10)).rejects.toMatchObject({
      message: ExceptionConstants.GET_PRODUCTS_ERROR,
    });
  });

  it('should rethrow domain error when repository throws ExceptionCustom', async () => {
    const domainError = new ExceptionCustom(
      ExceptionConstants.PRODUCT_NOT_FOUND,
    );
    findAllMock.mockRejectedValue(domainError);

    await expect(useCase.call(1, 10)).rejects.toBe(domainError);
  });
});
