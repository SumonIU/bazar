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
      ...(options.headers ?? {}),
    },
    credentials: "include",
  });

  if (!response.ok) {
    let errorMessage = "Request failed";
    try {
      const errorBody = (await response.json()) as { message?: string };
      errorMessage = errorBody.message ?? errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    const error: ApiError = { message: errorMessage, status: response.status };
    throw error;
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}
