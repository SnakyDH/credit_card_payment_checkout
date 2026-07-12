import { ExceptionCustom } from '@domain/shared/exceptions/exception-custom';
import { ExceptionConstants } from '@domain/shared/exceptions/exception-constants';
import { DeliveryEntity } from '@adapter/out/postgres/entities/delivery.entity';
import { Repository } from 'typeorm';
import { DeliveryRepositoryImpl } from './delivery.repository-impl';

describe('DeliveryRepositoryImpl', () => {
  let repository: DeliveryRepositoryImpl;
  let typeOrmRepository: jest.Mocked<
    Pick<Repository<DeliveryEntity>, 'create' | 'save' | 'findOne' | 'update'>
  >;

  const deliveryInput = {
    customer: 'John Doe',
    customerEmail: 'john@example.com',
    address: '123 Main St',
    country: 'CO',
    region: 'Antioquia',
    city: 'Medellin',
    postalCode: '050001',
    phone: '3001234567',
  };

  const savedDelivery = {
    id: 1,
    ...deliveryInput,
  } as DeliveryEntity;

  beforeEach(() => {
    typeOrmRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    };
    repository = new DeliveryRepositoryImpl(
      typeOrmRepository as unknown as Repository<DeliveryEntity>,
    );
  });

  it('should create delivery', async () => {
    typeOrmRepository.create.mockReturnValue(savedDelivery);
    typeOrmRepository.save.mockResolvedValue(savedDelivery);

    const result = await repository.create(deliveryInput);

    expect(typeOrmRepository.create).toHaveBeenCalledWith(deliveryInput);
    expect(typeOrmRepository.save).toHaveBeenCalledWith(savedDelivery);
    expect(result).toBe(savedDelivery);
  });

  it('should find delivery by id', async () => {
    typeOrmRepository.findOne.mockResolvedValue(savedDelivery);

    const result = await repository.findById(1);

    expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(result).toBe(savedDelivery);
  });

  it('should throw DELIVERY_NOT_FOUND when delivery does not exist', async () => {
    typeOrmRepository.findOne.mockResolvedValue(null);

    await expect(repository.findById(99)).rejects.toMatchObject({
      message: ExceptionConstants.DELIVERY_NOT_FOUND,
    });
  });

  it('should update delivery and return reloaded entity', async () => {
    const updatedDelivery = { ...savedDelivery, city: 'Bogota' };
    typeOrmRepository.update.mockResolvedValue({ affected: 1 } as never);
    typeOrmRepository.findOne.mockResolvedValue(updatedDelivery);

    const result = await repository.update(1, { city: 'Bogota' });

    expect(typeOrmRepository.update).toHaveBeenCalledWith(1, {
      city: 'Bogota',
    });
    expect(result).toBe(updatedDelivery);
  });

  it('should throw DELIVERY_NOT_FOUND when update reload fails', async () => {
    typeOrmRepository.update.mockResolvedValue({ affected: 1 } as never);
    typeOrmRepository.findOne.mockResolvedValue(null);

    await expect(repository.update(1, { city: 'Bogota' })).rejects.toThrow(
      ExceptionCustom,
    );
  });
});
