import { Controller, Get } from '@nestjs/common';
import { Presigned } from '@domain/presigned/model/presigned.model';
import { GetPresignedHandler } from '@adapter/in/handlers/get-presigned-handler';
import { HttpExceptionHandler } from '@adapter/in/handlers/http-exception.handler';

@Controller('presigned')
export class PresignedController {
  constructor(
    private readonly getPresignedsHandler: GetPresignedHandler,
    private readonly httpExceptionHandler: HttpExceptionHandler,
  ) {}

  @Get()
  async getPresigned(): Promise<Presigned[]> {
    try {
      return await this.getPresignedsHandler.call();
    } catch (error) {
      throw this.httpExceptionHandler.handle(error);
    }
  }
}
