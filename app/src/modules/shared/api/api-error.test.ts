import { ApiError } from "@/modules/shared/api/api-error";

describe("ApiError", () => {
  it("stores status and message", () => {
    const error = new ApiError(404, "Not found");

    expect(error.status).toBe(404);
    expect(error.message).toBe("Not found");
    expect(error.name).toBe("ApiError");
  });
});
