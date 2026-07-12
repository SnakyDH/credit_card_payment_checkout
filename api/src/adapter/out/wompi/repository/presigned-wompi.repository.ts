import { Presigned } from 'domain/presigned/model/presigned.model';
import { IPresignedRepository } from 'domain/presigned/repository/presigned-repository.interface';
import { GetPresignedResponseDto } from '../dtos/get-presigned-response.dto';
import { PresignedWompiMapper } from '../mappers/presigned-wompi.mapper';
import { HttpService } from '@nestjs/axios';
import { envConstants } from '@config/env-constants';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from '@config/logger.service';

export class PresignedWompiService implements IPresignedRepository {
  private readonly logger = new LoggerService(PresignedWompiService.name);
  constructor(private readonly wompiService: HttpService) {}

  async getPresigneds(): Promise<Presigned[]> {
    try {
      const request: AxiosRequestConfig = {
        method: 'GET',
        url: `/v1/merchants/${envConstants.wompi.publicKey}`,
      };
      this.logger.log('Request', { request });

      const { data } = await firstValueFrom(
        this.wompiService.request<GetPresignedResponseDto>(request),
      );
      this.logger.log('Response', { data });

      return PresignedWompiMapper.toDomainList(data);
    } catch (error) {
      this.logger.error('Error getting Presigneds', { error: error as Error });
      throw new Error(
        'Failed to get Presigneds from Wompi: ' + JSON.stringify(error),
      );
    }
  }
}
