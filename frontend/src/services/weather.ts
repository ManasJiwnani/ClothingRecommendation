import { apiFetch } from "../lib/api";

export type WeatherRequest = {
  user_id: string;
  latitude: number;
  longitude: number;
  top_k: number;
};

export async function getWeather(
  userId: string,
  latitude: number,
  longitude: number
) {
  return apiFetch("/weather", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      latitude,
      longitude,
      top_k: 5,
    }),
  });
}