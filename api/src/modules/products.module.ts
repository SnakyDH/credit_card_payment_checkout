import { ProductController } from '@adapter/in/controllers/product.controller';
import { GetProductsHandler } from '@adapter/in/handlers/get-products.handler';
import { HttpExceptionHandler } from '@adapter/in/handlers/http-exception.handler';
import { SeedProductsHandler } from '@adapter/in/handlers/seed-products.handler';
import { ProductMapper } from '@adapter/in/mappers/product.mapper';
import { ProductEntity } from '@adapter/out/postgres/entities/product.entity';
import { ProductRepositoryImpl } from '@adapter/out/postgres/repository/product.repository-impl';
import { ProductGeneratorUnsplashRepositoryImpl } from '@adapter/out/unsplash/repository/product-generator-unsplash.repository';
import { envConstants } from '@config/env-constants';
import { IProductGenerator } from '@domain/products/repository/product-generator.interface';
import { IProductRepository } from '@domain/products/repository/product-repository.interface';
import { GetProductsUseCase } from '@domain/products/use_case/get-products.use-case';
import { SaveInitialProductsUseCase } from '@domain/products/use_case/save-initial-products.use-case';
import { HttpModule, HttpService } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity]),
    HttpModule.register({
      baseURL: envConstants.unSplash.baseUrl,
      headers: {
        Authorization: `Client-ID ${envConstants.unSplash.accessKey}`,
      },
    }),
  ],
  controllers: [ProductController],
  providers: [
    {
      provide: 'IProductRepository',
      useClass: ProductRepositoryImpl,
    },
    {
      provide: 'IProductGenerator',
      useFactory: (unSplashApiService: HttpService) =>
        new ProductGeneratorUnsplashRepositoryImpl(unSplashApiService),
      inject: [HttpService],
    },

    {
      provide: GetProductsUseCase,
      useFactory: (productRepository: IProductRepository) =>
        new GetProductsUseCase(productRepository),
      inject: ['IProductRepository'],
    },
    {
      provide: SaveInitialProductsUseCase,
      useFactory: (
        productGenerator: IProductGenerator,
        productRepository: IProductRepository,
      ) => new SaveInitialProductsUseCase(productRepository, productGenerator),
      inject: ['IProductGenerator', 'IProductRepository'],
    },
    {
      provide: SeedProductsHandler,
      useFactory: (
        httpExceptionHandler: HttpExceptionHandler,
        saveInitialProductsUseCase: SaveInitialProductsUseCase,
      ) =>
        new SeedProductsHandler(
          httpExceptionHandler,
          saveInitialProductsUseCase,
        ),
      inject: [HttpExceptionHandler, SaveInitialProductsUseCase],
    },
    {
      provide: GetProductsHandler,
      useFactory: (getProductsUseCase: GetProductsUseCase) =>
        new GetProductsHandler(getProductsUseCase),
      inject: [GetProductsUseCase],
    },
    ProductMapper,
    HttpExceptionHandler,
  ],
  exports: ['IProductRepository', GetProductsHandler, ProductMapper],
})
export class ProductsModule {}
