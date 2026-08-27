// ======================================================
// JALDRISHTI API HTTP CLIENT
// ======================================================

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8000/api/v1";

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const isFormData = customConfig.body instanceof FormData;

  const defaultHeaders: Record<string, string> = {
    Accept: "application/json",
  };

  if (!isFormData) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...(headers as Record<string, string>),
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }

      const errorMessage =
        (typeof errorData === "object" && errorData?.detail) ||
        (typeof errorData === "object" && errorData?.message) ||
        `HTTP ${response.status}: ${response.statusText}`;

      throw new ApiError(response.status, errorMessage, errorData);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(0, err.message || "Network Error or Backend Offline");
  }
}

export async function pingBackend(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    return res.ok;
  } catch {
    return false;
  }
}
