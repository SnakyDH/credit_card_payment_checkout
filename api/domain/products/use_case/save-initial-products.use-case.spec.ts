import { ExceptionCustom } from '@domain/shared/exceptions/exception-custom';
import { ExceptionConstants } from '@domain/shared/exceptions/exception-constants';
import { Product } from '../model/product.model';
import { IProductGenerator } from '../repository/product-generator.interface';
import { IProductRepository } from '../repository/product-repository.interface';
import { SaveInitialProductsUseCase } from './save-initial-products.use-case';

describe('SaveInitialProductsUseCase', () => {
  let useCase: SaveInitialProductsUseCase;
  let productRepository: jest.Mocked<IProductRepository>;
  let productGenerator: jest.Mocked<IProductGenerator>;
  let countMock: jest.MockedFunction<IProductRepository['count']>;
  let saveManyMock: jest.MockedFunction<IProductRepository['saveMany']>;
  let generateMock: jest.MockedFunction<IProductGenerator['generate']>;

  const generatedProducts = [
    new Product(1, 'Product A', 'image-a.jpg', 1500, 10),
    new Product(2, 'Product B', 'image-b.jpg', 2500, 5),
  ];

  beforeEach(() => {
    countMock = jest.fn<
      ReturnType<IProductRepository['count']>,
      Parameters<IProductRepository['count']>
    >();
    saveManyMock = jest.fn<
      ReturnType<IProductRepository['saveMany']>,
      Parameters<IProductRepository['saveMany']>
    >();
    generateMock = jest.fn<
      ReturnType<IProductGenerator['generate']>,
      Parameters<IProductGenerator['generate']>
    >();
    productRepository = {
      count: countMock,
      saveMany: saveManyMock,
    } as jest.Mocked<IProductRepository>;
    productGenerator = { generate: generateMock };
    useCase = new SaveInitialProductsUseCase(
      productRepository,
      productGenerator,
    );
  });

  it('should skip generation when products already exist', async () => {
    countMock.mockResolvedValue(3);

    await useCase.call();

    expect(countMock).toHaveBeenCalledTimes(1);
    expect(generateMock).not.toHaveBeenCalled();
    expect(saveManyMock).not.toHaveBeenCalled();
  });

  it('should generate and save products when none exist', async () => {
    countMock.mockResolvedValue(0);
    generateMock.mockResolvedValue(generatedProducts);

    await useCase.call();

    expect(countMock).toHaveBeenCalledTimes(1);
    expect(generateMock).toHaveBeenCalledTimes(1);
    expect(saveManyMock).toHaveBeenCalledWith(generatedProducts);
  });

  it('should throw SAVE_INITIAL_PRODUCTS_ERROR when count fails', async () => {
    countMock.mockRejectedValue(new Error('database'));

    await expect(useCase.call()).rejects.toThrow(ExceptionCustom);
    await expect(useCase.call()).rejects.toMatchObject({
      message: ExceptionConstants.SAVE_INITIAL_PRODUCTS_ERROR,
    });
  });

  it('should throw SAVE_INITIAL_PRODUCTS_ERROR when generation fails', async () => {
    countMock.mockResolvedValue(0);
    generateMock.mockRejectedValue(new Error('generation failed'));

    await expect(useCase.call()).rejects.toThrow(ExceptionCustom);
    await expect(useCase.call()).rejects.toMatchObject({
      message: ExceptionConstants.SAVE_INITIAL_PRODUCTS_ERROR,
    });
  });

  it('should throw SAVE_INITIAL_PRODUCTS_ERROR when save fails', async () => {
    countMock.mockResolvedValue(0);
    generateMock.mockResolvedValue(generatedProducts);
    saveManyMock.mockRejectedValue(new Error('save failed'));

    await expect(useCase.call()).rejects.toThrow(ExceptionCustom);
    await expect(useCase.call()).rejects.toMatchObject({
      message: ExceptionConstants.SAVE_INITIAL_PRODUCTS_ERROR,
    });
  });

  it('should rethrow domain error when repository throws ExceptionCustom', async () => {
    const domainError = new ExceptionCustom(
      ExceptionConstants.SAVE_INITIAL_PRODUCTS_ERROR,
    );
    countMock.mockRejectedValue(domainError);

    await expect(useCase.call()).rejects.toBe(domainError);
  });
});
