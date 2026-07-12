import { GetPresignedResponseDto } from '../dtos/get-presigned-response.dto';
import { PresignedWompiMapper } from './presigned-wompi.mapper';
import { PresignedType } from 'domain/presigned/model/presigned.type';

describe('PresignedWompiMapper', () => {
  describe('toDomainList', () => {
    it('should map GetPresignedResponseDto to Presigned array correctly', () => {
      // Arrange
      const mockPresignedResponse: GetPresignedResponseDto = {
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

      // Act
      const result = PresignedWompiMapper.toDomainList(mockPresignedResponse);

      // Assert
      expect(result).toHaveLength(2);

      // Verificar el primer presigned (END_USER_POLICY)
      expect(result[0].url).toBe('https://example.com/acceptance');
      expect(result[0].type).toBe(PresignedType.END_USER_POLICY);
      expect(result[0].token).toBe('acceptance_token_1');

      // Verificar el segundo presigned (PERSONAL_DATA_AUTH)
      expect(result[1].url).toBe('https://example.com/personal-data');
      expect(result[1].type).toBe(PresignedType.PERSONAL_DATA_AUTH);
      expect(result[1].token).toBe('acceptance_token_2');
    });

    it('should throw error when required fields are missing', () => {
      // Arrange
      const invalidPresignedResponse: GetPresignedResponseDto = {
        data: {
          presigned_acceptance: {
            acceptance_token: '',
            permalink: '',
            type: '',
          },
          presigned_personal_data_auth: {
            acceptance_token: '',
            permalink: '',
            type: '',
          },
        },
      };

      // Act & Assert
      expect(() =>
        PresignedWompiMapper.toDomainList(invalidPresignedResponse),
      ).toThrow();
    });

    it('should handle invalid presigned types', () => {
      // Arrange
      const invalidTypePresignedResponse: GetPresignedResponseDto = {
        data: {
          presigned_acceptance: {
            acceptance_token: 'acceptance_token_1',
            permalink: 'https://example.com/acceptance',
            type: 'INVALID_TYPE',
          },
          presigned_personal_data_auth: {
            acceptance_token: 'acceptance_token_2',
            permalink: 'https://example.com/personal-data',
            type: 'INVALID_TYPE',
          },
        },
      };

      // Act & Assert
      expect(() =>
        PresignedWompiMapper.toDomainList(invalidTypePresignedResponse),
      ).toThrow();
    });
  });
});
