import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '@domain/products/model/product.model';
import { PaginationModel } from '@domain/shared/pagination/pagination.model';
import { IProductRepository } from '@domain/products/repository/product-repository.interface';
import { ProductEntity } from '@adapter/out/postgres/entities/product.entity';
import {
  Between,
  FindOperator,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { ProductFilter } from '@domain/products/model/product-filter.model';
import { ProductEntityModelMapper } from '@adapter/out/postgres/mappers/product-entity-model.mapper';
import { ExceptionCustom } from '@domain/shared/exceptions/exception-custom';
import { ExceptionConstants } from '@domain/shared/exceptions/exception-constants';
import { LoggerService } from '@config/logger.service';

export class ProductRepositoryImpl implements IProductRepository {
  private readonly logger = new LoggerService(ProductRepositoryImpl.name);
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}
  async saveMany(products: Product[]): Promise<void> {
    await this.productRepository.save(products);
  }

  count(): Promise<number> {
    return this.productRepository.count();
  }

  async updateStock(id: number, quantity: number): Promise<void> {
    await this.productRepository.update(id, { stock: quantity });
  }

  async findById(id: number): Promise<Product> {
    this.logger.log('Finding Product by Id', { id });
    const product = await this.productRepository.findOne({ where: { id } });
    this.logger.log('Product found', { product });
    if (!product) {
      throw new ExceptionCustom(ExceptionConstants.PRODUCT_NOT_FOUND);
    }
    return ProductEntityModelMapper.toDomain(product);
  }

  async findAll(
    page: number,
    limit: number,
    filter?: ProductFilter,
  ): Promise<PaginationModel<Product>> {
    this.logger.log('Finding All Products', { page, limit, filter });
    const whereClause: {
      name?: FindOperator<string>;
      price?: FindOperator<number>;
      stock?: FindOperator<number>;
    } = {};

    if (filter?.name) {
      whereClause.name = ILike(`%${filter.name}%`);
    }

    if (filter?.minPrice !== undefined && filter?.maxPrice !== undefined) {
      whereClause.price = Between(filter.minPrice, filter.maxPrice);
    } else if (filter?.minPrice !== undefined) {
      whereClause.price = MoreThanOrEqual(filter.minPrice);
    } else if (filter?.maxPrice !== undefined) {
      whereClause.price = LessThanOrEqual(filter.maxPrice);
    }

    if (filter?.minStock !== undefined && filter?.maxStock !== undefined) {
      whereClause.stock = Between(filter.minStock, filter.maxStock);
    } else if (filter?.minStock !== undefined) {
      whereClause.stock = MoreThanOrEqual(filter.minStock);
    } else if (filter?.maxStock !== undefined) {
      whereClause.stock = LessThanOrEqual(filter.maxStock);
    }
    this.logger.log('Where clause', { whereClause });
    const [products, total] = await this.productRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: whereClause,
      order: filter?.orderBy?.field
        ? {
            [filter.orderBy.field]: filter.orderBy.order,
          }
        : undefined,
    });
    this.logger.log('Products found', { products });
    this.logger.log('Total found', { total });
    const productsPaginated = PaginationModel.create(
      products,
      total,
      page,
      limit,
    );
    this.logger.log('Products paginated', { productsPaginated });
    return productsPaginated;
  }
}
