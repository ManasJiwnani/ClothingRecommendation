import { apiFetch } from "../lib/api";
import type { FashionIntent } from "./ai-stylist";

export type RecommendationPreset =
  | "weather"
  | "dinner"
  | "meeting"
  | "presentation"
  | "college"
  | "weekend"
  | "casual-day"
  | "party";

export type OutfitRecommendation = {
  outfit: {
    type?: string;
    top?: Record<string, unknown>;
    bottom?: Record<string, unknown>;
    footwear?: Record<string, unknown>;
    accessory?: Record<string, unknown>;
    dress?: Record<string, unknown>;
  };
  score?: number;
};

export type DailyRecommendationResponse = {
  success: boolean;
  preset: RecommendationPreset;
  user_id: string;
  available_clothes?: number;
  weather_compatible_clothes?: number;
  intent_compatible_clothes?: number;
  generated_outfits?: number;
  weather: Record<string, unknown> | null;
  weather_context: Record<string, unknown>;
  weather_error?: string | null;
  intent: FashionIntent;
  recommendations: OutfitRecommendation[];
};

export type RecommendationResponse = {
  user_id: string;
  intent: FashionIntent;
  weather: Record<string, unknown> | null;
  weather_context: Record<string, unknown> | null;
  weather_error?: string | null;
  recommendations: OutfitRecommendation[];
};

export async function getDailyRecommendation(
  userId: string,
  preset: RecommendationPreset,
  latitude: number,
  longitude: number
) {
  return apiFetch<DailyRecommendationResponse>(
    "/daily-recommendation",
    {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        preset,
        latitude,
        longitude,
      }),
    }
  );
}

export async function getRecommendations(
  userId: string,
  queryEmbedding: number[],
  intent: FashionIntent,
  latitude: number,
  longitude: number
) {
  return apiFetch<RecommendationResponse>("/recommend", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      query_embedding: queryEmbedding,
      intent: {
        ...intent,
        weather_sensitive: intent.weather_sensitive ?? false,
        color_preference: intent.color_preference ?? [],
        excluded_items: intent.excluded_items ?? [],
      },
      latitude,
      longitude,
      retrieval_limit: 5,
      top_k: 5,
    }),
  });
}

export function searchClothes(
  userId: string,
  queryEmbedding: number[],
  limit = 5
) {
  return apiFetch<{ results: Record<string, unknown>[] }>(
    "/search-clothes",
    {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        query_embedding: queryEmbedding,
        limit,
      }),
    }
  );
}

export function retrieveClothes(
  userId: string,
  queryEmbedding: number[],
  intent: FashionIntent,
  limit = 20
) {
  return apiFetch<{
    count: number;
    clothes: Record<string, unknown>[];
  }>("/retrieve-clothes", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      query_embedding: queryEmbedding,
      dimensions: 768,
      intent,
      limit,
    }),
  });
}

export function swapOutfitItem(
  userId: string,
  swapCategory: string,
  currentItemId: string | undefined,
  lockedItems: Record<string, unknown>[]
) {
  return apiFetch<{
    success: boolean;
    swap_category: string;
    candidate_count: number;
    alternatives: Record<string, unknown>[];
  }>("/swap-item", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      swap_category: swapCategory,
      current_item_id: currentItemId,
      locked_items: lockedItems,
    }),
  });
}

export function getLayerRecommendations(
  userId: string,
  outfitItemIds: string[],
  temperature?: number,
  weatherCondition?: string
) {
  return apiFetch<{
    layer_recommendations: Record<string, unknown>[];
  }>("/add-layer", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      outfit_item_ids: outfitItemIds,
      temperature,
      weather_condition: weatherCondition,
      top_k: 5,
    }),
  });
}

export function likeOutfit(
  userId: string,
  outfit: Record<string, unknown>
) {
  return apiFetch<{
    success: boolean;
    message: string;
    liked_outfit_id: string | null;
  }>("/outfits/like", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, outfit }),
  });
}

export function getLikedOutfits(userId: string) {
  return apiFetch<{
    success: boolean;
    count: number;
    outfits: Record<string, unknown>[];
  }>(`/outfits/liked/${encodeURIComponent(userId)}`);
}
