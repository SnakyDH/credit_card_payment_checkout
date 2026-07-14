import {
  finishTransaction,
  initTransaction,
} from "@/modules/transaction/store/transaction.thunk";
import { createSlice } from "@reduxjs/toolkit";

import type {
  FinishTransactionResponse,
  InitTransactionResponse,
} from "@/modules/transaction/types/transaction-api.types";

export type TransactionStatus = "idle" | "loading" | "succeeded" | "failed";

export interface TransactionState {
  initStatus: TransactionStatus;
  finishStatus: TransactionStatus;
  init: InitTransactionResponse | null;
  result: FinishTransactionResponse | null;
  error: string | null;
}

const initialState: TransactionState = {
  initStatus: "idle",
  finishStatus: "idle",
  init: null,
  result: null,
  error: null,
};

const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    resetTransaction: () => initialState,
    setTransactionResult: (
      state,
      action: { payload: FinishTransactionResponse },
    ) => {
      state.finishStatus = "succeeded";
      state.result = action.payload;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initTransaction.pending, (state) => {
        state.initStatus = "loading";
        state.error = null;
      })
      .addCase(initTransaction.fulfilled, (state, action) => {
        state.initStatus = "succeeded";
        state.init = action.payload;
      })
      .addCase(initTransaction.rejected, (state, action) => {
        state.initStatus = "failed";
        state.error = action.payload ?? "Failed to init transaction";
      })
      .addCase(finishTransaction.pending, (state) => {
        state.finishStatus = "loading";
        state.error = null;
      })
      .addCase(finishTransaction.fulfilled, (state, action) => {
        state.finishStatus = "succeeded";
        state.result = action.payload;
      })
      .addCase(finishTransaction.rejected, (state, action) => {
        state.finishStatus = "failed";
        state.error = action.payload ?? "Failed to finish transaction";
      });
  },
});

export const { resetTransaction, setTransactionResult } =
  transactionSlice.actions;
export const transactionReducer = transactionSlice.reducer;
