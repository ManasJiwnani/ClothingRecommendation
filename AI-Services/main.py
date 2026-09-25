"""
Member 2 — AI/Vision + API service.

This service receives a clothing image, uploads it to Cloudinary, tags it via
Gemini vision, generates an embedding via Gemini Embedding 2, and returns all
three (image_url, attributes, embedding) in one response. Member 3's backend
is responsible for storing this output in Supabase and doing everything
downstream (filtering, ranking, outfit composition, weather, LangGraph).

Endpoints:
    POST /process-image   -> image_url + attributes + embedding for one clothing photo
    POST /embed-query      -> embedding for a free-text occasion/style query
    GET  /health
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
import tempfile
from pathlib import Path
import ssl
import certifi
from dotenv import load_dotenv

load_dotenv()


import os
import json
import certifi


os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()

from google import genai
from google.genai import types
import cloudinary
import cloudinary.uploader

app = FastAPI(title="Cloth AI/Vision Service")

# Allow Member 3's backend (and the frontend, if it ever calls this directly)
# to reach this service. Tighten this to specific origins once you know them.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY not found. Add GEMINI_API_KEY=your_key to a .env file "
        "in this service's folder."
    )
client = genai.Client(api_key=GEMINI_API_KEY)

# Cloudinary config — reads these from your .env
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

VISION_MODEL = "gemini-3.6-flash"                # verify current name at ai.google.dev
EMBEDDING_MODEL = "gemini-embedding-2-preview"    # verify current name at ai.google.dev
EMBEDDING_DIMENSIONS = 768                        # must match whatever Member 3 configures pgvector for

TAGGING_PROMPT = """You are a fashion cataloging assistant with expertise across
global and regional clothing styles, including Indian wear (kurta, kurti, sherwani,
saree, lehenga, salwar, dupatta, sari blouse, etc.) and Western wear. Look at this
clothing item image and identify it as SPECIFICALLY and ACCURATELY as possible.

Return ONLY valid JSON, no other text, no markdown fences, matching exactly this shape:
{
  "category": "top | bottom | dress | footwear | outerwear | accessory",
  "subcategory": "the specific garment name, e.g. shirt, kurta, jeans, sneakers",
  "color": "main color",
  "pattern": "e.g. solid, striped, floral, printed, embroidered, checkered",
  "material": "best guess, e.g. cotton, silk, denim, wool, or null if unclear",
  "sleeve_type": "e.g. full, half, sleeveless, three-quarter, or null if not applicable",
  "fit": "fitted | regular | loose | oversized",
  "style": "an aesthetic descriptor, e.g. minimalist, boho, formal, preppy, streetwear",
  "formality": "an integer from 1 (very casual) to 5 (very formal)",
  "season": ["a list of seasons this item suits, e.g. summer, winter, monsoon, spring, fall, all-season"],
  "occasions": ["a list of occasions this fits, e.g. college, office, presentation, party, date, wedding, gym"]
}
"""


def _tag_image(image_bytes: bytes, mime_type: str) -> dict:
    response = client.models.generate_content(
        model=VISION_MODEL,
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            TAGGING_PROMPT,
        ],
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )
    raw_text = response.text.strip().replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        raise ValueError(f"Vision LLM returned non-JSON output: {raw_text[:200]}")


def _embed_image(image_bytes: bytes, mime_type: str) -> list[float]:
    result = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=[types.Part.from_bytes(data=image_bytes, mime_type=mime_type)],
        config=types.EmbedContentConfig(output_dimensionality=EMBEDDING_DIMENSIONS),
    )
    return result.embeddings[0].values


def _embed_text(text: str) -> list[float]:
    result = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=[text],
        config=types.EmbedContentConfig(output_dimensionality=EMBEDDING_DIMENSIONS),
    )
    return result.embeddings[0].values


def _upload_to_cloudinary(image_bytes: bytes) -> str:
    """Upload the image to Cloudinary and return its public URL."""
    result = cloudinary.uploader.upload(image_bytes, folder="clot_wardrobe")
    return result["secure_url"]


# --- Request/response schemas (the API contract Member 3 codes against) ----

class EmbedQueryRequest(BaseModel):
    query: str


class EmbedQueryResponse(BaseModel):
    embedding: list[float]
    dimensions: int


class ProcessImageResponse(BaseModel):
    attributes: dict
    embedding: list[float]
    dimensions: int
    image_url: str


# --- Routes ------------------------------------------------------------

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/process-image", response_model=ProcessImageResponse)
async def process_image(file: UploadFile = File(...)):
    """
    Takes one clothing photo. Uploads it to Cloudinary, tags it, and embeds
    it — returns the image URL, attributes, and embedding in one response so
    Member 3's backend only needs one request per item.
    """
    try:
        contents = await file.read()
        mime_type = file.content_type or "image/jpeg"

        image_url = _upload_to_cloudinary(contents)
        attributes = _tag_image(contents, mime_type)
        embedding = _embed_image(contents, mime_type)

        return ProcessImageResponse(
            attributes=attributes,
            embedding=embedding,
            dimensions=len(embedding),
            image_url=image_url,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/embed-query", response_model=EmbedQueryResponse)
async def embed_query(request: EmbedQueryRequest):
    """
    Takes a free-text occasion/style query (e.g. 'something aesthetic for a
    dinner date tonight'). Returns an embedding in the SAME vector space as
    /process-image embeddings, so Member 3 can run pgvector similarity search
    directly against it.
    """
    try:
        embedding = _embed_text(request.query)
        return EmbedQueryResponse(embedding=embedding, dimensions=len(embedding))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))