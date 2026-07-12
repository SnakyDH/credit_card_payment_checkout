import { SearchPhotosResultDto } from '@adapter/out/unsplash/dto/search-photos-response.dto';

export class ProductImagesMapper {
  static toProductImages(images: SearchPhotosResultDto[]): string[] {
    return images.map((image) => image.urls.regular);
  }
}
