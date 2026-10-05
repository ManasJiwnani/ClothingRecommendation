import { API_BASE_URL } from "../constants/api";
import { Platform } from "react-native";

const FASHION_API_URL = (
  process.env.EXPO_PUBLIC_FASHION_API_URL ||
  (Platform.OS === "web" ? process.env.EXPO_PUBLIC_API_URL : undefined) ||
  API_BASE_URL
).replace(/\/+$/, "");

function defaultAiApiUrl() {
  const url = new URL(FASHION_API_URL);
  url.port = "8001";
  return url.origin;
}

const AI_API_URL =
  process.env.EXPO_PUBLIC_AI_API_URL || defaultAiApiUrl();

async function request<T>(
  baseUrl: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const detail =
      typeof data === "object" && data !== null && "detail" in data
        ? data.detail
        : data;
    const message =
      typeof detail === "string"
        ? detail
        : response.statusText || "API request failed";

    throw new Error(message);
  }

  return data as T;
}

export function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
) {
  return request<T>(FASHION_API_URL, endpoint, options);
}

export function aiApiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
) {
  return request<T>(AI_API_URL, endpoint, options);
}
