import * as SecureStore from "expo-secure-store";

import { secureStorage } from "@/store/secure-storage";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe("secureStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sanitizes keys with invalid characters", async () => {
    await secureStorage.setItem("persist:transaction", "value");

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "persist_transaction",
      "value",
    );
  });

  it("reads values with sanitized keys", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("stored");

    const value = await secureStorage.getItem("persist:transaction");

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith("persist_transaction");
    expect(value).toBe("stored");
  });

  it("removes values with sanitized keys", async () => {
    await secureStorage.removeItem("persist:transaction");

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      "persist_transaction",
    );
  });
});
