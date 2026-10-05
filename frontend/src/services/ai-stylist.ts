import { aiApiFetch } from "../lib/api";

export type FashionIntent = {
  occasion?: string | null;
  style?: string | null;
  formality?: number | null;
  mood?: string | null;
  weather_sensitive?: boolean | null;
  color_preference?: string[] | null;
  excluded_items?: string[] | null;
};

export type QueryEmbeddingResponse = {
  query: string;
  intent: FashionIntent;
  embedding: number[];
  embedding_dimensions: number;
};

export function embedFashionQuery(query: string) {
  return aiApiFetch<QueryEmbeddingResponse>("/embed-query", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}
