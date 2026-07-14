import { Presigned } from 'domain/presigned/model/presigned.model';
import { IPresignedRepository } from 'domain/presigned/repository/presigned-repository.interface';
import { GetPresignedResponseDto } from '../dtos/get-presigned-response.dto';
import { PresignedGatewayMapper } from '../mappers/presigned-gateway.mapper';
import { HttpService } from '@nestjs/axios';
import { envConstants } from '@config/env-constants';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from '@config/logger.service';

export class PresignedGatewayRepository implements IPresignedRepository {
  private readonly logger = new LoggerService(PresignedGatewayRepository.name);
  constructor(private readonly paymentGatewayService: HttpService) {}

  async getPresigneds(): Promise<Presigned[]> {
    try {
      const request: AxiosRequestConfig = {
        method: 'GET',
        url: `/v1/merchants/${envConstants.paymentGateway.publicKey}`,
      };
      this.logger.log('Request', { request });

      const { data } = await firstValueFrom(
        this.paymentGatewayService.request<GetPresignedResponseDto>(request),
      );
      this.logger.log('Response', { data });

      return PresignedGatewayMapper.toDomainList(data);
    } catch (error) {
      this.logger.error('Error getting Presigneds', { error: error as Error });
      throw new Error(
        'Failed to get Presigneds from payment gateway: ' +
          JSON.stringify(error),
      );
    }
  }
}
