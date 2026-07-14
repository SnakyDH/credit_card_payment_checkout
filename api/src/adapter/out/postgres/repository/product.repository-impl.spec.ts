import { ExceptionCustom } from '@domain/shared/exceptions/exception-custom';
import { ExceptionConstants } from '@domain/shared/exceptions/exception-constants';
import { Product } from '@domain/products/model/product.model';
import { OrderType } from '@domain/shared/pagination/order-type.enum';
import { ProductEntity } from '@adapter/out/postgres/entities/product.entity';
import { Between, ILike, Repository } from 'typeorm';
import { ProductRepositoryImpl } from './product.repository-impl';

describe('ProductRepositoryImpl', () => {
  let repository: ProductRepositoryImpl;
  let typeOrmRepository: jest.Mocked<
    Pick<
      Repository<ProductEntity>,
      'save' | 'count' | 'update' | 'findOne' | 'findAndCount'
    >
  >;

  const productEntity = {
    id: 1,
    name: 'Product A',
    image: 'image-a.jpg',
    price: 1500,
    stock: 10,
  } as ProductEntity;

  beforeEach(() => {
    typeOrmRepository = {
      save: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
    };
    repository = new ProductRepositoryImpl(
      typeOrmRepository as unknown as Repository<ProductEntity>,
    );
  });

  it('should save many products', async () => {
    const products = [new Product(1, 'Product A', 'image-a.jpg', 1500, 10)];

    await repository.saveMany(products);

    expect(typeOrmRepository.save).toHaveBeenCalledWith(products);
  });

  it('should return product count', async () => {
    typeOrmRepository.count.mockResolvedValue(5);

    const result = await repository.count();

    expect(result).toBe(5);
  });

  it('should update stock', async () => {
    typeOrmRepository.update.mockResolvedValue({ affected: 1 } as never);

    await repository.updateStock(1, 8);

    expect(typeOrmRepository.update).toHaveBeenCalledWith(1, { stock: 8 });
  });

  it('should find product by id and map to domain', async () => {
    typeOrmRepository.findOne.mockResolvedValue(productEntity);

    const result = await repository.findById(1);

    expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(result).toEqual(
      new Product(1, 'Product A', 'image-a.jpg', 1500, 10),
    );
  });

  it('should throw PRODUCT_NOT_FOUND when product does not exist', async () => {
    typeOrmRepository.findOne.mockResolvedValue(null);

    await expect(repository.findById(99)).rejects.toThrow(ExceptionCustom);
    await expect(repository.findById(99)).rejects.toMatchObject({
      message: ExceptionConstants.PRODUCT_NOT_FOUND,
    });
  });

  it('should find all products with pagination and filters', async () => {
    typeOrmRepository.findAndCount.mockResolvedValue([[productEntity], 1]);

    const result = await repository.findAll(1, 10, {
      name: 'Product',
      minPrice: 1000,
      maxPrice: 2000,
      orderBy: { field: 'price', order: OrderType.ASC },
    });

    const findOptions = typeOrmRepository.findAndCount.mock.calls[0]?.[0];
    const whereClause = findOptions?.where;

    expect(findOptions?.skip).toBe(0);
    expect(findOptions?.take).toBe(10);
    expect(findOptions?.order).toEqual({ price: OrderType.ASC });
    expect(whereClause).toBeDefined();
    expect(Array.isArray(whereClause)).toBe(false);
    if (!whereClause || Array.isArray(whereClause)) {
      throw new Error('Expected a single where clause object');
    }
    expect(whereClause.name).toEqual(ILike('%Product%'));
    expect(whereClause.price).toEqual(Between(1000, 2000));
    expect(result.items).toEqual([productEntity]);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('should find all products with stock filters', async () => {
    typeOrmRepository.findAndCount.mockResolvedValue([[productEntity], 1]);

    await repository.findAll(2, 5, {
      minStock: 1,
      maxStock: 20,
    });

    const findOptions = typeOrmRepository.findAndCount.mock.calls[0]?.[0];
    const whereClause = findOptions?.where;

    expect(findOptions?.skip).toBe(5);
    expect(findOptions?.take).toBe(5);
    if (!whereClause || Array.isArray(whereClause)) {
      throw new Error('Expected a single where clause object');
    }
    expect(whereClause.stock).toEqual(Between(1, 20));
  });
});
