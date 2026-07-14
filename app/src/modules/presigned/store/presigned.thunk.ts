import { presignedApiService } from "@/modules/presigned/services/presigned-api.service";
import { createAsyncThunk } from "@reduxjs/toolkit";

import type { PresignedResponse } from "@/modules/presigned/types/presigned-api.types";

export const fetchPresigned = createAsyncThunk<
  PresignedResponse[],
  void,
  { rejectValue: string }
>("presigned/fetchPresigned", async (_, { rejectWithValue }) => {
  try {
    return await presignedApiService.getPresigned();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch presigned documents";
    return rejectWithValue(message);
  }
});
