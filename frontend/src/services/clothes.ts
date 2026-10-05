import { apiFetch } from "../lib/api";

export async function getClothes(userId: string) {
  return apiFetch(`/clothes/${userId}`);
}

export async function getClothing(clothingId: string) {
  return apiFetch(`/clothing/${clothingId}`);
}