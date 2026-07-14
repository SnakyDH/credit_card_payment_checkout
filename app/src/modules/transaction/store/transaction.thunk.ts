import { transactionApiService } from "@/modules/transaction/services/transaction-api.service";
import { createAsyncThunk } from "@reduxjs/toolkit";

import type {
  FinishTransactionRequest,
  FinishTransactionResponse,
  InitTransactionRequest,
  InitTransactionResponse,
} from "@/modules/transaction/types/transaction-api.types";

export const initTransaction = createAsyncThunk<
  InitTransactionResponse,
  InitTransactionRequest,
  { rejectValue: string }
>("transaction/initTransaction", async (request, { rejectWithValue }) => {
  try {
    return await transactionApiService.initTransaction(request);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to init transaction";
    return rejectWithValue(message);
  }
});

export const finishTransaction = createAsyncThunk<
  FinishTransactionResponse,
  FinishTransactionRequest,
  { rejectValue: string }
>("transaction/finishTransaction", async (request, { rejectWithValue }) => {
  try {
    return await transactionApiService.finishTransaction(request);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to finish transaction";
    return rejectWithValue(message);
  }
});
