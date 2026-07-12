import { Presigned } from '@domain/presigned/model/presigned.model';
import { PresignedType } from '@domain/presigned/model/presigned.type';
import { GetPresignedUseCase } from '@domain/presigned/use_case/get-presigned.use-case';
import { GetPresignedHandler } from './get-presigned-handler';

describe('GetPresignedHandler', () => {
  let handler: GetPresignedHandler;
  let callMock: jest.MockedFunction<GetPresignedUseCase['call']>;

  const presignedList = [
    new Presigned(
      'https://example.com/policy',
      PresignedType.END_USER_POLICY,
      'token-1',
    ),
  ];

  beforeEach(() => {
    callMock = jest.fn<
      ReturnType<GetPresignedUseCase['call']>,
      Parameters<GetPresignedUseCase['call']>
    >();
    handler = new GetPresignedHandler({
      call: callMock,
    } as unknown as GetPresignedUseCase);
  });

  it('should delegate to GetPresignedUseCase and return presigned list', async () => {
    callMock.mockResolvedValue(presignedList);

    const result = await handler.call();

    expect(callMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(presignedList);
  });
});
