import { configureStore } from "@reduxjs/toolkit";

import { presignedApiService } from "@/modules/presigned/services/presigned-api.service";
import { presignedReducer } from "@/modules/presigned/store/presigned.slice";
import { fetchPresigned } from "@/modules/presigned/store/presigned.thunk";
import { PresignedType } from "@/modules/presigned/types/presigned-api.types";

jest.mock("@/modules/presigned/services/presigned-api.service");

describe("presigned thunk", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetchPresigned fulfills with API response", async () => {
    const response = [
      {
        url: "https://example.com/policy",
        type: PresignedType.END_USER_POLICY,
        token: "token-1",
      },
    ];

    (presignedApiService.getPresigned as jest.Mock).mockResolvedValue(response);

    const store = configureStore({ reducer: { presigned: presignedReducer } });
    const result = await store.dispatch(fetchPresigned());

    expect(fetchPresigned.fulfilled.match(result)).toBe(true);
    expect(result.payload).toEqual(response);
  });

  it("fetchPresigned rejects with error message", async () => {
    (presignedApiService.getPresigned as jest.Mock).mockRejectedValue(
      new Error("Request failed"),
    );

    const store = configureStore({ reducer: { presigned: presignedReducer } });
    const result = await store.dispatch(fetchPresigned());

    expect(fetchPresigned.rejected.match(result)).toBe(true);
    expect(result.payload).toBe("Request failed");
  });

  it("fetchPresigned rejects with fallback message for non-Error", async () => {
    (presignedApiService.getPresigned as jest.Mock).mockRejectedValue("bad");

    const store = configureStore({ reducer: { presigned: presignedReducer } });
    const result = await store.dispatch(fetchPresigned());

    expect(fetchPresigned.rejected.match(result)).toBe(true);
    expect(result.payload).toBe("Failed to fetch presigned documents");
  });
});
