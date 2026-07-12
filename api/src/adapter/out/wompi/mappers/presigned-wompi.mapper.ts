import { Presigned } from 'domain/presigned/model/presigned.model';
import { GetPresignedResponseDto } from '../dtos/get-presigned-response.dto';
import { PresignedType } from 'domain/presigned/model/presigned.type';
import { ExceptionConstants } from '@domain/shared/exceptions/exception-constants';
import { ExceptionCustom } from '@domain/shared/exceptions/exception-custom';

export abstract class PresignedWompiMapper {
  static toDomainList(presignedDto: GetPresignedResponseDto): Presigned[] {
    const presignedAcceptance = presignedDto.data.presigned_acceptance;
    const presignedPersonalDataAuth =
      presignedDto.data.presigned_personal_data_auth;

    if (
      !presignedAcceptance.acceptance_token ||
      !presignedAcceptance.permalink
    ) {
      throw new ExceptionCustom(ExceptionConstants.GET_PRESIGNED_ERROR);
    }

    if (
      !presignedPersonalDataAuth.acceptance_token ||
      !presignedPersonalDataAuth.permalink
    ) {
      throw new ExceptionCustom(ExceptionConstants.GET_PRESIGNED_ERROR);
    }

    if (presignedAcceptance.type !== 'END_USER_POLICY') {
      throw new ExceptionCustom(ExceptionConstants.GET_END_USER_POLICY_ERROR);
    }

    if (presignedPersonalDataAuth.type !== 'PERSONAL_DATA_AUTH') {
      throw new ExceptionCustom(
        ExceptionConstants.GET_PERSONAL_DATA_AUTH_ERROR,
      );
    }

    return [
      new Presigned(
        presignedAcceptance.permalink,
        PresignedType.END_USER_POLICY,
        presignedAcceptance.acceptance_token,
      ),
      new Presigned(
        presignedPersonalDataAuth.permalink,
        PresignedType.PERSONAL_DATA_AUTH,
        presignedPersonalDataAuth.acceptance_token,
      ),
    ];
  }
}
