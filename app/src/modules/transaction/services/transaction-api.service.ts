import { apiClient } from "@/modules/shared/api/api-client";
import {
  FinishTransactionRequest,
  FinishTransactionResponse,
  GetTransactionByIdResponse,
  InitTransactionRequest,
  InitTransactionResponse,
} from "@/modules/transaction/types/transaction-api.types";

export const transactionApiService = {
  initTransaction(
    request: InitTransactionRequest,
  ): Promise<InitTransactionResponse> {
    return apiClient<InitTransactionResponse>("/transactions/init-transaction", {
      method: "POST",
      body: request,
    });
  },

  finishTransaction(
    request: FinishTransactionRequest,
  ): Promise<FinishTransactionResponse> {
    return apiClient<FinishTransactionResponse>(
      "/transactions/finish-transaction",
      {
        method: "POST",
        body: request,
      },
    );
  },

  getApprovedTransactionById(id: number): Promise<GetTransactionByIdResponse> {
    return apiClient<GetTransactionByIdResponse>(
      `/transactions/approved-transaction-by-id/${id}`,
    );
  },
};
