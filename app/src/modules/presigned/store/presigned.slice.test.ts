import { presignedReducer } from "@/modules/presigned/store/presigned.slice";
import { fetchPresigned } from "@/modules/presigned/store/presigned.thunk";
import { PresignedType } from "@/modules/presigned/types/presigned-api.types";

describe("presigned slice", () => {
  const initialState = presignedReducer(undefined, { type: "@@INIT" });

  it("handles fetchPresigned.pending", () => {
    const state = presignedReducer(initialState, fetchPresigned.pending(""));

    expect(state.status).toBe("loading");
    expect(state.error).toBeNull();
  });

  it("handles fetchPresigned.fulfilled", () => {
    const payload = [
      {
        url: "https://example.com/policy",
        type: PresignedType.END_USER_POLICY,
        token: "token-1",
      },
    ];

    const state = presignedReducer(
      initialState,
      fetchPresigned.fulfilled(payload, ""),
    );

    expect(state.status).toBe("succeeded");
    expect(state.items).toEqual(payload);
  });

  it("handles fetchPresigned.rejected", () => {
    const state = presignedReducer(
      initialState,
      fetchPresigned.rejected(new Error("fail"), "", undefined, "Failed"),
    );

    expect(state.status).toBe("failed");
    expect(state.error).toBe("Failed");
  });
});
