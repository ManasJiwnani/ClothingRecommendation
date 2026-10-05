import { apiFetch } from "../lib/api";

export type ClothingItem = {
  id: string;
  user_id: string;
  image_url: string;
  category?: string;
  clothing_type?: string;
  subcategory?: string;
  color?: string;
  secondary_color?: string;
  pattern?: string;
  material?: string;
  sleeve_type?: string;
  fit?: string;
  style?: string;
  formality?: number;
  season?: string[];
  occasions?: string[];
  embedding?: number[];
  created_at?: string;
};

export type NewClothingItem = Omit<ClothingItem, "id" | "created_at"> & {
  embedding: number[];
};

type CreateClothingResponse = {
  message: string;
  data: ClothingItem | ClothingItem[];
};

export function getClothes(userId: string) {
  return apiFetch<ClothingItem[]>(`/clothes/${encodeURIComponent(userId)}`);
}

export function getClothing(clothingId: string) {
  return apiFetch<ClothingItem>(
    `/clothing/${encodeURIComponent(clothingId)}`
  );
}

export async function createClothing(
  userId: string,
  clothing: Omit<NewClothingItem, "user_id">
) {
  const response = await apiFetch<CreateClothingResponse>(
    `/clothes/${encodeURIComponent(userId)}`,
    {
      method: "POST",
      body: JSON.stringify({
        ...clothing,
        user_id: userId,
      }),
    }
  );

  const createdItem = Array.isArray(response.data)
    ? response.data[0]
    : response.data;

  if (!createdItem) {
    throw new Error("The backend did not return the saved clothing item.");
  }

  return createdItem;
}
