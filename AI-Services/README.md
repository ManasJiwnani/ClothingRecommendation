# FashionR AI/Vision Service

FashionR is a FastAPI service for cataloging clothing images. It uploads each
image to Cloudinary, uses Gemini vision to extract fashion attributes, and
creates a 768-dimensional Gemini embedding for image or text search.

## Features

- Upload clothing images to Cloudinary
- Extract category, color, pattern, material, fit, style, season, and occasion
  attributes with Gemini
- Generate matching embeddings for clothing images and text queries
- Provide a health-check endpoint for service monitoring

## Requirements

- Python 3.13 or newer
- `uv`
- A Google Gemini API key
- A Cloudinary account and API credentials

## Setup

Install dependencies with `uv`:

```powershell
uv sync
```

Create a `.env` file in the project root. Do not commit this file:

```env
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Run locally

Start the API on port 8001:

```powershell
uv run uvicorn main:app --reload --port 8001
```

The interactive API documentation is available at:

```text
http://127.0.0.1:8001/docs
```

## API endpoints

### `GET /health`

Returns the service status:

```json
{"status": "healthy"}
```

### `POST /process-image`

Upload one clothing image using the multipart field `file`:

```powershell
curl.exe -X POST http://127.0.0.1:8001/process-image -F "file=@path\to\clothing.jpg"
```

The response contains:

- `image_url`: the Cloudinary secure URL
- `attributes`: Gemini-generated clothing metadata
- `embedding`: the image embedding
- `dimensions`: the embedding size, currently 768

### `POST /embed-query`

Generate an embedding for a style or occasion query:

```powershell
curl.exe -X POST http://127.0.0.1:8001/embed-query `
	-H "Content-Type: application/json" `
	-d "{\"query\":\"a formal outfit for a dinner date\"}"
```

The returned text embedding uses the same vector space and dimensions as the
image embeddings.

## TLS troubleshooting

If the local network uses HTTPS inspection, Cloudinary or package downloads may
fail with an `SSL: CERTIFICATE_VERIFY_FAILED` error. Configure the network's
trusted root certificate for Python rather than disabling TLS verification in a
production deployment.

The current local development upload code disables Cloudinary certificate
verification to work around this issue. Remove that workaround and use the
organization's CA certificate before deploying the service.

## Project layout

```text
FashionR/
├── main.py          # FastAPI application
├── pyproject.toml   # Project metadata and dependencies
├── uv.lock          # Locked dependency versions
├── AI-Services/     # AI service-related project files
└── src/fashionr/    # Python package source
```

## Security

- Never commit `.env`, API keys, or Cloudinary secrets.
- Restrict `allow_origins` in CORS before production deployment.
- Replace the development-only `ssl_verify=False` upload setting before
  deploying to a real environment.
