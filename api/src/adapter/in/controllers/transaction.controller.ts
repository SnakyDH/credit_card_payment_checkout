import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InitTransactionRequestDto } from '@adapter/in/dtos/request/init-transaction-request.dto';
import { InitTransactionResponseDto } from '@adapter/in/dtos/response/init-transaction-response.dto';
import { InitTransactionHandler } from '@adapter/in/handlers/init-transaction.handler';
import { HttpExceptionHandler } from '@adapter/in/handlers/http-exception.handler';
import { FinishTransactionRequestDto } from '@adapter/in/dtos/request/finish-transaction-request.dto';
import { FinishTransactionResponseDto } from '@adapter/in/dtos/response/finish-transaction-response.dto';
import { FinishTransactionHandler } from '@adapter/in/handlers/finish-transaction.handler';
import { GetTransactionByIdResponseDto } from '@adapter/in/dtos/response/get-transaction-by-id.response.dto';
import { GetTransactionByIdHandler } from '@adapter/in/handlers/get-transaction-by-id.handler';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly initTransactionHandler: InitTransactionHandler,
    private readonly finishTransactionHandler: FinishTransactionHandler,
    private readonly httpExceptionHandler: HttpExceptionHandler,
    private readonly getTransactionByIdHandler: GetTransactionByIdHandler,
  ) {}

  @Post('init-transaction')
  @ApiOperation({
    summary: 'Initialize a new transaction',
    description:
      'Creates a new transaction with presigned documents for user acceptance',
  })
  @ApiResponse({
    status: 201,
    description:
      'Transaction initialized successfully with presigned documents',
    type: InitTransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Product or delivery not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async initTransaction(
    @Body() request: InitTransactionRequestDto,
  ): Promise<InitTransactionResponseDto> {
    try {
      return await this.initTransactionHandler.call(request);
    } catch (error) {
      throw this.httpExceptionHandler.handle(error);
    }
  }

  @Post('finish-transaction')
  @ApiOperation({
    summary: 'Finish a transaction',
    description: 'Finishes a transaction and updates the transaction status',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction finished successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async finishTransaction(
    @Body() request: FinishTransactionRequestDto,
  ): Promise<FinishTransactionResponseDto> {
    try {
      return await this.finishTransactionHandler.call(request);
    } catch (error) {
      throw this.httpExceptionHandler.handle(error);
    }
  }

  @Get('approved-transaction-by-id/:id')
  @ApiOperation({
    summary: 'Get approved transaction by id',
    description: 'Get approved transaction by id',
  })
  @ApiResponse({
    status: 200,
    description: 'Approved transaction retrieved successfully',
    type: GetTransactionByIdResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Approved transaction not found',
  })
  async getApprovedTransactionById(
    @Param('id') id: number,
  ): Promise<GetTransactionByIdResponseDto> {
    try {
      return await this.getTransactionByIdHandler.call(id);
    } catch (error) {
      throw this.httpExceptionHandler.handle(error);
    }
  }
}
