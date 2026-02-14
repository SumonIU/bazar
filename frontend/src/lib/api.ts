type ApiError = {
  message: string;
  status: number;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3333/api";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/${path.replace(/^\/+/, "")}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers ?? {}),
    },
    credentials: "include",
  });

  if (!response.ok) {
    let errorMessage = "Request failed";
    try {
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const errorText = await response.text();
        try {
          const errorBody = JSON.parse(errorText) as { message?: string };
          errorMessage = errorBody.message ?? errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      } else {
        const errorText = await response.text();
        errorMessage = errorText || response.statusText || errorMessage;
      }
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    const error: ApiError = { message: errorMessage, status: response.status };
    throw error;
  }

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const error: ApiError = {
      message: "Unexpected response from server.",
      status: response.status,
    };
    throw error;
  }

  const responseText = await response.text();
  if (!responseText) {
    return {} as T;
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    const error: ApiError = {
      message: "Invalid JSON response from server.",
      status: response.status,
    };
    throw error;
  }
}
