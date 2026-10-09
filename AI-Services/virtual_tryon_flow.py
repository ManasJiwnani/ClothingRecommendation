import asyncio
import base64
import hashlib
import os
import time
from io import BytesIO
from pathlib import Path
from urllib.parse import urlparse

import cv2
import numpy as np
import truststore

truststore.inject_into_ssl()

import aiohttp
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from PIL import Image, ImageChops
from pydantic import BaseModel


load_dotenv()

MAX_DIMENSION = 384
JPEG_QUALITY = 90
PADDING = 0.08
IMAGE_MODEL = "gpt-image-2.5-flare"
PERSON_IMAGE_PATH = Path(
    os.getenv("VTO_PERSON_IMAGE_PATH", Path(__file__).with_name("model.png"))
)

# Cache directory for preprocessed garment images
GARMENT_CACHE_DIR = Path(__file__).with_name("garment_cache")
GARMENT_CACHE_DIR.mkdir(exist_ok=True)

# Cache for preprocessed person image
_PERSON_PREPARED_CACHE: bytes | None = None


def get_person_prepared() -> bytes:
    """Return cached preprocessed person image, computing on first call."""
    global _PERSON_PREPARED_CACHE
    if _PERSON_PREPARED_CACHE is None:
        _PERSON_PREPARED_CACHE = crop_and_prepare(PERSON_IMAGE_PATH.read_bytes())
    return _PERSON_PREPARED_CACHE


def _get_garment_cache_path(url: str) -> Path:
    """Generate cache file path for a garment URL."""
    url_hash = hashlib.sha256(url.encode()).hexdigest()[:16]
    return GARMENT_CACHE_DIR / f"{url_hash}.jpg"


def get_garment_prepared(url: str) -> bytes:
    """Return cached preprocessed garment image, computing on first call."""
    cache_path = _get_garment_cache_path(url)
    if cache_path.exists():
        return cache_path.read_bytes()
    
    # Download and process the garment image
    async def _download_and_process():
        async with aiohttp.ClientSession() as session:
            image_bytes = await _download_image_async(session, url)
            return crop_and_prepare(image_bytes)
    
    garment_bytes = asyncio.run(_download_and_process())
    cache_path.write_bytes(garment_bytes)
    return garment_bytes


class Timer:
    """Simple context manager for timing code blocks."""
    def __init__(self, name: str):
        self.name = name
        self.start = 0.0
        self.elapsed = 0.0

    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, *args):
        self.elapsed = time.perf_counter() - self.start
        print(f"[TIMING] {self.name}: {self.elapsed:.3f}s")


async def _download_image_async(session: aiohttp.ClientSession, url: str) -> bytes:
    """Download a single image asynchronously."""
    async with session.get(
        url,
        headers={"User-Agent": "Mozilla/5.0"},
        timeout=aiohttp.ClientTimeout(total=30),
    ) as resp:
        resp.raise_for_status()
        return await resp.read()


app = FastAPI(title="Virtual Try-On Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VirtualTryOnRequest(BaseModel):
    top: str | None = None
    bottom: str | None = None
    shoes: str | None = None


def combine_outfit_for_vto(clothing_urls: dict[str, str | None]) -> bytes:
    """Combine clothing images into a single garment image. Uses cached preprocessed images."""
    canvas = Image.new("RGBA", (768, 1024), (255, 255, 255, 255))
    positions = {
        "top": (80, 40, 608, 380),
        "bottom": (120, 380, 528, 420),
        "shoes": (200, 780, 368, 200),
    }
    loaded_items = 0

    for category, url in clothing_urls.items():
        if not url or category not in positions:
            continue

        try:
            # Use cached preprocessed garment image (includes download + crop_and_prepare)
            garment_bytes = get_garment_prepared(url)
            image = Image.open(BytesIO(garment_bytes)).convert("RGBA")
        except Exception as error:
            print(f"Failed to load {category}: {error}")
            continue

        x, y, area_width, area_height = positions[category]
        image.thumbnail((area_width, area_height), Image.Resampling.LANCZOS)
        paste_x = x + (area_width - image.width) // 2
        canvas.paste(image, (paste_x, y), mask=image)
        loaded_items += 1

    if not loaded_items:
        raise ValueError("None of the selected clothing images could be loaded.")

    background = Image.new("RGB", canvas.size, (255, 255, 255))
    difference = ImageChops.difference(canvas.convert("RGB"), background)
    bounds = difference.getbbox()

    if bounds:
        cropped_canvas = canvas.crop(bounds)
        padding = int(max(cropped_canvas.width, cropped_canvas.height) * 0.05)
        final_canvas = Image.new(
            "RGB",
            (cropped_canvas.width + padding * 2, cropped_canvas.height + padding * 2),
            (255, 255, 255),
        )
        final_canvas.paste(cropped_canvas, (padding, padding), mask=cropped_canvas)
    else:
        final_canvas = canvas.convert("RGB")

    output = BytesIO()
    final_canvas.save(output, format="JPEG", quality=95)
    return output.getvalue()


def find_foreground_bbox(image_bytes: bytes) -> tuple[int, int, int, int]:
    image_array = cv2.imdecode(
        np.frombuffer(image_bytes, dtype=np.uint8),
        cv2.IMREAD_COLOR,
    )
    if image_array is None:
        raise ValueError("Could not decode an input image.")

    height, width = image_array.shape[:2]
    mask = np.zeros((height, width), np.uint8)
    border_x = int(width * 0.03)
    border_y = int(height * 0.03)
    rectangle = (
        border_x,
        border_y,
        width - 2 * border_x,
        height - 2 * border_y,
    )
    background_model = np.zeros((1, 65), np.float64)
    foreground_model = np.zeros((1, 65), np.float64)

    cv2.grabCut(
        image_array,
        mask,
        rectangle,
        background_model,
        foreground_model,
        5,
        cv2.GC_INIT_WITH_RECT,
    )

    foreground_mask = np.where(
        (mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD),
        255,
        0,
    ).astype("uint8")
    kernel = np.ones((5, 5), np.uint8)
    foreground_mask = cv2.morphologyEx(
        foreground_mask,
        cv2.MORPH_CLOSE,
        kernel,
    )
    foreground_mask = cv2.morphologyEx(
        foreground_mask,
        cv2.MORPH_OPEN,
        kernel,
    )
    contours, _ = cv2.findContours(
        foreground_mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE,
    )

    image_area = width * height
    for contour in sorted(contours, key=cv2.contourArea, reverse=True):
        if cv2.contourArea(contour) < image_area * 0.01:
            continue
        x, y, box_width, box_height = cv2.boundingRect(contour)
        return x, y, x + box_width, y + box_height

    return 0, 0, width, height


def crop_and_prepare(image_bytes: bytes) -> bytes:
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    original_width, original_height = image.size
    x1, y1, x2, y2 = find_foreground_bbox(image_bytes)

    padding_x = int((x2 - x1) * PADDING)
    padding_y = int((y2 - y1) * PADDING)
    x1 = max(0, x1 - padding_x)
    y1 = max(0, y1 - padding_y)
    x2 = min(original_width, x2 + padding_x)
    y2 = min(original_height, y2 + padding_y)
    image = image.crop((x1, y1, x2, y2))

    crop_width, crop_height = image.size
    scale = min(1, MAX_DIMENSION / max(crop_width, crop_height))
    if scale < 1:
        image = image.resize(
            (int(crop_width * scale), int(crop_height * scale)),
            Image.Resampling.LANCZOS,
        )

    output = BytesIO()
    image.save(
        output,
        format="JPEG",
        quality=JPEG_QUALITY,
        optimize=True,
    )
    return output.getvalue()


@app.post("/virtual-try-on")
def create_virtual_try_on(request: VirtualTryOnRequest) -> dict[str, str | float]:
    overall_start = time.perf_counter()
    clothing_urls = {
        "top": request.top,
        "bottom": request.bottom,
        "shoes": request.shoes,
    }
    if not any(clothing_urls.values()):
        raise HTTPException(
            status_code=400,
            detail="Provide at least one clothing image URL.",
        )

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="OPENAI_API_KEY is not configured.",
        )
    if not PERSON_IMAGE_PATH.is_file():
        raise HTTPException(
            status_code=503,
            detail=(
                f"Static model photo not found: {PERSON_IMAGE_PATH}. "
                "Place model.png next to virtual_tryon_flow.py or set "
                "VTO_PERSON_IMAGE_PATH."
            ),
        )

    try:
            with Timer("get_person_prepared (cached)"):
                person_prepared = get_person_prepared()
            with Timer("combine_outfit_for_vto (downloads + combine)"):
                garment_prepared = combine_outfit_for_vto(clothing_urls)
    except Exception as error:
            raise HTTPException(status_code=400, detail=str(error)) from error

    prompt = """
Create a realistic virtual try-on.

The first image is the person.
The second image is the garment.

Put the garment from the second image onto the person in the first image.

Preserve the person's identity, face, hairstyle, body proportions, pose,
skin tone and appearance.

Preserve the garment's color, pattern, texture and design.

Make the garment fit naturally on the person's body.

Change only the clothing.
"""

    try:
        with Timer("OpenAI API call"):
                    result = OpenAI(api_key=api_key, timeout=120.0).images.edit(
                model=IMAGE_MODEL,
                image=[
                    ("person_processed.jpg", BytesIO(person_prepared), "image/jpeg"),
                    ("garment_processed.jpg", BytesIO(garment_prepared), "image/jpeg"),
                ],
                prompt=prompt,
                size="768x1024",
                quality="low",
            )
        generated_image = result.data[0]
        if generated_image.b64_json:
            result_bytes = base64.b64decode(generated_image.b64_json)
        elif generated_image.url:
            with Timer("Download result image"):
                result_bytes = asyncio.run(_download_image_async(
                    aiohttp.ClientSession(), generated_image.url
                ))
        else:
            raise ValueError("The image model returned no image data.")
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Virtual try-on generation failed: {error}",
        ) from error

    image_url = f"data:image/png;base64,{base64.b64encode(result_bytes).decode('ascii')}"
    total_time = time.perf_counter() - overall_start
    print(f"[TIMING] TOTAL REQUEST: {total_time:.3f}s")
    return {"image_url": image_url, "processing_time_seconds": str(round(total_time, 3))}