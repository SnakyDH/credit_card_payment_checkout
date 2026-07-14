import { fetchPresigned } from "@/modules/presigned/store/presigned.thunk";
import { createSlice } from "@reduxjs/toolkit";

import type { PresignedResponse } from "@/modules/presigned/types/presigned-api.types";

export type PresignedStatus = "idle" | "loading" | "succeeded" | "failed";

export interface PresignedState {
  items: PresignedResponse[];
  status: PresignedStatus;
  error: string | null;
}

const initialState: PresignedState = {
  items: [],
  status: "idle",
  error: null,
};

const presignedSlice = createSlice({
  name: "presigned",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPresigned.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPresigned.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchPresigned.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? "Failed to fetch presigned documents";
      });
  },
});

export const presignedReducer = presignedSlice.reducer;
