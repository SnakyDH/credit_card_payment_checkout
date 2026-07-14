import { ExceptionCustom } from '@domain/shared/exceptions/exception-custom';
import { ExceptionConstants } from '@domain/shared/exceptions/exception-constants';
import { SaveInitialProductsUseCase } from '@domain/products/use_case/save-initial-products.use-case';
import { NotFoundException } from '@nestjs/common/exceptions';
import { HttpExceptionHandler } from './http-exception.handler';
import { SeedProductsHandler } from './seed-products.handler';

describe('SeedProductsHandler', () => {
  let handler: SeedProductsHandler;
  let callMock: jest.MockedFunction<SaveInitialProductsUseCase['call']>;
  let handleMock: jest.MockedFunction<HttpExceptionHandler['handle']>;

  beforeEach(() => {
    callMock = jest.fn<
      ReturnType<SaveInitialProductsUseCase['call']>,
      Parameters<SaveInitialProductsUseCase['call']>
    >();
    handleMock = jest.fn<
      ReturnType<HttpExceptionHandler['handle']>,
      Parameters<HttpExceptionHandler['handle']>
    >();
    handler = new SeedProductsHandler(
      { handle: handleMock } as unknown as HttpExceptionHandler,
      { call: callMock } as unknown as SaveInitialProductsUseCase,
    );
  });

  it('should call SaveInitialProductsUseCase on bootstrap', async () => {
    callMock.mockResolvedValue(undefined);

    await handler.onApplicationBootstrap();

    expect(callMock).toHaveBeenCalledTimes(1);
    expect(handleMock).not.toHaveBeenCalled();
  });

  it('should delegate errors to HttpExceptionHandler', async () => {
    const domainError = new ExceptionCustom(
      ExceptionConstants.PRODUCT_NOT_FOUND,
    );
    const httpError = new NotFoundException(domainError.message);
    callMock.mockRejectedValue(domainError);
    handleMock.mockReturnValue(httpError);

    await expect(handler.onApplicationBootstrap()).rejects.toBe(httpError);
    expect(handleMock).toHaveBeenCalledWith(domainError);
  });
});
