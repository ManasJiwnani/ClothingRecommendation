import { aiApiFetch } from "../lib/api";
import { Platform } from "react-native";

export type ProcessedClothingItem = {
  image_url: string;
  category: string;
  subcategory: string;
  color: string;
  secondary_color: string;
  pattern: string;
  material: string;
  sleeve_type: string;
  fit: string;
  style: string;
  formality: number;
  season: string[];
  occasions: string[];
  embedding: number[];
};

export type AddItemMode = "single" | "outfit";
export type ProcessClothingResult =
  | ProcessedClothingItem
  | ProcessedClothingItem[];

type NativeImageFile = {
  uri: string;
  name: string;
  type: string;
};

type NativeFormData = FormData & {
  append(name: string, value: NativeImageFile): void;
};

async function createImageFormData(
  imageUri: string,
  userId: string
): Promise<FormData> {
  const uriPath = imageUri.split(/[?#]/, 1)[0];
  const uriFilename = uriPath.split("/").pop();
  const filename =
    uriFilename && /\.(jpe?g|png|webp)$/i.test(uriFilename)
      ? uriFilename
      : `clothing-${Date.now()}.jpg`;
  const extension = filename.split(".").pop()?.toLowerCase() || "jpg";
  const type =
    extension === "png"
      ? "image/png"
      : extension === "webp"
        ? "image/webp"
        : "image/jpeg";
  const formData = new FormData();

  if (Platform.OS === "web") {
    const imageResponse = await fetch(imageUri);
    if (!imageResponse.ok) {
      throw new Error("Could not read the selected image.");
    }
    formData.append("file", await imageResponse.blob(), filename);
  } else {
    (formData as NativeFormData).append("file", {
      uri: imageUri,
      name: filename,
      type,
    });
  }
  formData.append("user_id", userId);

  return formData;
}

export async function processSingleItem(
  imageUri: string,
  userId: string
): Promise<ProcessedClothingItem> {
  const body = await createImageFormData(imageUri, userId);
  return aiApiFetch("/process-image", {
    method: "POST",
    body,
  });
}

export async function processWholeOutfit(
  imageUri: string,
  userId: string
): Promise<ProcessedClothingItem[]> {
  const body = await createImageFormData(imageUri, userId);
  return aiApiFetch("/process-whole-outfit", {
    method: "POST",
    body,
  });
}

export function processClothingImage(
  imageUri: string,
  userId: string,
  mode: AddItemMode
): Promise<ProcessClothingResult> {
  return mode === "single"
    ? processSingleItem(imageUri, userId)
    : processWholeOutfit(imageUri, userId);
}

export function getProcessedImageUrl(
  item: ProcessedClothingItem
): string | null {
  return item.image_url || null;
}
