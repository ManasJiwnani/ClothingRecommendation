"""
CLOSET - Member 2 AI/Vision + API Service

Pipeline:

    User uploads image
            ↓
    Resize image
            ↓
    FASHN Human Parser
            ↓
    Fashion item validation
            ↓
    Transparent clothing PNG
            ↓
    Gemini Vision
            ↓
    Clothing attributes
            ↓
    Gemini Embedding 2
            ↓
    Clothing embedding
            ↓
    Cloudinary
            ↓
    Transparent image URL
            ↓
    Member 3 / Supabase


Endpoints:

    POST /process-image
        Upload clothing image and process it.

    POST /embed-query
        Convert natural-language outfit query into
        embedding + structured intent.

    GET /health
        Health check.
"""


# ============================================================
# SSL
# ============================================================

import truststore

truststore.inject_into_ssl()


# ============================================================
# STANDARD LIBRARY
# ============================================================

import os
import json
import io


# ============================================================
# THIRD-PARTY
# ============================================================

import certifi

from dotenv import load_dotenv

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException,
)

from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from google import genai
from google.genai import types

import cloudinary
import cloudinary.uploader

from PIL import Image


# ============================================================
# LOCAL MODULE
# ============================================================

from backgroundr import make_fashion_cutout_from_bytes


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()


# ============================================================
# SSL CERTIFICATE CONFIGURATION
# ============================================================

os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="CLOSET AI/Vision Service"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# GEMINI CONFIGURATION
# ============================================================

GEMINI_API_KEY = os.getenv(
    "GEMINI_API_KEY"
)

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY not found. "
        "Add GEMINI_API_KEY=your_key to .env"
    )


client = genai.Client(
    api_key=GEMINI_API_KEY
)


# ============================================================
# CLOUDINARY CONFIGURATION
# ============================================================

CLOUDINARY_CLOUD_NAME = os.getenv(
    "CLOUDINARY_CLOUD_NAME"
)

CLOUDINARY_API_KEY = os.getenv(
    "CLOUDINARY_API_KEY"
)

CLOUDINARY_API_SECRET = os.getenv(
    "CLOUDINARY_API_SECRET"
)


if not CLOUDINARY_CLOUD_NAME:
    raise RuntimeError(
        "CLOUDINARY_CLOUD_NAME not found in .env"
    )

if not CLOUDINARY_API_KEY:
    raise RuntimeError(
        "CLOUDINARY_API_KEY not found in .env"
    )

if not CLOUDINARY_API_SECRET:
    raise RuntimeError(
        "CLOUDINARY_API_SECRET not found in .env"
    )


cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
)


# ============================================================
# GEMINI MODELS
# ============================================================

VISION_MODEL = "gemini-3.6-flash"

EMBEDDING_MODEL = "gemini-embedding-2-preview"

EMBEDDING_DIMENSIONS = 768


# ============================================================
# CLOTHING TAGGING PROMPT
# ============================================================

TAGGING_PROMPT = """
You are a fashion cataloging assistant with expertise across
global and regional clothing styles, including Indian wear
and Western wear.

Look at this clothing item image and identify it as
SPECIFICALLY and ACCURATELY as possible.

The image has already been background-removed and contains
a fashion item on a transparent background.

Return ONLY valid JSON.

Return exactly this structure:

{
    "category": "top | bottom | dress | footwear | outerwear | accessory",
    "subcategory": "specific item name such as shirt, kurta, jeans, sneakers, slippers, jacket, scarf, hat, bag, belt, sunglasses, necklace, earrings, bracelet, ring, watch",
    "color": "main color",
    "pattern": "solid, striped, floral, printed, embroidered, checkered, etc.",
    "material": "best guess such as cotton, silk, denim, wool, or null if unclear",
    "sleeve_type": "full, half, sleeveless, three-quarter, or null if not applicable",
    "fit": "fitted | regular | loose | oversized",
    "style": "aesthetic descriptor such as minimalist, boho, formal, preppy, streetwear",
    "formality": "integer from 1 to 5",
    "season": [
        "summer",
        "winter",
        "monsoon",
        "spring",
        "fall",
        "all-season"
    ],
    "occasions": [
        "college",
        "office",
        "presentation",
        "party",
        "date",
        "wedding",
        "gym",
        "trekking",
        "outing",
        "casual",
        "formal",
        "festive",
        "religious",
        "vacation",
        "travel",
        "beach",
        "picnic"
    ]
}

Rules:

1. Identify only information visible or strongly inferable
   from the clothing item.

2. Do not invent details.

3. Use null when a property cannot reasonably be determined.

4. The category must describe the clothing item.

5. Return only JSON.

6. Do not use markdown.

7. Do not include explanations.
"""


# ============================================================
# TAG IMAGE
# ============================================================

def _tag_image(
    image_bytes: bytes,
    mime_type: str,
) -> dict:

    response = client.models.generate_content(
        model=VISION_MODEL,

        contents=[
            types.Part.from_bytes(
                data=image_bytes,
                mime_type=mime_type,
            ),
            TAGGING_PROMPT,
        ],

        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )

    raw_text = response.text.strip()

    # Remove accidental markdown fences
    raw_text = (
        raw_text
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )

    try:

        return json.loads(raw_text)

    except json.JSONDecodeError as error:

        raise ValueError(
            "Gemini Vision returned invalid JSON: "
            f"{raw_text[:500]}"
        ) from error


# ============================================================
# IMAGE EMBEDDING
# ============================================================

def _embed_image(
    image_bytes: bytes,
    mime_type: str,
) -> list[float]:

    result = client.models.embed_content(
        model=EMBEDDING_MODEL,

        contents=[
            types.Part.from_bytes(
                data=image_bytes,
                mime_type=mime_type,
            )
        ],

        config=types.EmbedContentConfig(
            output_dimensionality=EMBEDDING_DIMENSIONS,
        ),
    )

    return result.embeddings[0].values


# ============================================================
# INTENT MODEL
# ============================================================

class Intent(BaseModel):

    occasion: str | None = None

    style: str | None = None

    formality: int | None = None

    mood: str | None = None

    weather_sensitive: bool | None = None

    color_preference: list[str] | None = None

    excluded_items: list[str] | None = None


# ============================================================
# QUERY INTENT PROMPT
# ============================================================

INTENT_PROMPT = """
You are a fashion query understanding assistant.

Your job is to understand the user's clothing/outfit request
and convert it into structured information.

User query:

{query}

Extract:

- occasion: The event or situation.

- style: The desired fashion style.

- formality: A number from 1 to 5:
  1 very casual,
  2 casual,
  3 smart casual,
  4 formal,
  5 very formal.

- mood: The desired mood or feeling.

- weather_sensitive: true if weather or temperature matters.

- color_preference: List of colors explicitly requested.

- excluded_items: List of clothing items explicitly not wanted.

Rules:

1. Do not invent information.

2. Understand natural language and synonyms.

3. Keep occasion and style as natural descriptive text.

4. Interpret:

   "I have a job interview"

   as:

   occasion = "interview"

5. If information is unavailable, return null.

6. Return only the requested structured fields.
"""


# ============================================================
# ANALYZE QUERY
# ============================================================

def analyze_query(
    query: str,
) -> Intent:

    response = client.models.generate_content(

        model=VISION_MODEL,

        contents=INTENT_PROMPT.format(
            query=query
        ),

        config=types.GenerateContentConfig(

            response_mime_type="application/json",

            response_schema=Intent,
        ),
    )

    return Intent.model_validate_json(
        response.text
    )


# ============================================================
# TEXT EMBEDDING
# ============================================================

def _embed_text(
    text: str,
) -> tuple[list[float], Intent]:

    result = client.models.embed_content(

        model=EMBEDDING_MODEL,

        contents=[text],

        config=types.EmbedContentConfig(
            output_dimensionality=EMBEDDING_DIMENSIONS,
        ),
    )

    intent = analyze_query(text)

    return (
        result.embeddings[0].values,
        intent,
    )


# ============================================================
# CLOUDINARY UPLOAD
# ============================================================

def _upload_to_cloudinary(
    image_bytes: bytes,
) -> str:

    """
    Upload transparent PNG to Cloudinary.

    IMPORTANT:
    Only the processed transparent clothing image
    is uploaded.
    """

    result = cloudinary.uploader.upload(

        image_bytes,

        folder="closet_wardrobe",

        resource_type="image",

        format="png",
    )

    return result["secure_url"]


# ============================================================
# RESIZE IMAGE
# ============================================================

def _resize_image(
    image_bytes: bytes,
    max_size: int = 1024,
) -> bytes:

    """
    Resize the uploaded image while preserving
    its aspect ratio.

    The longest side will be at most max_size.

    Example:

        4032 x 3024
              ↓
        1024 x 768
    """

    try:

        image = Image.open(
            io.BytesIO(image_bytes)
        )

        image = image.convert("RGB")

    except Exception as error:

        raise ValueError(
            "Uploaded file is not a valid image."
        ) from error


    original_size = image.size


    # Resize while preserving aspect ratio
    image.thumbnail(
        (max_size, max_size),
        Image.Resampling.LANCZOS,
    )


    print(
        f"Image resized: "
        f"{original_size[0]}x{original_size[1]} "
        f"→ {image.width}x{image.height}"
    )


    output = io.BytesIO()


    image.save(
        output,
        format="JPEG",
        quality=90,
        optimize=True,
    )


    return output.getvalue()


# ============================================================
# API REQUEST / RESPONSE MODELS
# ============================================================

class EmbedQueryRequest(BaseModel):

    query: str


class EmbedQueryResponse(BaseModel):

    embedding: list[float]

    intent: Intent

    dimensions: int


class ProcessImageResponse(BaseModel):

    attributes: dict

    embedding: list[float]

    dimensions: int

    image_url: str


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
async def health_check():

    return {
        "status": "healthy"
    }


# ============================================================
# PROCESS IMAGE
# ============================================================

@app.post(
    "/process-image",
    response_model=ProcessImageResponse,
)
async def process_image(
    file: UploadFile = File(...),
):

    """
    Complete CLOSET clothing ingestion pipeline.

    Flow:

        Uploaded image
              ↓
        Resize image
              ↓
        FASHN validation + segmentation
              ↓
        Transparent PNG
              ↓
        Gemini Vision
              ↓
        Gemini image embedding
              ↓
        Cloudinary
              ↓
        Return response
    """

    try:

        # ====================================================
        # STEP 1 - READ IMAGE
        # ====================================================

        original_bytes = await file.read()

        if not original_bytes:

            raise ValueError(
                "Uploaded image is empty."
            )

        print(
            f"Received image: {file.filename}"
        )


        # ====================================================
        # STEP 2 - RESIZE IMAGE
        # ====================================================

        print(
            "Resizing uploaded image..."
        )

        resized_bytes = _resize_image(
            original_bytes,
            max_size=768,
        )

        print(
            "Image resize completed."
        )


        # ====================================================
        # STEP 3 - FASHION VALIDATION + CUTOUT
        # ====================================================

        print(
            "Running FASHN Human Parser..."
        )

        try:

            transparent_bytes = (
                make_fashion_cutout_from_bytes(
                    resized_bytes
                )
            )

        except ValueError as error:

            # ------------------------------------------------
            # IMPORTANT:
            # If FASHN cannot find a fashion item,
            # STOP HERE.
            #
            # Gemini is NOT called.
            # ------------------------------------------------

            print(
                "Fashion validation failed."
            )

            raise HTTPException(
                status_code=400,
                detail=(
                    "No supported fashion item was "
                    "detected in the uploaded image."
                ),
            ) from error


        print(
            "Fashion item detected."
        )

        print(
            "Transparent clothing PNG created."
        )


        # ====================================================
        # STEP 4 - GEMINI VISION TAGGING
        # ====================================================

        print(
            "Generating clothing attributes..."
        )

        attributes = _tag_image(

            transparent_bytes,

            "image/png",
        )

        print(
            "Clothing attributes generated."
        )


        # ====================================================
        # STEP 5 - GEMINI IMAGE EMBEDDING
        # ====================================================

        print(
            "Generating clothing embedding..."
        )

        embedding = _embed_image(

            transparent_bytes,

            "image/png",
        )

        print(
            f"Embedding generated: "
            f"{len(embedding)} dimensions"
        )


        # ====================================================
        # STEP 6 - CLOUDINARY
        # ====================================================

        print(
            "Uploading transparent PNG to Cloudinary..."
        )

        image_url = _upload_to_cloudinary(

            transparent_bytes
        )

        print(
            "Cloudinary upload successful."
        )


        # ====================================================
        # STEP 7 - RESPONSE
        # ====================================================

        return ProcessImageResponse(

            attributes=attributes,

            embedding=embedding,

            dimensions=len(embedding),

            image_url=image_url,
        )


    except HTTPException:

        # Keep our intentional 400 response
        raise


    except Exception as error:

        print(
            f"ERROR: {error}"
        )

        raise HTTPException(

            status_code=400,

            detail=str(error),
        )


# ============================================================
# EMBED QUERY
# ============================================================

@app.post(
    "/embed-query",
    response_model=EmbedQueryResponse,
)
async def embed_query(
    request: EmbedQueryRequest,
):

    """
    Takes a natural-language fashion query.

    Example:

        "something aesthetic for a dinner date tonight"

    Returns:

        embedding
        intent
        dimensions
    """

    try:

        embedding, intent = _embed_text(
            request.query
        )

        return EmbedQueryResponse(

            embedding=embedding,

            intent=intent,

            dimensions=len(embedding),
        )

    except Exception as error:

        raise HTTPException(

            status_code=400,

            detail=str(error),
        )