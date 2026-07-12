import { ExceptionCustom } from '@domain/shared/exceptions/exception-custom';
import { ExceptionConstants } from '@domain/shared/exceptions/exception-constants';
import { Presigned } from '../model/presigned.model';
import { PresignedType } from '../model/presigned.type';
import { IPresignedRepository } from '../repository/presigned-repository.interface';
import { GetPresignedUseCase } from './get-presigned.use-case';

describe('GetPresignedUseCase', () => {
  let useCase: GetPresignedUseCase;
  let presignedRepository: jest.Mocked<IPresignedRepository>;
  let getPresignedsMock: jest.MockedFunction<
    IPresignedRepository['getPresigneds']
  >;

  const presignedList = [
    new Presigned(
      'https://example.com/policy',
      PresignedType.END_USER_POLICY,
      'token-1',
    ),
    new Presigned(
      'https://example.com/data',
      PresignedType.PERSONAL_DATA_AUTH,
      'token-2',
    ),
  ];

  beforeEach(() => {
    getPresignedsMock = jest.fn<
      ReturnType<IPresignedRepository['getPresigneds']>,
      Parameters<IPresignedRepository['getPresigneds']>
    >();
    presignedRepository = { getPresigneds: getPresignedsMock };
    useCase = new GetPresignedUseCase(presignedRepository);
  });

  it('should return presigned list when repository returns items', async () => {
    getPresignedsMock.mockResolvedValue(presignedList);

    const result = await useCase.call();

    expect(result).toBe(presignedList);
    expect(getPresignedsMock).toHaveBeenCalledTimes(1);
  });

  it('should throw PRE_SIGNED_NOT_FOUND when repository returns empty list', async () => {
    getPresignedsMock.mockResolvedValue([]);

    await expect(useCase.call()).rejects.toThrow(ExceptionCustom);
    await expect(useCase.call()).rejects.toMatchObject({
      message: ExceptionConstants.PRE_SIGNED_NOT_FOUND,
    });
  });

  it('should throw GET_PRESIGNED_ERROR when repository fails', async () => {
    getPresignedsMock.mockRejectedValue(new Error('network'));

    await expect(useCase.call()).rejects.toThrow(ExceptionCustom);
    await expect(useCase.call()).rejects.toMatchObject({
      message: ExceptionConstants.GET_PRESIGNED_ERROR,
    });
  });

  it('should rethrow domain error when repository throws ExceptionCustom', async () => {
    const domainError = new ExceptionCustom(
      ExceptionConstants.PRE_SIGNED_NOT_FOUND,
    );
    getPresignedsMock.mockRejectedValue(domainError);

    await expect(useCase.call()).rejects.toBe(domainError);
  });
});
