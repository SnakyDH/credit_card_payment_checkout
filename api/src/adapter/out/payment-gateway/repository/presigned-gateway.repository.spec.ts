import { of, throwError } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { PresignedType } from '@domain/presigned/model/presigned.type';
import { GetPresignedResponseDto } from '../dtos/get-presigned-response.dto';
import { PresignedGatewayRepository } from './presigned-gateway.repository';

jest.mock('@config/env-constants', () => ({
  envConstants: {
    paymentGateway: {
      publicKey: 'pub_test_key',
    },
  },
}));

describe('PresignedGatewayRepository', () => {
  let repository: PresignedGatewayRepository;
  let requestMock: jest.MockedFunction<HttpService['request']>;

  const presignedResponse: GetPresignedResponseDto = {
    data: {
      presigned_acceptance: {
        acceptance_token: 'acceptance_token_1',
        permalink: 'https://example.com/acceptance',
        type: 'END_USER_POLICY',
      },
      presigned_personal_data_auth: {
        acceptance_token: 'acceptance_token_2',
        permalink: 'https://example.com/personal-data',
        type: 'PERSONAL_DATA_AUTH',
      },
    },
  };

  beforeEach(() => {
    requestMock = jest.fn().mockReturnValue(of({ data: presignedResponse }));
    repository = new PresignedGatewayRepository({
      request: requestMock,
    } as unknown as HttpService);
  });

  it('should fetch presigned documents from payment gateway and map to domain', async () => {
    const result = await repository.getPresigneds();

    expect(requestMock).toHaveBeenCalledWith({
      method: 'GET',
      url: '/v1/merchants/pub_test_key',
    });
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      url: 'https://example.com/acceptance',
      type: PresignedType.END_USER_POLICY,
      token: 'acceptance_token_1',
    });
    expect(result[1]).toMatchObject({
      url: 'https://example.com/personal-data',
      type: PresignedType.PERSONAL_DATA_AUTH,
      token: 'acceptance_token_2',
    });
  });

  it('should throw wrapped error when payment gateway request fails', async () => {
    const error = new Error('network');
    requestMock.mockReturnValue(throwError(() => error));

    await expect(repository.getPresigneds()).rejects.toThrow(
      'Failed to get Presigneds from payment gateway',
    );
  });
});
