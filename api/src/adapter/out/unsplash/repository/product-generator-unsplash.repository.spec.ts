import { of } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { SearchPhotosResponseDto } from '@adapter/out/unsplash/dto/search-photos-response.dto';
import { ProductGeneratorUnsplashRepositoryImpl } from './product-generator-unsplash.repository';

describe('ProductGeneratorUnsplashRepositoryImpl', () => {
  let repository: ProductGeneratorUnsplashRepositoryImpl;
  let requestMock: jest.MockedFunction<HttpService['request']>;

  const searchResponse: SearchPhotosResponseDto = {
    total: 2,
    total_pages: 1,
    results: [
      {
        urls: { regular: 'https://example.com/coffee-1.jpg' },
      },
      {
        urls: { regular: 'https://example.com/coffee-2.jpg' },
      },
    ] as SearchPhotosResponseDto['results'],
  };

  beforeEach(() => {
    requestMock = jest.fn().mockReturnValue(of({ data: searchResponse }));
    repository = new ProductGeneratorUnsplashRepositoryImpl({
      request: requestMock,
    } as unknown as HttpService);
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should fetch coffee images and generate products', async () => {
    const products = await repository.generate();

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: '/search/photos',
        params: {
          query: 'coffee',
          per_page: 30,
          orientation: 'squarish',
        },
      }),
    );
    expect(products).toHaveLength(2);
    expect(products[0]).toMatchObject({
      id: 1,
      name: 'Coffee 0',
      image: 'https://example.com/coffee-1.jpg',
      price: 5000000,
      stock: 50,
    });
    expect(products[1]).toMatchObject({
      id: 2,
      name: 'Coffee 1',
      image: 'https://example.com/coffee-2.jpg',
    });
  });
});
