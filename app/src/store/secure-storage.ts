import * as SecureStore from "expo-secure-store";

const safeKey = (key: string) => key.replace(/[^A-Za-z0-9._-]/g, "_");

export const secureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(safeKey(key)),
  setItem: (key: string, value: string) =>
    SecureStore.setItemAsync(safeKey(key), value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(safeKey(key)),
};
