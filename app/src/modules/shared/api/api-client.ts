import { apiConfig } from "@/modules/shared/api/api-config";
import { ApiError } from "@/modules/shared/api/api-error";
import { resolveErrorMessage } from "@/modules/shared/api/error-messages";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  params?: object;
};

function buildUrl(path: string, params?: object): string {
  const url = new URL(`${apiConfig.baseUrl}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, params } = options;

  const response = await fetch(buildUrl(path, params), {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let rawMessage: string | string[] | undefined;

    try {
      const errorBody = (await response.json()) as {
        message?: string | string[];
      };
      rawMessage = errorBody.message;
    } catch {
      // Keep default status text when the body is not JSON.
    }

    const message = resolveErrorMessage(rawMessage, response.statusText);
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
