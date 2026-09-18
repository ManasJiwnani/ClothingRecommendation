import os

import certifi
from fastapi import FastAPI, HTTPException

os.environ.setdefault("SSL_CERT_FILE", certifi.where())
os.environ.setdefault("REQUESTS_CA_BUNDLE", certifi.where())


# ==================================================
# SCHEMAS
# ==================================================

from models.schemas import (
    ClothingCreate,
    Intent,
    SearchRequest,
    RetrieveRequest,
    WeatherRecommendationRequest,
    RecommendationRequest,
)


# ==================================================
# DATABASE
# ==================================================

from services.supabase_service import (
    add_clothing,
    get_user_clothes,
    get_clothing_by_id,
    search_similar_clothes,
    prepare_clothing_data,
)


# ==================================================
# WEATHER
# ==================================================

from services.weather import get_current_weather
from services.weather_context import get_weather_context


# ==================================================
# RECOMMENDATION PIPELINE
# ==================================================

from services.retrieval import retrieve_clothes
from services.outfit_builder import build_outfits
from services.outfit_ranker import rank_outfits

from graph.workflow import recommendation_graph


# ==================================================
# SSL
# ==================================================

try:
    import truststore

    truststore.inject_into_ssl()

except Exception:
    pass


# ==================================================
# FASTAPI APP
# ==================================================

app = FastAPI(
    title="AI Fashion Backend",
    description="AI-powered wardrobe recommendation API",
    version="1.0.0",
)


# ==================================================
# HOME
# ==================================================

@app.get("/")
def home():
    return {
        "message": "Fashion AI Backend is running"
    }


# ==================================================
# GET USER CLOTHES
# ==================================================

@app.get("/clothes/{user_id}")
def get_clothes(user_id: str):

    try:

        clothes = get_user_clothes(user_id)

        return clothes

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==================================================
# ADD CLOTHING
# ==================================================

@app.post("/clothes/{user_id}")
def create_clothing(
    user_id: str,
    clothing: ClothingCreate
):

    try:

        # --------------------------------------------------
        # IMPORTANT:
        # ClothingCreate is FLAT.
        #
        # Therefore we cannot use:
        #
        # clothing.attributes
        #
        # Instead we construct the attributes dictionary
        # from the individual fields.
        # --------------------------------------------------

        attributes = {
            "category": clothing.category,
            "subcategory": clothing.subcategory,
            "color": clothing.color,
            "secondary_color": clothing.secondary_color,
            "pattern": clothing.pattern,
            "material": clothing.material,
            "sleeve_type": clothing.sleeve_type,
            "fit": clothing.fit,
            "style": clothing.style,
            "formality": clothing.formality,
            "season": clothing.season,
            "occasions": clothing.occasions,
        }

        # --------------------------------------------------
        # Prepare database row
        # --------------------------------------------------

        data = prepare_clothing_data(
            user_id=user_id,
            image_url=clothing.image_url,
            attributes=attributes,
            embedding=clothing.embedding,
        )

        # --------------------------------------------------
        # Insert into Supabase
        # --------------------------------------------------

        result = add_clothing(data)

        return {
            "message": "Clothing added successfully",
            "data": result,
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==================================================
# GET SINGLE CLOTHING ITEM
# ==================================================

@app.get("/clothing/{clothing_id}")
def get_clothing(clothing_id: str):

    try:

        result = get_clothing_by_id(clothing_id)

        if not result:

            raise HTTPException(
                status_code=404,
                detail="Clothing item not found"
            )

        return result

    except HTTPException:

        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==================================================
# SEMANTIC SEARCH
# ==================================================

@app.post("/search-clothes")
def search_clothes(request: SearchRequest):

    try:

        results = search_similar_clothes(
            user_id=request.user_id,
            query_embedding=request.query_embedding,
            limit=request.limit,
        )

        return {
            "results": results
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==================================================
# RETRIEVAL + FILTERING
# ==================================================

@app.post("/retrieve-clothes")
def retrieve(request: RetrieveRequest):

    try:

        # Convert Pydantic Intent → dictionary

        intent = request.intent.model_dump()

        clothes = retrieve_clothes(
            user_id=request.user_id,
            query_embedding=request.query_embedding,
            intent=intent,
            limit=request.limit,
        )

        return {
            "count": len(clothes),
            "clothes": clothes,
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==================================================
# WEATHER
# ==================================================

@app.post("/weather")
async def get_weather(
    request: WeatherRecommendationRequest
):

    try:

        # --------------------------------------------------
        # Get current weather from Open-Meteo
        # --------------------------------------------------

        weather = await get_current_weather(
            request.latitude,
            request.longitude,
        )

        # --------------------------------------------------
        # Convert raw weather → clothing context
        # --------------------------------------------------

        weather_context = get_weather_context(
            weather
        )

        return {
            "user_id": request.user_id,
            "weather": weather,
            "weather_context": weather_context,
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==================================================
# COMPLETE RECOMMENDATION PIPELINE
# ==================================================

@app.post("/recommend")
async def recommend(
    request: RecommendationRequest
):

    try:

        # --------------------------------------------------
        # 1. PREPARE INITIAL STATE
        # --------------------------------------------------

        intent = request.intent.model_dump()

        print("\n================================")
        print("RECOMMENDATION REQUEST")
        print("================================")

        print("User:", request.user_id)
        print("Intent:", intent)

        initial_state = {

            "user_id": request.user_id,

            "query_embedding": request.query_embedding,

            "intent": intent,

            "latitude": request.latitude,

            "longitude": request.longitude,

            "retrieval_limit": request.retrieval_limit,

            "top_k": request.top_k,
        }

        # --------------------------------------------------
        # 2. RUN LANGGRAPH WORKFLOW
        # --------------------------------------------------

        result = await recommendation_graph.ainvoke(
            initial_state
        )

        # --------------------------------------------------
        # 3. RETURN RESPONSE
        # --------------------------------------------------

        return {

            "user_id": request.user_id,

            "intent": result.get(
                "intent",
                {}
            ),

            "weather": result.get(
                "weather"
            ),

            "weather_context": result.get(
                "weather_context"
            ),

            "retrieved_clothes": len(
                result.get(
                    "clothes",
                    []
                )
            ),

            "generated_outfits": len(
                result.get(
                    "outfits",
                    []
                )
            ),

            "recommendations": result.get(
                "recommendations",
                []
            ),
        }

    except Exception as e:

        import traceback

        print("\n================================")
        print("RECOMMENDATION ERROR")
        print("================================")

        print(type(e).__name__)
        print(str(e))

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )