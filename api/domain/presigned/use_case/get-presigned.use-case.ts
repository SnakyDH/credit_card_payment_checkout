import { ExceptionCustom } from '@domain/shared/exceptions/exception-custom';
import { Presigned } from '../model/presigned.model';
import { IPresignedRepository } from '../repository/presigned-repository.interface';
import { ExceptionConstants } from '@domain/shared/exceptions/exception-constants';
import { LoggerService } from '@config/logger.service';

export class GetPresignedUseCase {
  private readonly logger = new LoggerService(GetPresignedUseCase.name);
  constructor(private readonly presignedRepository: IPresignedRepository) {}

  async call(): Promise<Presigned[]> {
    try {
      this.logger.log('Getting Presigneds');
      const presignedList = await this.presignedRepository.getPresigneds();
      this.logger.log('Presigneds found', { presignedList });
      if (presignedList.length === 0) {
        throw new ExceptionCustom(ExceptionConstants.PRE_SIGNED_NOT_FOUND);
      }
      return presignedList;
    } catch (error) {
      this.logger.error('Error getting Presigneds', error);
      throw ExceptionCustom.validateException(
        error,
        ExceptionConstants.GET_PRESIGNED_ERROR,
      );
    }
  }
}
