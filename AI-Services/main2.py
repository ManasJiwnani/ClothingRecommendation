import io

import os

import base64

import json
import mimetypes

from pathlib import Path

from typing import Dict, List, Optional, Any



import numpy as np
from rembg import remove
from scipy import ndimage

from PIL import Image, ImageStat



from fastapi import FastAPI, UploadFile, File, HTTPException

from fastapi.middleware.cors import CORSMiddleware



from pydantic import BaseModel, Field

from dotenv import load_dotenv



# ============================================================

# SSL / CERTIFICATE SUPPORT

# ============================================================



try:

    import truststore



    truststore.inject_into_ssl()

    print("Truststore SSL support enabled.")

except Exception as e:

    print(f"Truststore not enabled: {e}")



try:

    import certifi



    os.environ["SSL_CERT_FILE"] = certifi.where()

    os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()

    print(f"Using certifi certificates: {certifi.where()}")

except Exception as e:

    print(f"Certifi setup failed: {e}")





# ============================================================

# OPENAI

# ============================================================



try:

    from openai import OpenAI



    OPENAI_AVAILABLE = True

except ImportError:

    OPENAI_AVAILABLE = False

    print("WARNING: openai package is not installed.")





# ============================================================

# FASHN BACKGROUND REMOVAL

# ============================================================



try:

    from backgroundr import make_fashion_cutout_from_bytes



    BACKGROUNDR_AVAILABLE = True

except ImportError:

    BACKGROUNDR_AVAILABLE = False

    print("WARNING: backgroundr is not installed.")





# ============================================================

# CLOUDINARY

# ============================================================



try:

    import cloudinary

    import cloudinary.uploader



    CLOUDINARY_AVAILABLE = True

except ImportError:

    CLOUDINARY_AVAILABLE = False

    print("WARNING: cloudinary package is not installed.")





# ============================================================

# ENVIRONMENT

# ============================================================



load_dotenv()



OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")



CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")

CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")

CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")





# ============================================================

# MODEL CONFIGURATION

# ============================================================



# Vision model used to understand clothing images.

VISION_MODEL = "gpt-6-luna"
IMAGE_MODEL = "gpt-image-2.5-flare"



# Same embedding model is used for:

# 1. Clothing metadata

# 2. User queries

#

# This is important because both vectors must exist

# in the same embedding space.

TEXT_EMBEDDING_MODEL = "text-embedding-3-small"



# We intentionally use 768 dimensions.

TEXT_EMBEDDING_DIMENSIONS = 768





# ============================================================

# IMAGE CONFIGURATION

# ============================================================



MAX_IMAGE_SIZE = 768



CLOUDINARY_FOLDER = "closet_wardrobe"



# IMPORTANT:

# Change this to "outfit_items" if that is your actual folder.

OUTFIT_ITEMS_DIR = Path(__file__).parent / "demo_outfits"



SUPPORTED_EXTENSIONS = {

    ".jpg",

    ".jpeg",

    ".png",

    ".webp",

}





# ============================================================

# FASTAPI

# ============================================================



app = FastAPI(

    title="CLOSET AI/Vision Service",

    description=(

        "AI/Vision service for clothing analysis, "

        "metadata generation, embeddings and outfit processing."

    ),

    version="2.0.0",

)



app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)





# ============================================================

# OPENAI CLIENT

# ============================================================



openai_client = None



if OPENAI_AVAILABLE and OPENAI_API_KEY:

    try:

        openai_client = OpenAI(

            api_key=OPENAI_API_KEY

        )



        print("OpenAI client initialized.")



    except Exception as e:

        print(f"OpenAI initialization failed: {e}")



else:

    print(

        "WARNING: OpenAI client unavailable. "

        "Check OPENAI_API_KEY and openai installation."

    )





# ============================================================

# CLOUDINARY CONFIGURATION

# ============================================================



if (

    CLOUDINARY_AVAILABLE

    and CLOUDINARY_CLOUD_NAME

    and CLOUDINARY_API_KEY

    and CLOUDINARY_API_SECRET

):

    try:

        cloudinary.config(

            cloud_name=CLOUDINARY_CLOUD_NAME,

            api_key=CLOUDINARY_API_KEY,

            api_secret=CLOUDINARY_API_SECRET,

            secure=True,

        )



        print("Cloudinary configured.")



    except Exception as e:

        print(f"Cloudinary configuration failed: {e}")



else:

    print(

        "WARNING: Cloudinary unavailable or credentials missing."

    )





# ============================================================

# CLOTHING ATTRIBUTE PROMPT

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

# JSON CLEANING HELPER

# ============================================================



def clean_json_response(text: str) -> str:

    """

    Removes common markdown JSON wrappers from model output.

    """



    if not text:

        return ""



    text = text.strip()



    if text.startswith("```json"):

        text = text[7:]



    elif text.startswith("```"):

        text = text[3:]



    if text.endswith("```"):

        text = text[:-3]



    return text.strip()





# ============================================================

# SAFE LIST CONVERSION

# ============================================================



def ensure_list(value: Any) -> List[str]:

    """

    Converts a model-generated value into a list of strings.

    """



    if value is None:

        return []



    if isinstance(value, list):

        return [str(x) for x in value if x is not None]



    if isinstance(value, str):

        if not value.strip():

            return []



        return [value.strip()]



    return [str(value)]





# ============================================================

# METADATA TEXT GENERATOR

# ============================================================



def clothing_to_metadata_text(

    attributes: Dict[str, Any]

) -> str:

    """

    Converts structured clothing attributes into one normalized

    text representation.



    This text is then embedded using OpenAI text embeddings.

    """



    fields = [

        ("category", attributes.get("category", "")),

        ("subcategory", attributes.get("subcategory", "")),

        ("color", attributes.get("color", "")),

        (

            "secondary colors",

            ", ".join(

                ensure_list(

                    attributes.get("secondary_colors", [])

                )

            ),

        ),

        ("pattern", attributes.get("pattern", "")),

        ("material", attributes.get("material", "")),

        ("sleeve type", attributes.get("sleeve_type", "")),

        ("neckline", attributes.get("neckline", "")),

        ("fit", attributes.get("fit", "")),

        ("length", attributes.get("length", "")),

        ("style", attributes.get("style", "")),

        (

            "occasion",

            ", ".join(

                ensure_list(

                    attributes.get("occasion", [])

                )

            ),

        ),

        ("formality", attributes.get("formality", "")),

        (

            "season",

            ", ".join(

                ensure_list(

                    attributes.get("season", [])

                )

            ),

        ),

        ("gender", attributes.get("gender", "")),

        ("texture", attributes.get("texture", "")),

        (

            "details",

            ", ".join(

                ensure_list(

                    attributes.get("details", [])

                )

            ),

        ),

        ("description", attributes.get("description", "")),

    ]



    parts = []



    for key, value in fields:

        value = str(value).strip()



        parts.append(

            f"{key}: {value}"

        )



    return "; ".join(parts)





# ============================================================

# IMAGE RESIZE

# ============================================================



def resize_image_if_needed(

    image_bytes: bytes,

    max_size: int = MAX_IMAGE_SIZE,

) -> bytes:

    """

    Resize image while preserving aspect ratio.

    """



    image = Image.open(

        io.BytesIO(image_bytes)

    ).convert("RGBA")



    width, height = image.size



    if max(width, height) <= max_size:

        output = io.BytesIO()

        image.save(

            output,

            format="PNG",

        )

        return output.getvalue()



    scale = max_size / max(width, height)



    new_width = max(

        1,

        int(width * scale),

    )



    new_height = max(

        1,

        int(height * scale),

    )



    image = image.resize(

        (new_width, new_height),

        Image.Resampling.LANCZOS,

    )



    output = io.BytesIO()



    image.save(

        output,

        format="PNG",

    )



    return output.getvalue()





# ============================================================

# BASIC IMAGE QUALITY CHECK

# ============================================================



def check_image_quality(

    image_bytes: bytes,

) -> Dict[str, Any]:

    """

    Performs basic internal image quality checks.

    """



    try:

        image = Image.open(

            io.BytesIO(image_bytes)

        ).convert("RGB")



        width, height = image.size



        if width <= 0 or height <= 0:

            return {

                "valid": False,

                "reason": "Invalid image dimensions.",

            }



        stat = ImageStat.Stat(image)



        brightness = sum(stat.mean) / 3



        return {

            "valid": True,

            "width": width,

            "height": height,

            "brightness": round(

                brightness,

                2,

            ),

        }



    except Exception as e:

        return {

            "valid": False,

            "reason": str(e),

        }





# ============================================================

# IMAGE DIMENSIONS

# ============================================================



def get_image_dimensions(

    image_bytes: bytes,

) -> Dict[str, int]:

    """

    Returns image width and height.

    """



    image = Image.open(

        io.BytesIO(image_bytes)

    )



    return {

        "width": image.width,

        "height": image.height,

    } 

# ============================================================

# OPENAI VISION - CLOTHING TAGGING

# ============================================================



def _tag_image(

    image_bytes: bytes,

) -> Dict[str, Any]:

    """

    Uses OpenAI Vision to extract structured clothing attributes.

    """



    if openai_client is None:

        raise RuntimeError(

            "OpenAI client is not initialized."

        )



    # Convert image to base64.

    image_base64 = base64.b64encode(

        image_bytes

    ).decode("utf-8")



    data_url = (

        f"data:image/png;base64,{image_base64}"

    )



    try:

        response = openai_client.responses.create(

            model=VISION_MODEL,



            input=[

                {

                    "role": "user",

                    "content": [

                        {

                            "type": "input_text",

                            "text": TAGGING_PROMPT,

                        },

                        {

                            "type": "input_image",

                            "image_url": data_url,

                        },

                    ],

                }

            ],

        )



        raw_text = response.output_text



        cleaned_text = clean_json_response(

            raw_text

        )



        attributes = json.loads(

            cleaned_text

        )



        if not isinstance(attributes, dict):

            raise ValueError(

                "Vision model did not return a JSON object."

            )



        return attributes



    except json.JSONDecodeError as e:

        raise RuntimeError(

            f"Invalid JSON returned by OpenAI Vision: {e}"

        )



    except Exception as e:

        raise RuntimeError(

            f"OpenAI Vision failed: {e}"

        )





# ============================================================

# OPENAI TEXT EMBEDDING

# ============================================================



def _embed_text(

    text: str,

) -> List[float]:

    """

    Generates a 768-dimensional OpenAI text embedding.

    """



    if openai_client is None:

        raise RuntimeError(

            "OpenAI client is not initialized."

        )



    if not text or not text.strip():

        raise ValueError(

            "Cannot generate embedding for empty text."

        )



    try:

        response = openai_client.embeddings.create(

            model=TEXT_EMBEDDING_MODEL,

            input=text,

            dimensions=TEXT_EMBEDDING_DIMENSIONS,

        )



        embedding = response.data[0].embedding



        # Safety check.

        if len(embedding) != TEXT_EMBEDDING_DIMENSIONS:

            raise RuntimeError(

                "Unexpected embedding dimension: "

                f"{len(embedding)}"

            )



        return embedding



    except Exception as e:

        raise RuntimeError(

            f"OpenAI embedding failed: {e}"

        )





# ============================================================

# QUERY ANALYSIS

# ============================================================



def analyze_query(

    query: str,

) -> Dict[str, Any]:

    """

    Extracts structured intent from a user's outfit query.

    """



    if openai_client is None:

        raise RuntimeError(

            "OpenAI client is not initialized."

        )



    if not query or not query.strip():

        raise ValueError(

            "Query cannot be empty."

        )



    prompt = (

        INTENT_PROMPT

        + "\n\nUser query:\n"

        + query.strip()

    )



    try:

        response = openai_client.responses.create(

            model=VISION_MODEL,

            input=[

                {

                    "role": "user",

                    "content": [

                        {

                            "type": "input_text",

                            "text": prompt,

                        }

                    ],

                }

            ],

        )



        raw_text = response.output_text



        cleaned_text = clean_json_response(

            raw_text

        )



        intent = json.loads(

            cleaned_text

        )



        if not isinstance(intent, dict):

            raise ValueError(

                "Intent response is not a JSON object."

            )



        return intent



    except json.JSONDecodeError as e:

        raise RuntimeError(

            f"Invalid JSON returned by OpenAI: {e}"

        )



    except Exception as e:

        raise RuntimeError(

            f"Query analysis failed: {e}"

        )





# ============================================================

# CLOUDINARY UPLOAD

# ============================================================



def upload_to_cloudinary(

    image_bytes: bytes,

    filename: str,

) -> Optional[str]:

    """

    Uploads the processed transparent clothing image to Cloudinary.



    Returns:

        Secure Cloudinary URL

    """



    if not CLOUDINARY_AVAILABLE:

        print(

            "Cloudinary package unavailable. "

            "Skipping upload."

        )

        return None



    if not (

        CLOUDINARY_CLOUD_NAME

        and CLOUDINARY_API_KEY

        and CLOUDINARY_API_SECRET

    ):

        print(

            "Cloudinary credentials missing. "

            "Skipping upload."

        )

        return None



    try:

        result = cloudinary.uploader.upload(

            image_bytes,

            folder=CLOUDINARY_FOLDER,

            resource_type="image",

            format="png",

            use_filename=True,

            unique_filename=True,

            filename_override=Path(

                filename

            ).stem,

        )



        return result.get(

            "secure_url"

        )



    except Exception as e:

        print(

            f"Cloudinary upload failed: {e}"

        )



        return None





# ============================================================

# FASHN FASHION CUTOUT

# ============================================================



def create_fashion_cutout(

    image_bytes: bytes,

) -> bytes:

    """

    Uses FASHN backgroundr to remove the background and

    produce a transparent fashion-item image.

    """



    if not BACKGROUNDR_AVAILABLE:

        raise RuntimeError(

            "backgroundr is not installed."

        )



    try:

        result = make_fashion_cutout_from_bytes(

            image_bytes

        )



        if result is None:

            raise RuntimeError(

                "FASHN returned no cutout."

            )



        # backgroundr may return bytes directly.

        if isinstance(result, bytes):

            return result



        # Handle file-like objects.

        if hasattr(result, "read"):

            return result.read()



        # Handle PIL images.

        if isinstance(result, Image.Image):

            output = io.BytesIO()



            result.save(

                output,

                format="PNG",

            )



            return output.getvalue()



        raise RuntimeError(

            "Unsupported cutout result type: "

            f"{type(result)}"

        )



    except Exception as e:

        raise RuntimeError(

            f"Fashion background removal failed: {e}"

        )





# ============================================================

# TRANSPARENT IMAGE NORMALIZATION

# ============================================================



def normalize_cutout(

    image_bytes: bytes,

) -> bytes:

    """

    Normalizes the transparent garment image before upload.



    The goal is to reduce large differences caused by

    users photographing garments at different distances.



    This creates a consistent transparent canvas while

    preserving the garment aspect ratio.

    """



    try:

        image = Image.open(

            io.BytesIO(image_bytes)

        ).convert("RGBA")



        # ----------------------------------------------------

        # Find visible alpha bounding box

        # ----------------------------------------------------



        alpha = image.getchannel("A")



        bbox = alpha.getbbox()



        if bbox is None:

            raise RuntimeError(

                "No visible garment found in transparent image."

            )



        cropped = image.crop(

            bbox

        )



        # ----------------------------------------------------

        # Standard canvas

        # ----------------------------------------------------



        canvas_width = 500

        canvas_height = 500

        padding = 20



        # ----------------------------------------------------

        # Determine category later if needed.

        # For now use a general garment size.

        # ----------------------------------------------------



        max_width = canvas_width - (

            padding * 2

        )



        max_height = canvas_height - (

            padding * 2

        )



        scale = min(

            max_width / cropped.width,

            max_height / cropped.height,

        )



        new_width = max(

            1,

            int(cropped.width * scale),

        )



        new_height = max(

            1,

            int(cropped.height * scale),

        )



        resized = cropped.resize(

            (

                new_width,

                new_height,

            ),

            Image.Resampling.LANCZOS,

        )



        # ----------------------------------------------------

        # Center garment

        # ----------------------------------------------------



        canvas = Image.new(

            "RGBA",

            (

                canvas_width,

                canvas_height,

            ),

            (

                0,

                0,

                0,

                0,

            ),

        )



        x = (

            canvas_width - new_width

        ) // 2



        y = (

            canvas_height - new_height

        ) // 2



        canvas.alpha_composite(

            resized,

            (

                x,

                y,

            ),

        )



        output = io.BytesIO()



        canvas.save(

            output,

            format="PNG",

        )



        return output.getvalue()



    except Exception as e:

        raise RuntimeError(

            f"Garment normalization failed: {e}"

        )





# ============================================================

# COMPLETE CLOTHING PROCESSING PIPELINE

# ============================================================



def process_clothing_bytes(

    image_bytes: bytes,

    filename: str = "clothing.png",

) -> Dict[str, Any]:

    """

    Complete clothing processing pipeline.



    Flow:



    Original image

        ↓

    Resize

        ↓

    Quality check

        ↓

    FASHN fashion cutout

        ↓

    Normalization

        ↓

    OpenAI Vision

        ↓

    Clothing attributes

        ↓

    Metadata text

        ↓

    OpenAI text embedding

        ↓

    Cloudinary upload

        ↓

    Response

    """



    # ========================================================

    # 1. RESIZE

    # ========================================================



    resized_bytes = resize_image_if_needed(

        image_bytes

    )



    # ========================================================

    # 2. QUALITY CHECK

    # ========================================================



    quality = check_image_quality(

        resized_bytes

    )



    if not quality.get("valid"):

        raise ValueError(

            quality.get(

                "reason",

                "Image quality check failed.",

            )

        )



    # ========================================================

    # 3. FASHION CUTOUT

    # ========================================================



    cutout_bytes = create_fashion_cutout(

        resized_bytes

    )



    # ========================================================

    # 4. NORMALIZATION

    # ========================================================



    normalized_bytes = normalize_cutout(

        cutout_bytes

    )



    # ========================================================

    # 5. OPENAI VISION

    # ========================================================



    attributes = _tag_image(

        normalized_bytes

    )



    # ========================================================

    # 6. METADATA TEXT

    # ========================================================



    metadata_text = clothing_to_metadata_text(

        attributes

    )



    # ========================================================

    # 7. OPENAI EMBEDDING

    # ========================================================



    embedding = _embed_text(

        metadata_text

    )



    # ========================================================

    # 8. CLOUDINARY

    # ========================================================



    image_url = upload_to_cloudinary(

        normalized_bytes,

        filename,

    )



    # ========================================================

    # 9. DIMENSIONS

    # ========================================================



    dimensions = get_image_dimensions(

        normalized_bytes

    )



    # ========================================================

    # 10. RETURN

    # ========================================================



    return {

        "attributes": attributes,



        "metadata_text": metadata_text,



        "embedding": embedding,



        "embedding_dimensions": len(

            embedding

        ),



        "dimensions": dimensions,



        "image_url": image_url,



        "filename": filename,



        "quality": quality,

    }





# ============================================================

# RESPONSE MODELS

# ============================================================



class QueryRequest(BaseModel):

    query: str = Field(

        ...,

        min_length=1,

        description="User's outfit request.",

    )





class QueryEmbeddingResponse(BaseModel):

    query: str



    intent: Dict[str, Any]



    embedding: List[float]



    embedding_dimensions: int





class ClothingResponse(BaseModel):
    image_url: str = ""

    category: str = ""

    subcategory: str = ""

    color: str = ""

    secondary_color: str = ""

    pattern: str = ""

    material: str = ""

    sleeve_type: str = ""

    fit: str = ""

    style: str = ""

    formality: int = 0

    season: List[str] = Field(default_factory=list)

    occasions: List[str] = Field(default_factory=list)

    embedding: List[float] = Field(default_factory=list)


def _format_clothing_output(result: Dict[str, Any]) -> Dict[str, Any]:
    attributes = result.get("attributes", {}) or {}
    secondary_colors = attributes.get("secondary_colors")
    if isinstance(secondary_colors, list):
        secondary_color = next(
            (str(color) for color in secondary_colors if color is not None),
            "",
        )
    else:
        secondary_color = str(secondary_colors or "")

    return {
        "image_url": result.get("image_url") or "",
        "category": str(attributes.get("category") or ""),
        "subcategory": str(attributes.get("subcategory") or ""),
        "color": str(attributes.get("color") or ""),
        "secondary_color": secondary_color,
        "pattern": str(attributes.get("pattern") or ""),
        "material": str(attributes.get("material") or ""),
        "sleeve_type": str(attributes.get("sleeve_type") or ""),
        "fit": str(attributes.get("fit") or ""),
        "style": str(attributes.get("style") or ""),
        "formality": int(attributes.get("formality") or 0),
        "season": ensure_list(attributes.get("season")),
        "occasions": ensure_list(attributes.get("occasions")),
        "embedding": result.get("embedding") or [],
    }

# ============================================================

# HEALTH CHECK

# ============================================================



@app.get("/health")

def health():

    """

    Service health check.

    """



    return {

        "status": "ok",



        "service": "CLOSET AI/Vision Service",



        "openai_available": (

            openai_client is not None

        ),



        "backgroundr_available": (

            BACKGROUNDR_AVAILABLE

        ),



        "cloudinary_available": (

            CLOUDINARY_AVAILABLE

        ),



        "vision_model": VISION_MODEL,



        "embedding_model": TEXT_EMBEDDING_MODEL,



        "embedding_dimensions": (

            TEXT_EMBEDDING_DIMENSIONS

        ),



        "outfit_items_directory": str(

            OUTFIT_ITEMS_DIR

        ),

    }





# ============================================================

# PROCESS SINGLE CLOTHING IMAGE

# ============================================================



@app.post(

    "/process-image",

    response_model=ClothingResponse,

)

async def process_image(

    file: UploadFile = File(...),

):

    """

    Process one clothing image.

    """



    if not file.filename:

        raise HTTPException(

            status_code=400,

            detail="Filename is missing.",

        )



    extension = Path(

        file.filename

    ).suffix.lower()



    if extension not in SUPPORTED_EXTENSIONS:

        raise HTTPException(

            status_code=400,

            detail=(

                "Unsupported image format. "

                f"Supported formats: "

                f"{sorted(SUPPORTED_EXTENSIONS)}"

            ),

        )



    try:

        image_bytes = await file.read()



        if not image_bytes:

            raise HTTPException(

                status_code=400,

                detail="Uploaded file is empty.",

            )



        result = process_clothing_bytes(

            image_bytes=image_bytes,

            filename=file.filename,

        )



        attributes = result.get("attributes", {}) or {}

        secondary_colors = attributes.get("secondary_colors")
        if isinstance(secondary_colors, list) and secondary_colors:
            secondary_color_value = str(secondary_colors[0])
        elif isinstance(secondary_colors, str):
            secondary_color_value = secondary_colors
        else:
            secondary_color_value = ""

        season = attributes.get("season")
        if isinstance(season, list):
            season_value = [str(x) for x in season if x is not None]
        elif season:
            season_value = [str(season)]
        else:
            season_value = []

        occasions = attributes.get("occasions")
        if isinstance(occasions, list):
            occasions_value = [str(x) for x in occasions if x is not None]
        elif occasions:
            occasions_value = [str(occasions)]
        else:
            occasions_value = []

        return {
            "image_url": result.get("image_url") or "",
            "category": attributes.get("category") or "",
            "subcategory": attributes.get("subcategory") or "",
            "color": attributes.get("color") or "",
            "secondary_color": secondary_color_value,
            "pattern": attributes.get("pattern") or "",
            "material": attributes.get("material") or "",
            "sleeve_type": attributes.get("sleeve_type") or "",
            "fit": attributes.get("fit") or "",
            "style": attributes.get("style") or "",
            "formality": int(attributes.get("formality", 0) or 0),
            "season": season_value,
            "occasions": occasions_value,
            "embedding": result.get("embedding", []),
        }



    except HTTPException:

        raise



    except Exception as e:

        print(

            f"/process-image error: {e}"

        )



        raise HTTPException(

            status_code=500,

            detail=str(e),

        )





# ============================================================

# EMBED USER QUERY

# ============================================================



@app.post(

    "/embed-query",

    response_model=QueryEmbeddingResponse,

)

async def embed_query(

    request: QueryRequest,

):

    """

    Analyze a user outfit query and generate

    a 768-dimensional embedding.



    The embedding model is the same model used

    for clothing metadata embeddings.

    """



    try:

        query = request.query.strip()



        # ----------------------------------------------------

        # Intent analysis

        # ----------------------------------------------------



        intent = analyze_query(

            query

        )



        # ----------------------------------------------------

        # Create semantic query text

        #

        # We combine the original query and the extracted

        # intent so the embedding represents both.

        # ----------------------------------------------------



        intent_text = clothing_to_metadata_text(

            {

                "category": "",

                "subcategory": "",

                "color": intent.get(

                    "color_preference",

                    "",

                ),

                "secondary_colors": [],

                "pattern": "",

                "material": "",

                "sleeve_type": "",

                "neckline": "",

                "fit": "",

                "length": "",

                "style": intent.get(

                    "style",

                    "",

                ),

                "occasion": [

                    intent.get(

                        "occasion",

                        "",

                    )

                ],

                "formality": intent.get(

                    "formality",

                    "",

                ),

                "season": [],

                "gender": "",

                "texture": "",

                "details": intent.get(

                    "excluded_items",

                    [],

                ),

                "description": (

                    f"User request: {query}. "

                    f"Mood: {intent.get('mood', '')}. "

                    f"Weather sensitive: "

                    f"{intent.get('weather_sensitive', False)}."

                ),

            }

        )



        # ----------------------------------------------------

        # Embed query

        # ----------------------------------------------------



        embedding_text = (

            f"query: {query}; "

            f"{intent_text}"

        )



        embedding = _embed_text(

            embedding_text

        )



        return {

            "query": query,



            "intent": intent,



            "embedding": embedding,



            "embedding_dimensions": len(

                embedding

            ),

        }



    except Exception as e:

        print(

            f"/embed-query error: {e}"

        )



        raise HTTPException(

            status_code=500,

            detail=str(e),

        )





# ============================================================

# FIND STORED OUTFIT ITEMS

# ============================================================



def _find_outfit_items(

    outfit_name: str,

) -> List[Path]:

    """

    Finds clothing images inside the configured

    outfit-items directory.



    Example:



    demo_outfits/

        outfit1/

            shirt.png

            pant.png

            shoes.png



    or:



    demo_outfits/

        outfit1_shirt.png

        outfit1_pant.png

    """



    if not OUTFIT_ITEMS_DIR.exists():

        print(

            f"Outfit directory not found: "

            f"{OUTFIT_ITEMS_DIR}"

        )



        return []



    outfit_name_lower = (

        outfit_name.lower()

    )



    results = []



    # --------------------------------------------------------

    # Search files recursively.

    # --------------------------------------------------------



    for path in OUTFIT_ITEMS_DIR.rglob("*"):



        if not path.is_file():

            continue



        if path.suffix.lower() not in SUPPORTED_EXTENSIONS:

            continue



        path_string = str(

            path

        ).lower()



        if outfit_name_lower in path_string:

            results.append(path)



    return sorted(

        results

    )





# ============================================================

# PROCESS WHOLE OUTFIT

# ============================================================



@app.post("/process-whole-outfit", response_model=List[ClothingResponse])

async def process_whole_outfit(

    file: UploadFile = File(...),
    style_ref: Optional[UploadFile] = File(None),

):

    """

    Process a complete outfit from ONE uploaded selfie/mirror image.
    Pipeline:

        Selfie

          ↓

        OpenAI Vision → detect garments

          ↓

        OpenAI Image Generation → ONE flat-lay outfit board

          ↓

        rembg → remove background

          ↓

        split board → individual garment PNGs

          ↓

        existing process_clothing_bytes()

          ↓

        Cloudinary

    """



    if openai_client is None:
        raise HTTPException(
            status_code=503,
            detail="OpenAI client is unavailable. Check OPENAI_API_KEY.",
        )

    if not file.filename:

        raise HTTPException(

            status_code=400,

            detail="Filename is missing."

        )



    try:

        # ====================================================

        # 1. Read uploaded selfie

        # ====================================================



        selfie_bytes = await file.read()
        style_ref_bytes = None
        if style_ref is not None:
            style_ref_bytes = await style_ref.read()
            if not style_ref_bytes:
                raise HTTPException(
                    status_code=400,
                    detail="Uploaded style reference is empty.",
                )



        if not selfie_bytes:

            raise HTTPException(

                status_code=400,

                detail="Uploaded image is empty."

            )



        print(

            f"Processing whole outfit from: {file.filename}"

        )



        # ====================================================

        # 2. Detect clothing items using OpenAI

        # ====================================================



        extract_prompt = """

You are a fashion cataloguer.



Look at the person in this image and identify ONLY the

clothing garments they are wearing.



Include:

- tops

- shirts

- t-shirts

- sweaters

- jackets

- coats

- dresses

- skirts

- pants

- jeans

- shorts

- other visible garments



Do NOT include:

- shoes

- bags

- watches

- jewelry

- glasses

- phones

- belts

- hats

- hands

- face

- body

- background



Return ONLY valid JSON in this exact format:



{

    "items": [

        {

            "label": "White Cotton T-Shirt",

            "details": "short sleeve crew neck plain white cotton t-shirt",

            "group": "clothing"

        }

    ]

}



Only include garments that are clearly visible.

"""



        # Convert uploaded image to data URL

        mime_type = file.content_type or "image/jpeg"



        image_data_url = (

            f"data:{mime_type};base64,"

            f"{base64.b64encode(selfie_bytes).decode('utf-8')}"

        )



        vision_response = openai_client.chat.completions.create(

            model=VISION_MODEL,

            response_format={

                "type": "json_object"

            },

            messages=[

                {

                    "role": "user",

                    "content": [

                        {

                            "type": "text",

                            "text": extract_prompt,

                        },

                        {

                            "type": "image_url",

                            "image_url": {

                                "url": image_data_url

                            },

                        },

                    ],

                }

            ],

        )



        content = (

            vision_response

            .choices[0]

            .message

            .content

        )



        detected_data = json.loads(content)



        items = detected_data.get(

            "items",

            []

        )



        if not items:

            raise HTTPException(

                status_code=400,

                detail="No clothing garments detected."

            )



        print(

            f"Detected {len(items)} clothing items:"

        )



        for item in items:

            print(

                f"  - {item.get('label')}: "

                f"{item.get('details')}"

            )



        # ====================================================

        # 3. Build flat-lay generation prompt

        # ====================================================



        clothing_description = "\n".join(

            [

                (

                    f"- {item.get('label')}: "

                    f"{item.get('details')}"

                )

                for item in items

            ]

        )



        board_prompt = f"""

Create ONE vertical flat-lay fashion product image.
{("Match the reference background color and lighting exactly, ignoring any text in it.\n\n" if style_ref_bytes else "")}



The image must contain ONLY these garments:



{clothing_description}



IMPORTANT:



- Show ONLY the garments.

- No person.

- No face.

- No body.

- No mannequin.

- No hands.

- No shoes.

- No bags.

- No jewelry.

- No watches.

- No phone.

- No accessories.

- No extra objects.

- No text.

- No labels.

- No captions.

- No logos.

- No watermark.



Lay every garment completely flat and photograph

everything from directly above.



Arrange the garments neatly with clear separation

between each item.



Use:

- minimalist warm beige/taupe background

- clean editorial fashion-board composition

- generous spacing

- soft studio lighting

- subtle natural shadows

- realistic fabric texture

- accurate garment colors

- accurate garment shape

- photorealistic appearance

- e-commerce catalog quality



Create EXACTLY ONE image containing all garments.

"""



        # ====================================================

        # 4. Generate ONE outfit board

        # ====================================================



        print(

            "Generating flat-lay outfit board..."

        )



        if style_ref_bytes:
            style_ref_name = style_ref.filename or "style-reference.png"
            style_ref_mime = (
                style_ref.content_type
                or mimetypes.guess_type(style_ref_name)[0]
                or "image/png"
            )
            image_result = openai_client.images.edit(
                model=IMAGE_MODEL,
                image=[(style_ref_name, style_ref_bytes, style_ref_mime)],
                prompt=board_prompt,
                size="1024x1536",
                quality="high",
            )
        else:
            image_result = openai_client.images.generate(
                model=IMAGE_MODEL,
                prompt=board_prompt,
                size="1024x1536",
                quality="high",
            )



        generated_image = (

            image_result.data[0]

        )



        if getattr(generated_image, "b64_json", None):
            board_bytes = base64.b64decode(generated_image.b64_json)
        elif getattr(generated_image, "url", None):
            import requests

            image_response = requests.get(generated_image.url, timeout=60)
            image_response.raise_for_status()
            board_bytes = image_response.content
        else:
            raise HTTPException(
                status_code=500,
                detail=f"No image payload returned for model {IMAGE_MODEL}.",
            )



        # ====================================================

        # 5. Save temporary outfit board

        # ====================================================



        temp_dir = Path(

            "temp_whole_outfit"

        )



        temp_dir.mkdir(

            parents=True,

            exist_ok=True

        )



        board_path = (

            temp_dir /

            f"{Path(file.filename).stem}_board.png"

        )



        board_path.write_bytes(

            board_bytes

        )



        print(

            f"Saved outfit board -> {board_path}"

        )



        # ====================================================

        # 6. Remove background

        # ====================================================



        print(

            "Removing outfit-board background..."

        )



        board_image = Image.open(

            io.BytesIO(board_bytes)

        ).convert("RGBA")



        removed_background = remove(

            board_image

        )



        # ====================================================

        # 7. Find individual garments

        # ====================================================



        rgba = np.array(

            removed_background

        )



        alpha = (

            rgba[:, :, 3] > 20

        )



        # Small dilation helps connect

        # nearby pixels belonging to the same garment.

        connected_mask = (

            ndimage.binary_dilation(

                alpha,

                iterations=2

            )

        )



        labels, number = ndimage.label(

            connected_mask

        )



        objects = ndimage.find_objects(

            labels

        )



        garment_regions = []



        height, width = alpha.shape



        # Minimum area to ignore tiny artifacts

        min_pixel_area = (

            height * width * 0.001

        )



        for label_id, region in enumerate(

            objects,

            start=1

        ):



            if region is None:

                continue



            region_mask = (

                labels[region] == label_id

            )



            area = region_mask.sum()



            if area < min_pixel_area:

                continue



            y_slice, x_slice = region



            x0 = x_slice.start

            y0 = y_slice.start

            x1 = x_slice.stop

            y1 = y_slice.stop



            garment_regions.append(

                (

                    x0,

                    y0,

                    x1,

                    y1,

                    label_id

                )

            )



        if not garment_regions:

            raise HTTPException(

                status_code=500,

                detail=(

                    "Could not separate garments "

                    "from generated outfit board."

                )

            )



        print(

            f"Detected {len(garment_regions)} "

            f"garment regions."

        )



        # ====================================================

        # 8. Create individual garment PNGs

        # ====================================================



        garment_dir = (

            temp_dir /

            f"{Path(file.filename).stem}_garments"

        )



        garment_dir.mkdir(

            parents=True,

            exist_ok=True

        )



        garment_files = []



        padding = 15



        for index, (

            x0,

            y0,

            x1,

            y1,

            label_id

        ) in enumerate(

            garment_regions,

            start=1

        ):



            # Add padding

            crop_x0 = max(

                0,

                x0 - padding

            )



            crop_y0 = max(

                0,

                y0 - padding

            )



            crop_x1 = min(

                width,

                x1 + padding

            )



            crop_y1 = min(

                height,

                y1 + padding

            )



            # Create mask for this garment

            garment_mask = (

                labels == label_id

            )



            garment_rgba = (

                np.array(

                    removed_background

                ).copy()

            )



            garment_rgba[:, :, 3] = np.where(

                garment_mask,

                garment_rgba[:, :, 3],

                0

            )



            garment_image = Image.fromarray(

                garment_rgba

            ).crop(

                (

                    crop_x0,

                    crop_y0,

                    crop_x1,

                    crop_y1

                )

            )



            garment_path = (

                garment_dir /

                f"garment_{index}.png"

            )



            garment_image.save(

                garment_path

            )



            garment_files.append(

                garment_path

            )



            print(

                f"Saved garment -> "

                f"{garment_path}"

            )



        # ====================================================

        # 9. Run existing clothing pipeline

        # ====================================================



        processed_items = []



        for index, garment_path in enumerate(

            garment_files,

            start=1

        ):



            print(

                f"Processing extracted garment "

                f"{index}/{len(garment_files)}"

            )



            try:



                garment_bytes = (

                    garment_path.read_bytes()

                )



                result = process_clothing_bytes(

                    image_bytes=garment_bytes,

                    filename=garment_path.name,

                )



                processed_items.append(

                    {

                        "filename": garment_path.name,



                        "attributes": result[

                            "attributes"

                        ],



                        "metadata_text": result[

                            "metadata_text"

                        ],



                        "embedding": result[

                            "embedding"

                        ],



                        "embedding_dimensions": result[

                            "embedding_dimensions"

                        ],



                        "dimensions": result[

                            "dimensions"

                        ],



                        "image_url": result[

                            "image_url"

                        ],

                    }

                )



            except Exception as item_error:



                print(

                    f"Failed to process "

                    f"{garment_path.name}: "

                    f"{item_error}"

                )



                processed_items.append(

                    {

                        "filename": garment_path.name,

                        "error": str(

                            item_error

                        ),

                    }

                )



        # ====================================================

        # 10. Return result

        # ====================================================

        failed_items = [item for item in processed_items if "error" in item]
        if failed_items:
            raise HTTPException(
                status_code=500,
                detail=(
                    "Failed to process extracted garments: "
                    + ", ".join(item["filename"] for item in failed_items)
                ),
            )

        return [_format_clothing_output(item) for item in processed_items]



    except HTTPException:

        raise



    except Exception as e:



        print(

            f"/process-whole-outfit error: {e}"

        )



        raise HTTPException(

            status_code=500,

            detail=str(e)

        ) 





# ============================================================

# STARTUP INFORMATION

# ============================================================



@app.on_event("startup")

async def startup_event():



    print()

    print("=" * 65)

    print("CLOSET AI/Vision Service")

    print("=" * 65)



    print(

        f"OpenAI available: "

        f"{openai_client is not None}"

    )



    print(

        f"Backgroundr available: "

        f"{BACKGROUNDR_AVAILABLE}"

    )



    print(

        f"Cloudinary available: "

        f"{CLOUDINARY_AVAILABLE}"

    )



    print(

        f"Vision model: "

        f"{VISION_MODEL}"

    )



    print(

        f"Embedding model: "

        f"{TEXT_EMBEDDING_MODEL}"

    )



    print(

        f"Embedding dimensions: "

        f"{TEXT_EMBEDDING_DIMENSIONS}"

    )



    print(

        f"Outfit items directory: "

        f"{OUTFIT_ITEMS_DIR}"

    )



    print(

        f"Outfit directory exists: "

        f"{OUTFIT_ITEMS_DIR.exists()}"

    )



    print("=" * 65)

    print()





# ============================================================

# LOCAL RUN

# ============================================================



if __name__ == "__main__":



    import uvicorn



    uvicorn.run(

        "main:app",

        host="0.0.0.0",

        port=8001,

        reload=True,

    ) 

