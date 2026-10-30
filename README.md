# CLOSET AI

CLOSET AI is a digital wardrobe application that helps users organize clothing, discover outfit combinations, and try on looks virtually. The project consists of an Expo frontend and two Python API services: a fashion recommendation backend and an AI/Vision service.

## Project features

- Add clothing to a digital closet and review/edit detected garment details.
- Generate daily recommendations from closet items, occasion presets, and weather context.
- Explore stylist looks and recommendations tailored to profile preferences.
- Save, like, and manage outfits.
- Swap recommendation items and add layers.
- Process clothing images and create virtual try-ons.
- Manage a style profile and preferences.

## Architecture

```text
frontend/                 Expo / React Native app (web, iOS, Android)
fashion-ai-backend/       FastAPI closet and outfit recommendation API (port 8000)
AI-Services/              FastAPI image processing and virtual try-on API (port 8001)
```

The frontend calls both APIs. The fashion backend handles closet retrieval and outfit recommendations; the AI/Vision service handles image processing and related AI workflows. Supabase provides authentication and application data, and Cloudinary is used for image storage by configured workflows.

## Requirements

- Node.js and npm
- Python (use a version supported by the Python dependencies; `AI-Services/pyproject.toml` currently specifies Python 3.13 or newer)
- Supabase credentials
- Provider credentials for the AI, weather, and image-storage features enabled in your setup

## Configuration

Create local `.env` files as needed. Never commit API keys, service-role keys, or other secrets.

### Frontend: `frontend/.env`

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional API URL overrides:
EXPO_PUBLIC_FASHION_API_URL=http://localhost:8000
EXPO_PUBLIC_AI_API_URL=http://localhost:8001
```

The frontend defaults to the fashion API on port `8000` and derives the AI API address using port `8001`. The repository's default API host is intended for local development. When testing on a physical device, configure the API URLs to use your development computer's reachable LAN address.

### Fashion backend: `fashion-ai-backend/.env`

Configure the Supabase credentials and any provider keys required by the backend:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
```

The backend configuration also supports `SUPABASE_KEY`, `GEMINI_API_KEY`, and `WEATHER_API_KEY` where those integrations are enabled. Keep privileged keys on the server; do not expose them through `EXPO_PUBLIC_` variables.

### AI/Vision service: `AI-Services/.env`

Set credentials for the integrations used by your workflows. Common variables include:

```env
OPENAI_API_KEY=your-openai-api-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
```

## Run locally on Windows

Start each service in its own terminal.

### 1. Fashion recommendation backend

```powershell
cd fashion-ai-backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload 
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. AI/Vision service

```powershell
cd AI-Services
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python main.py
```

The `main.py` application starts on port `8001`.

API docs: [http://localhost:8001/docs](http://localhost:8001/docs)

### 3. Expo frontend

```powershell
cd frontend
npm install
npm run web
```

To start the Expo development server for an emulator or Expo Go:

```powershell
npm start
```

Follow the Expo CLI prompts to open the app on the desired platform.

## API route discovery

FastAPI's interactive documentation at `/docs` is the best source for the current request and response schemas. The fashion backend exposes endpoints for closet items, recommendations, weather, outfit swaps/layers, and liked outfits. The AI/Vision service includes health checks, clothing and whole-outfit processing, virtual try-on, and app-help routes.

## Security and generated files

- Keep `.env` files out of version control.
- Never put Supabase service-role keys or private provider keys in the frontend.
- Do not commit virtual environments, generated garment caches, temporary images, or build output.
