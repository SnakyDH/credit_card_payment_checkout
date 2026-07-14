import { ProductFilterMapper } from './product-filter.mapper';
import { OrderType } from '@domain/shared/pagination/order-type.enum';

describe('ProductFilterMapper', () => {
  it('returns undefined when no filters are provided', () => {
    expect(ProductFilterMapper.fromDto({})).toBeUndefined();
  });

  it('maps all supported filters', () => {
    const filter = ProductFilterMapper.fromDto({
      name: 'Arabica',
      minPrice: 1000,
      maxPrice: 5000,
      minStock: 1,
      maxStock: 10,
      orderByField: 'price',
      orderByType: OrderType.ASC,
    });

    expect(filter).toEqual({
      name: 'Arabica',
      minPrice: 1000,
      maxPrice: 5000,
      minStock: 1,
      maxStock: 10,
      orderBy: {
        field: 'price',
        order: OrderType.ASC,
      },
    });
  });

  it('ignores orderBy when only one sorting field is provided', () => {
    const filter = ProductFilterMapper.fromDto({
      orderByField: 'price',
    });

    expect(filter).toEqual({});
    expect(filter?.orderBy).toBeUndefined();
  });
});
