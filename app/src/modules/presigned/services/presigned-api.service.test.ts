import { presignedApiService } from "@/modules/presigned/services/presigned-api.service";
import { apiClient } from "@/modules/shared/api/api-client";

jest.mock("@/modules/shared/api/api-client");

describe("presignedApiService", () => {
  it("calls getPresigned endpoint", async () => {
    (apiClient as jest.Mock).mockResolvedValue([]);

    await presignedApiService.getPresigned();

    expect(apiClient).toHaveBeenCalledWith("/presigned");
  });
});
