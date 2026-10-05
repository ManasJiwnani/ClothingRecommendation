import { apiFetch } from "../lib/api";

export type WeatherObservation = {
  temperature?: number;
  feels_like?: number;
  precipitation?: number;
  rain?: number;
  weather_code?: number;
  city?: string;
  location?: string;
};

export type WeatherContext = {
  temperature?: number;
  temperature_category?: string;
  rain_category?: string;
  overall?: string;
  weather_code?: number;
};

export type WeatherResponse = {
  user_id: string;
  weather: WeatherObservation;
  weather_context: WeatherContext;
  city?: string;
  location?: string;
};

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
  return apiFetch<WeatherResponse>("/weather", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      latitude,
      longitude,
      top_k: 5,
    }),
  });
}