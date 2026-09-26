import os
# ==================================================
# SSL
# ==================================================

# try:
#     import truststore

#     truststore.inject_into_ssl()

# except Exception:
#     pass
# import certifi

# os.environ.setdefault("SSL_CERT_FILE", certifi.where())
# os.environ.setdefault("REQUESTS_CA_BUNDLE", certifi.where())

from fastapi import FastAPI, HTTPException ,Query
from typing import Optional
# ==================================================
# SCHEMAS
# ==================================================

from models.schemas import (
    ClothingCreate,
    Intent,
    LayerRecommendationRequest,
    SearchRequest,
    RetrieveRequest,
    WeatherRecommendationRequest,
    RecommendationRequest,
    DailyRecommendationRequest,
    SwapItemRequest,
    LikeOutfitRequest,
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
    like_outfit,
    get_liked_outfits,
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

from services.deafult_recom import create_default_intent

from services.outfit_swap import rank_swap_candidates

from services.layer_service import (
    # is_layer_item,
    # layer_weather_score,
    # layer_style_score,
    # layer_color_score,
    # score_layer,
    recommend_layers,
)
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
def get_clothes(user_id: str, category: Optional[str] = Query(None)):

    try:

        return get_user_clothes(
        user_id=user_id,
        category=category
    )

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

# Default Recommendation Endpoint
@app.post("/daily-recommendation")
async def daily_recommendation(
    request: DailyRecommendationRequest
):

    try:

        # ==================================================
        # 1. VALIDATE PRESET
        # ==================================================

        allowed_presets = [
            "weather",
            "meeting",
            "presentation",
            "dinner",
            "college",
            "weekend"
        ]

        preset = request.preset.lower()

        if preset not in allowed_presets:

            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Invalid preset.",
                    "allowed_presets": allowed_presets
                }
            )

        print("\n====================================")
        print("PRESET:", preset)
        print("====================================")


        # ==================================================
        # 2. GET WEATHER
        # ==================================================
        # We fetch weather for ALL presets because weather
        # can influence the final outfit.
        #
        # Example:
        # Meeting + 32°C → lighter formal clothes
        # Dinner + 15°C → jacket/layer can be useful
        # College + rain → avoid unsuitable footwear
        # ==================================================

        weather = await get_current_weather(
            request.latitude,
            request.longitude
        )

        print("\n===== WEATHER =====")
        print(weather)


        # ==================================================
        # 3. WEATHER CONTEXT
        # ==================================================

        weather_context = get_weather_context(
            weather
        )

        print("\n===== WEATHER CONTEXT =====")
        print(weather_context)


        # ==================================================
        # 4. CREATE INTENT BASED ON PRESET
        # ==================================================

        intent = create_default_intent(
            preset,
            weather_context
        )

        print("\n===== INTENT =====")
        print(intent)


        # ==================================================
        # 5. GET USER CLOTHES
        # ==================================================

        clothes = get_user_clothes(
            request.user_id
        )

        if not clothes:

            raise HTTPException(
                status_code=404,
                detail="No clothes found for this user."
            )

        print(
            "\nTOTAL USER CLOTHES:",
            len(clothes)
        )


        # ==================================================
        # 6. FILTER CLOTHES
        # ==================================================

        weather_sensitive_clothes = []

        temperature = weather_context.get(
            "temperature"
        )

        for item in clothes:

            item_season = [
                str(s).lower()
                for s in item.get("season", [])
            ]

            # ------------------------------------------
            # WEATHER FILTER
            # ------------------------------------------

            weather_compatible = True

            if temperature is not None:

                # Cold
                if temperature < 18:

                    weather_compatible = (
                        "winter" in item_season
                        or
                        "fall" in item_season
                        or
                        "all" in item_season
                    )

                # Hot
                elif temperature > 28:

                    weather_compatible = (
                        "summer" in item_season
                        or
                        "spring" in item_season
                        or
                        "all" in item_season
                    )

                # Moderate
                else:

                    weather_compatible = True


            if weather_compatible:

                weather_sensitive_clothes.append(
                    item
                )


        # ------------------------------------------
        # FALLBACK
        # ------------------------------------------

        if not weather_sensitive_clothes:

            weather_sensitive_clothes = clothes


        print(
            "\nWEATHER COMPATIBLE CLOTHES:",
            len(weather_sensitive_clothes)
        )


        # ==================================================
        # 7. FILTER BASED ON PRESET / INTENT
        # ==================================================

        filtered_clothes = filter_clothes(
            weather_sensitive_clothes,
            intent.model_dump()
            if hasattr(intent, "model_dump")
            else intent
        )

        print(
            "\nINTENT COMPATIBLE CLOTHES:",
            len(filtered_clothes)
        )


        # If intent filtering removes everything,
        # use weather-compatible clothes.

        if not filtered_clothes:

            filtered_clothes = weather_sensitive_clothes


        # ==================================================
        # 8. BUILD OUTFITS
        # ==================================================

        outfits = build_outfits(
            filtered_clothes
        )

        print(
            "\nGENERATED OUTFITS:",
            len(outfits)
        )


        # ==================================================
        # 9. RANK OUTFITS
        # ==================================================

        recommendations = rank_outfits(
            outfits,
            intent,
            weather
        )

        print(
            "\nRANKED RECOMMENDATIONS:",
            len(recommendations)
        )


        # ==================================================
        # 10. RETURN
        # ==================================================

        return {

            "success": True,

            "preset": preset,

            "user_id": request.user_id,

            "weather": weather,

            "weather_context": weather_context,

            "intent": (
                intent.model_dump()
                if hasattr(intent, "model_dump")
                else intent
            ),

            "available_clothes": len(clothes),

            "weather_compatible_clothes":
                len(weather_sensitive_clothes),

            "intent_compatible_clothes":
                len(filtered_clothes),

            "generated_outfits":
                len(outfits),

            "recommendations":
                recommendations[:request.top_k]
        }


    except HTTPException:

        raise


    except Exception as e:

        import traceback

        print(
            "\n===== DAILY RECOMMENDATION ERROR ====="
        )

        print(
            type(e).__name__
        )

        print(
            str(e)
        )

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
# Swap Item Endpoint
@app.post("/swap-item")
async def swap_item(request: SwapItemRequest):

    try:
        # 1. Get all wardrobe items
        clothes = get_user_clothes(request.user_id)

        print("TOTAL CLOTHES:", len(clothes))

        # 2. Keep only the requested category
        candidates = [
            item
            for item in clothes
            if (item.get("category") or "").lower()
            == request.swap_category.lower()
        ]

        print("SWAP CATEGORY:", request.swap_category)
        print("CANDIDATES:", len(candidates))

        # 3. Rank candidates against locked items
        alternatives = rank_swap_candidates(
            candidates=candidates,
            locked_items=request.locked_items,
            current_item_id=request.current_item_id,
            limit=request.limit
        )

        print("ALTERNATIVES:", alternatives)

        return {
            "success": True,
            "swap_category": request.swap_category,
            "candidate_count": len(candidates),
            "alternatives": alternatives
        }

    except Exception as e:
        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==================================================
# LAYER RECOMMENDATION  
@app.post("/add-layer")
def add_layer(request: LayerRecommendationRequest):

    try:

        # -----------------------------------------
        # 1. GET ALL USER CLOTHES
        # -----------------------------------------

        clothes = get_user_clothes(
            request.user_id
        )

        if not clothes:
            raise HTTPException(
                status_code=404,
                detail="No clothes found for this user."
            )

        # -----------------------------------------
        # 2. FIND THE CURRENT OUTFIT ITEMS
        # -----------------------------------------

        outfit_items = []

        outfit_ids = {
            str(item_id)
            for item_id in request.outfit_item_ids
        }

        for item in clothes:

            item_id = str(
                item.get("id", "")
            )

            if item_id in outfit_ids:
                outfit_items.append(item)

        # -----------------------------------------
        # 3. CHECK THAT OUTFIT EXISTS
        # -----------------------------------------

        if (
            request.outfit_item_ids
            and not outfit_items
        ):
            raise HTTPException(
                status_code=404,
                detail="None of the outfit items were found."
            )

        # -----------------------------------------
        # 4. RECOMMEND LAYERS
        # -----------------------------------------

        recommendations = recommend_layers(
            clothes=clothes,
            outfit_items=outfit_items,
            temperature=request.temperature,
            requested_layer_type=request.layer_type,
            top_k=request.top_k
        )

        # -----------------------------------------
        # 5. RETURN RESULTS
        # -----------------------------------------

        return {
            "user_id": request.user_id,

            "temperature": request.temperature,

            "weather_condition":
                request.weather_condition,

            "outfit_items":
                outfit_items,

            "layer_recommendations":
                recommendations
        }

    except HTTPException:
        raise

    except Exception as e:

        import traceback

        print("\n===== LAYER ERROR =====")
        print(type(e).__name__)
        print(e)

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.post("/outfits/like")
async def like_outfit_endpoint(request: LikeOutfitRequest):

    try:
        saved_outfit = like_outfit(
            user_id=request.user_id,
            outfit=request.outfit
        )

        return {
            "success": True,
            "message": "Outfit liked successfully",
            "liked_outfit_id": saved_outfit["id"]
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.get("/outfits/liked/{user_id}")
async def get_liked_outfits_endpoint(user_id: str):

    try:
        outfits = get_liked_outfits(user_id)

        return {
            "success": True,
            "count": len(outfits),
            "outfits": outfits
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# @app.get("/test-supabase-direct")
# def test_supabase_direct():
#     try:
#         print("STEP 1")

#         from services.supabase_service import get_supabase_client

#         print("STEP 2")

#         client = get_supabase_client()

#         print("STEP 3")

#         result = (
#             client
#             .table("clothes")
#             .select("id")
#             .limit(1)
#             .execute()
#         )

#         print("STEP 4")
#         print(result.data)

#         return {
#             "success": True,
#             "data": result.data
#         }

#     except Exception as e:
#         print("ERROR:", repr(e))

#         return {
#             "success": False,
#             "error": repr(e)
#         }
