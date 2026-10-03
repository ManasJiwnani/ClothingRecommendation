# CLOSET — AI/Vision + API Service

AI-powered image processing and embedding service for the **CLOSET Digital Wardrobe** application.

This service is responsible for processing uploaded clothing images, validating and extracting fashion items, generating clothing attributes and embeddings, and returning the processed clothing data to the downstream backend.

---

## 📌 Overview

The CLOSET AI/Vision service provides two main capabilities:

1. **Clothing Image Processing**

   * Resizes the uploaded image.
   * Detects and extracts fashion items using the FASHN Human Parser pipeline.
   * Produces a transparent clothing PNG.
   * Validates that the uploaded image contains a supported fashion item.
   * Uses Gemini Vision to generate structured clothing attributes.
   * Uses Gemini Embedding 2 to generate a 768-dimensional image embedding.
   * Uploads the transparent clothing image to Cloudinary.
   * Returns the processed data to the backend.
2. **Natural-Language Outfit Query Processing**

   * Converts a user's outfit request into a 768-dimensional embedding.
   * Extracts structured intent such as occasion, style, formality, mood, colors, and excluded items.
   * Allows the downstream recommendation system to perform semantic matching and filtering.

---

## 🏗️ Architecture

```text
                         CLOSET AI/Vision Service
                                  │
                                  │
                    ┌─────────────▼─────────────┐
                    │     User Uploads Image    │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Image Resize   │
                         │   PIL / Pillow  │
                         └────────┬────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │ FASHN Human Parser      │
                    │ Fashion Validation +     │
                    │ Clothing Segmentation   │
                    └────────────┬────────────┘
                                 │
                       Fashion Item Found?
                         /              \
                       No                Yes
                       │                  │
                       ▼                  ▼
                  Return 400       Transparent PNG
                                          │
                                          ▼
                              ┌────────────────────┐
                              │    Gemini Vision   │
                              │ Clothing Attributes│
                              └─────────┬──────────┘
                                        │
                                        ▼
                              ┌────────────────────┐
                              │ Gemini Embedding 2 │
                              │ 768-D Embedding    │
                              └─────────┬──────────┘
                                        │
                                        ▼
                              ┌────────────────────┐
                              │    Cloudinary      │
                              │ Transparent Image  │
                              └─────────┬──────────┘
                                        │
                                        ▼
                              ┌────────────────────┐
                              │ API Response       │
                              │                    │
                              │ Attributes         │
                              │ Embedding          │
                              │ Image URL          │
                              └─────────┬──────────┘
                                        │
                                        ▼
                              Member 3 / Supabase
```

---

# ✨ Features

### 1. Image Validation

Before using Gemini, the image is processed through the fashion extraction pipeline.

This prevents unnecessary Gemini API calls when the uploaded image does not contain a supported fashion item.

Example:

```text
Dog image
   ↓
FASHN validation
   ↓
No fashion item detected
   ↓
400 Bad Request
   ↓
Gemini is NOT called
```

---

### 2. Image Resizing

Large uploaded images are resized before processing.

The longest side is limited to **768 pixels** in the API pipeline.

Example:

```text
4032 × 3024
      ↓
1024 × 768
      ↓
FASHN processing
```

The aspect ratio is preserved.

Pillow is used for image processing.

---

### 3. Fashion Item Extraction

The FASHN Human Parser pipeline is responsible for identifying and extracting supported clothing/fashion items.

The output is a transparent PNG containing the extracted item.

```text
Original Image
      ↓
Human/Fashion Parsing
      ↓
Background Removal
      ↓
Transparent Clothing PNG
```

Only the processed transparent clothing image is sent to Gemini and Cloudinary.

---

### 4. Clothing Attribute Extraction

Gemini Vision analyzes the extracted clothing item and returns structured JSON.

Example:

```json
{
  "category": "top",
  "subcategory": "shirt",
  "color": "white",
  "pattern": "solid",
  "material": "cotton",
  "sleeve_type": "full",
  "fit": "regular",
  "style": "formal",
  "formality": 4,
  "season": [
    "summer",
    "spring",
    "fall"
  ],
  "occasions": [
    "office",
    "presentation",
    "formal"
  ]
}
```

The service is instructed not to invent information and to return `null` when an attribute cannot reasonably be determined.

---

### 5. Image Embeddings

Gemini Embedding 2 generates a semantic embedding for the extracted clothing image.

Current configuration:

```text
Model:
gemini-embedding-2-preview

Dimensions:
768
```

The embedding can be used by the recommendation system for semantic similarity and outfit matching.

---

### 6. Natural-Language Query Embeddings

The `/embed-query` endpoint converts natural-language outfit requests into:

* 768-dimensional embedding
* Structured fashion intent

Example query:

```text
Something aesthetic for a dinner date tonight
```

Possible intent:

```json
{
  "occasion": "dinner date",
  "style": "aesthetic",
  "formality": null,
  "mood": null,
  "weather_sensitive": true,
  "color_preference": null,
  "excluded_items": null
}
```

This allows Member 3's recommendation layer to combine semantic similarity with structured filtering.

---

# 🧩 Technology Stack

| Technology           | Purpose                                   |
| -------------------- | ----------------------------------------- |
| Python               | Core programming language                 |
| FastAPI              | REST API framework                        |
| FASHN Human Parser   | Fashion detection and extraction          |
| Pillow               | Image resizing and processing             |
| Google Gemini        | Vision + embeddings + query understanding |
| Gemini Embedding 2   | Image/text embeddings                     |
| Cloudinary           | Clothing image storage                    |
| Pydantic             | Request/response validation               |
| Uvicorn              | ASGI server                               |
| python-dotenv        | Environment variable management           |
| Truststore / Certifi | SSL certificate handling                  |

---

# 📁 Project Structure

A recommended project structure is:

```text
AI-Services/
│
├── main.py
│
├── backgroundr.py
│
├── requirements.txt
│
├── .env
│
├── .gitignore
│
└── README.md
```

Where:

### `main.py`

Contains:

* FastAPI application
* Gemini configuration
* Cloudinary configuration
* Image resizing
* Gemini Vision tagging
* Gemini embeddings
* Query intent extraction
* API endpoints

### `backgroundr.py`

Contains the FASHN-based fashion extraction / background-removal logic.

### `.env`

Contains API credentials and configuration.

**Do not commit this file to GitHub.**

---

# 🔐 Environment Variables

Create a `.env` file in the project root.

```env
GEMINI_API_KEY=your_gemini_api_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

The application will stop during startup if any required environment variable is missing.

---

# 📦 Installation

## 1. Clone the repository

```bash
git clone <your-repository-url>
cd AI-Services
```

---

## 2. Create a virtual environment

Windows:

```bash
python -m venv .venv
```

Activate it:

```powershell
.venv\Scripts\activate
```

Linux/macOS:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

## 3. Install dependencies

```bash
pip install -r requirements.txt
```

If you do not have a `requirements.txt` yet, the main dependencies include:

```text
fastapi
uvicorn
python-multipart
python-dotenv
google-genai
cloudinary
pillow
pydantic
certifi
truststore
```

The FASHN parser dependencies should also be installed according to the implementation in `backgroundr.py`.

---

# ▶️ Running the API

Start the FastAPI server using:

```bash
uvicorn main:app --reload
```

If your file has a different name, replace `main` accordingly.

For example:

```bash
uvicorn app:app --reload
```

The API will normally be available at:

```text
http://127.0.0.1:8000
```

---

# 📚 API Documentation

FastAPI automatically provides interactive API documentation.

Swagger UI:

```text
http://127.0.0.1:8000/docs
```

ReDoc:

```text
http://127.0.0.1:8000/redoc
```

---

# 🔌 API Endpoints

## GET `/health`

Checks whether the API service is running.

### Request

```http
GET /health
```

### Response

```json
{
  "status": "healthy"
}
```

---

# 👕 POST `/process-image`

Processes an uploaded clothing image.

### Pipeline

```text
Upload
  ↓
Resize
  ↓
FASHN Fashion Validation
  ↓
Transparent Clothing PNG
  ↓
Gemini Vision
  ↓
Gemini Image Embedding
  ↓
Cloudinary
  ↓
Response
```

### Request

```http
POST /process-image
Content-Type: multipart/form-data
```

Form field:

```text
file
```

Example using cURL:

```bash
curl -X POST \
  http://127.0.0.1:8000/process-image \
  -F "file=@shirt.jpg"
```

---

## Successful Response

```json
{
  "attributes": {
    "category": "top",
    "subcategory": "shirt",
    "color": "blue",
    "pattern": "solid",
    "material": "cotton",
    "sleeve_type": "full",
    "fit": "regular",
    "style": "casual",
    "formality": 2,
    "season": [
      "summer",
      "spring"
    ],
    "occasions": [
      "college",
      "casual",
      "outing"
    ]
  },
  "embedding": [
    0.0123,
    -0.0456
  ],
  "dimensions": 768,
  "image_url": "https://res.cloudinary.com/..."
}
```

The actual embedding response contains **768 values**.

---

## Invalid Fashion Image

If the FASHN pipeline cannot detect a supported fashion item:

```http
400 Bad Request
```

Example:

```json
{
  "detail": "No supported fashion item was detected in the uploaded image."
}
```

In this situation, the Gemini Vision and Gemini Embedding calls are skipped.

This is important for reducing unnecessary API usage.

---

# 💬 POST `/embed-query`

Converts a natural-language outfit request into a semantic embedding and structured intent.

### Request

```http
POST /embed-query
Content-Type: application/json
```

Body:

```json
{
  "query": "Suggest something formal for an office presentation"
}
```

---

## Response

```json
{
  "embedding": [
    0.021,
    -0.034
  ],
  "intent": {
    "occasion": "office presentation",
    "style": "formal",
    "formality": 4,
    "mood": null,
    "weather_sensitive": false,
    "color_preference": null,
    "excluded_items": null
  },
  "dimensions": 768
}
```

Again, the actual embedding contains **768 values**.

---

# 🧠 Query Intent Structure

The `/embed-query` endpoint returns:

```json
{
  "occasion": null,
  "style": null,
  "formality": null,
  "mood": null,
  "weather_sensitive": null,
  "color_preference": null,
  "excluded_items": null
}
```

### Fields

| Field                 | Description                         |
| --------------------- | ----------------------------------- |
| `occasion`          | Event or situation                  |
| `style`             | Desired fashion style               |
| `formality`         | 1–5 formality level                |
| `mood`              | Desired mood                        |
| `weather_sensitive` | Whether weather affects the request |
| `color_preference`  | Requested colors                    |
| `excluded_items`    | Items the user does not want        |

---

# 🔄 Data Flow to Member 3

The AI/Vision service is responsible for producing the following output:

```text
                 Member 2
                    │
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
   Clothing Image        Clothing Metadata
          │                   │
          │                   ├── Attributes
          │                   └── Embedding
          │
          ▼
      Cloudinary
          │
          ▼
       Image URL
          │
          └──────────────┐
                         ▼
                  Member 3 / Supabase
```

Member 3 can store:

```text
image_url
attributes
embedding
```

and use them for:

* Semantic similarity
* Filtering
* Ranking
* Outfit composition
* Weather-aware recommendations
* Occasion matching
* Style matching
* Recommendation workflows

---

# 🧮 Embedding Usage

The same embedding space is used for clothing images and text queries.

Conceptually:

```text
Clothing Image
      │
      ▼
Image Embedding
      │
      │
      │   Semantic Similarity
      │
      ▼
Text Query
      ▲
      │
Text Embedding
      │
      ▲
Natural Language Request
```

For example:

```text
User:
"Something casual for a college outing"
             │
             ▼
       Text Embedding
             │
             ▼
       Similarity Search
             │
             ▼
      Closet Clothing
             │
             ▼
     Recommendation
```

The downstream recommendation layer can combine embedding similarity with the structured intent.

---

# 🛡️ Error Handling

The API handles several failure cases.

### Missing Gemini API key

```text
GEMINI_API_KEY not found
```

The application stops during startup.

### Missing Cloudinary configuration

The application validates:

```text
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

before starting.

### Invalid image

```text
Uploaded file is not a valid image.
```

### Empty upload

```text
Uploaded image is empty.
```

### No fashion item

```text
No supported fashion item was detected
in the uploaded image.
```

### Invalid Gemini JSON

The Vision response is parsed as JSON and an error is raised if the returned content cannot be parsed.

---

# 🔒 Security

Never commit API credentials to Git.

Add the following to `.gitignore`:

```gitignore
.env
.venv/
__pycache__/
*.pyc
```

Use environment variables for:

```text
GEMINI_API_KEY
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

For production deployment, replace:

```python
allow_origins=["*"]
```

with the actual frontend domain(s).

---

# ⚡ API Call Optimization

The image pipeline intentionally performs fashion validation before Gemini processing.

```text
                Upload
                  │
                  ▼
              FASHN Parser
                  │
        ┌─────────┴─────────┐
        │                   │
     Invalid              Valid
        │                   │
        ▼                   ▼
     Stop              Gemini Vision
                            │
                            ▼
                     Gemini Embedding
```

This prevents Gemini calls for images that do not contain supported fashion items.

The service also resizes images before processing to reduce unnecessary image size.

---

# 🧪 Testing

## Health Check

```bash
curl http://127.0.0.1:8000/health
```

---

## Image Processing

```bash
curl -X POST \
  http://127.0.0.1:8000/process-image \
  -F "file=@test_shirt.jpg"
```

---

## Query Embedding

```bash
curl -X POST \
  http://127.0.0.1:8000/embed-query \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"Something casual for a college outing\"}"
```

---

# 🖥️ Using Swagger UI

After starting the server, open:

```text
http://127.0.0.1:8000/docs
```

You can test the endpoints without writing frontend code.

### Test `/process-image`

1. Open `/docs`.
2. Expand `POST /process-image`.
3. Click **Try it out**.
4. Select an image.
5. Click **Execute**.
6. Inspect the returned attributes, embedding, dimensions, and Cloudinary URL.

### Test `/embed-query`

1. Expand `POST /embed-query`.
2. Click **Try it out**.
3. Enter a query.
4. Click **Execute**.
5. Inspect the generated intent and embedding.

---
