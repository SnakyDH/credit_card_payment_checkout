import { apiClient } from "@/modules/shared/api/api-client";
import { PresignedResponse } from "@/modules/presigned/types/presigned-api.types";

export const presignedApiService = {
  getPresigned(): Promise<PresignedResponse[]> {
    return apiClient<PresignedResponse[]>("/presigned");
  },
};
