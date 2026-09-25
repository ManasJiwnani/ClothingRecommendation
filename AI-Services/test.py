"""
Canvas normalization for segmented garment cutouts.
Drop this in before the Cloudinary upload step in the AI-Services
pipeline. It fixes the top/bottom proportion mismatch in the "Your
Look" outfit card by giving every garment cutout the same canvas
size and the same fill ratio, regardless of the garment's original
pixel dimensions or how much transparent padding segmentation left
around it.
"""
from typing import Literal
from PIL import Image
# Map your tagging categories to where the garment should sit on its
# canvas, so stacked tops/bottoms line up the way they're actually worn.
CATEGORY_ANCHOR = {
   "top": "top", "shirt": "top", "t-shirt": "top", "blouse": "top",
   "jacket": "top", "outerwear": "top", "sweater": "top",
   "bottom": "bottom", "trouser": "bottom", "trousers": "bottom",
   "pants": "bottom", "jeans": "bottom", "skirt": "bottom",
}

def normalize_garment_canvas(
   image: Image.Image,
   canvas_size: int = 512,
   fill_ratio: float = 0.85,
   anchor: Literal["center", "top", "bottom"] = "center",
) -> Image.Image:
   """
   Place an RGBA garment cutout onto a fixed square canvas at a
   consistent scale.
   1. Trim to the actual non-transparent bounding box — segmentation
      output often has inconsistent empty padding around the garment,
      which is what made your top and bottom look mismatched in size.
   2. Scale the trimmed garment so its longest side fills `fill_ratio`
      of the canvas, preserving aspect ratio.
   3. Paste onto a transparent `canvas_size` x `canvas_size` canvas,
      positioned by `anchor`.
   """
   if image.mode != "RGBA":
       image = image.convert("RGBA")
   # 1. Trim to non-transparent bounding box
   alpha = image.split()[-1]
   bbox = alpha.getbbox()
   if bbox is None:
       return Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
   trimmed = image.crop(bbox)
   # 2. Scale to fill_ratio of canvas, preserving aspect ratio
   target_dim = int(canvas_size * fill_ratio)
   w, h = trimmed.size
   scale = target_dim / max(w, h)
   new_w, new_h = max(1, round(w * scale)), max(1, round(h * scale))
   resized = trimmed.resize((new_w, new_h), Image.LANCZOS)
   # 3. Paste onto fixed transparent canvas
   canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
   x = (canvas_size - new_w) // 2
   margin = int(canvas_size * 0.05)
   if anchor == "top":
       y = margin
   elif anchor == "bottom":
       y = canvas_size - new_h - margin
   else:
       y = (canvas_size - new_h) // 2
   canvas.paste(resized, (x, y), resized)
   return canvas

def process_cutout(image: Image.Image, garment_category: str) -> Image.Image:
   """Convenience wrapper: pick the anchor from your tagging category."""
   anchor = CATEGORY_ANCHOR.get(garment_category.lower(), "center")
   return normalize_garment_canvas(image, anchor=anchor)

if __name__ == "__main__":
   # Quick manual check: run two cutouts of very different native sizes
   # through the same pipeline and confirm both land on a 512x512 canvas
   # at a comparable scale.
   top = Image.open("tshirt.png")
   bottom = Image.open("jeans.png")
   normalized_top = process_cutout(top, "shirt")
   normalized_bottom = process_cutout(bottom, "trousers")
   normalized_top.save("tshirt_normalized.png")
   normalized_bottom.save("jeans_normalized.png")
   print(normalized_top.size, normalized_bottom.size)  # both (512, 512)