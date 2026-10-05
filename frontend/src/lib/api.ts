// const API_URL = process.env.EXPO_PUBLIC_API_URL;

// if (!API_URL) {
//   throw new Error("EXPO_PUBLIC_API_URL is not configured");
// }

// export async function apiFetch(
//   endpoint: string,
//   options: RequestInit = {}
// ) {
//   const response = await fetch(`${API_URL}${endpoint}`, {
//     ...options,
//     headers: {
//       "Content-Type": "application/json",
//       ...(options.headers || {}),
//     },
//   });

//   const data = await response.json();

//   if (!response.ok) {
//     throw new Error(data.detail || "API request failed");
//   }

//   return data;
// }

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();

  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      typeof data === "object" && data?.detail
        ? data.detail
        : "API request failed"
    );
  }

  return data;
}