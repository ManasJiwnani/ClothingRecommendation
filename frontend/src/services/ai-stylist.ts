import { aiApiFetch } from "../lib/api";

export type FashionIntent = {
  occasion?: string | null;
  style?: string | null;
  formality?: number | null;
  mood?: string | null;
  weather_sensitive?: boolean | null;
  color_preference?: string[] | null;
  excluded_items?: string[] | null;
  category_preference?: string[] | null;
  cultural_aesthetic?: string | null;
  is_strictly_traditional?: boolean | null;
  item_constraints?: {
    category?: string | null;
    color?: string | null;
    garment?: string | null;
  }[] | null;
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
