const DEFAULT_API_URL = "http://localhost:3000/api";

export const apiConfig = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL,
};
