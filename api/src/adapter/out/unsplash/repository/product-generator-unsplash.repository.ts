import { LoggerService } from '@config/logger.service';
import { Product } from '@domain/products/model/product.model';
import { IProductGenerator } from '@domain/products/repository/product-generator.interface';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import { SearchPhotosResponseDto } from '@adapter/out/unsplash/dto/search-photos-response.dto';
import { ProductImagesMapper } from '../mappers/product-images.mapper';

export class ProductGeneratorUnsplashRepositoryImpl implements IProductGenerator {
  private readonly logger = new LoggerService(
    ProductGeneratorUnsplashRepositoryImpl.name,
  );
  constructor(private readonly unSplashApiService: HttpService) {}
  async generate(): Promise<Product[]> {
    this.logger.log('Generating products');
    const randomProducts = await this.getRandomProducts();
    this.logger.log('Products generated', { randomProducts });
    return randomProducts;
  }
  private async getRandomProducts(): Promise<Product[]> {
    const randomImages = await this.getRandomImages();
    const products: Product[] = [];
    for (let i = 0; i < randomImages.length; i++) {
      products.push({
        id: i + 1,
        name: 'Coffee ' + i,
        price: Math.floor(Math.random() * 10000000),
        image: randomImages[i],
        stock: Math.floor(Math.random() * 100),
      });
    }
    return products;
  }
  private async getRandomImages(): Promise<string[]> {
    const request: AxiosRequestConfig = {
      method: 'GET',
      url: '/search/photos',
      params: {
        query: 'coffee',
        per_page: 30,
        orientation: 'squarish',
      },
    };
    const { data } = await firstValueFrom(
      this.unSplashApiService.request<SearchPhotosResponseDto>(request),
    );
    return ProductImagesMapper.toProductImages(data.results);
  }
}
