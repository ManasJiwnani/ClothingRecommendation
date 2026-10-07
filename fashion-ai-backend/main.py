from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator
from typing import Optional

from models.schemas import ClothingCreate,Intent

# Existing database functions
from services.supabase_service import (
    add_clothing,
    get_user_clothes,
    get_clothing_by_id,
    search_similar_clothes,
    prepare_clothing_data
)

# Recommendation modules
from services.retrieval import retrieve_clothes
from services.recommendation_service import filter_clothes
from services.outfit_builder import build_outfits
<<<<<<< Updated upstream
from services.color_matcher import (
    normalize_color,
    is_color_compatible,
    score_color_pair,
    score_outfit_colors
)
from services.outfit_scorer import (
    get_outfit_items,
    score_item_relevance,
    score_occasion,
    score_formality_compatibility,
    score_style_compatibility,
    score_color_preference,
    score_outfit
)
from services.outfit_ranker import rank_outfits
=======
from services.outfit_ranker import rank_outfits, select_diverse_outfits
>>>>>>> Stashed changes


app = FastAPI(
    title="AI Fashion Backend",
    description="AI-powered wardrobe recommendation API",
    version="1.0.0"
)

# HOME

@app.get("/")
def home():
    return {
        "message": "Fashion AI Backend is running"
    }

# INTENT MODEL
# class Intent(BaseModel):
#     occasion: Optional[str] = None
#     style: Optional[str] = None
#     formality: Optional[int] = None
#     mood: Optional[str] = None
#     weather_sensitive: bool = False

#     color_preference: list[str] = Field(
#         default_factory=list
#     )

#     excluded_items: list[str] = Field(
#         default_factory=list
#     )



# CLOTHING ENDPOINTS
@app.get("/clothes/{user_id}")
def get_clothes(user_id: str):

    try:
        return get_user_clothes(user_id)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# class ClothingCreate(BaseModel):
#     image_url: str
#     attributes: ClothingCreate
#     embedding: list[float]

#     @field_validator("embedding")
#     @classmethod
#     def validate_embedding(cls, value):

#         if len(value) != 768:
#             raise ValueError(
#                 f"Embedding must contain 768 values, got {len(value)}"
#             )

#         return value


@app.post("/clothes/{user_id}")
def create_clothing(user_id: str, clothing: ClothingCreate):
    try:
        attributes = clothing.attributes.model_dump()

        data = prepare_clothing_data(
            user_id=user_id,
            image_url=clothing.image_url,
            attributes=attributes,
            embedding=clothing.embedding
        )

        result = add_clothing(data)

        return {
            "message": "Clothing added successfully",
            "data": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/clothing/{clothing_id}")
def get_clothing(clothing_id: str):

    try:

        result = get_clothing_by_id(clothing_id)

        return result

    except Exception:

        raise HTTPException(
            status_code=404,
            detail="Clothing item not found"
        )

# SEMANTIC SEARCH
class SearchRequest(BaseModel):

    user_id: str
    embedding: list[float]
    limit: int = 5

    @field_validator("embedding")
    @classmethod
    def validate_embedding(cls, value):

        if len(value) != 768:
            raise ValueError(
                f"Embedding must contain 768 values, got {len(value)}"
            )

        return value


@app.post("/search-clothes")
def search_clothes(request: SearchRequest):

    try:

        results = search_similar_clothes(
            user_id=request.user_id,
            query_embedding=request.embedding,
            limit=request.limit
        )

        return {
            "results": results
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# RETRIEVAL + FILTERING
class RetrieveRequest(BaseModel):
    user_id: str
    query_embedding: list[float]
    dimensions: int
    intent: Intent
    limit: int = 20

    @field_validator("query_embedding")
    @classmethod
    def validate_embedding(cls, value):
        if len(value) != 768:
            raise ValueError(
                f"Embedding must contain 768 values, got {len(value)}"
            )
        return value

    @field_validator("dimensions")
    @classmethod
    def validate_dimensions(cls, value):
        if value != 768:
            raise ValueError(
                f"Dimensions must be 768, got {value}"
            )
        return value


@app.post("/retrieve-clothes")
def retrieve(request: RetrieveRequest):

    try:

        intent = request.intent.model_dump()

        clothes = retrieve_clothes(
            user_id=request.user_id,
            query_embedding=request.query_embedding,
            intent=intent,
            limit=request.limit
        )

        return {
            "count": len(clothes),
            "clothes": clothes
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# COMPLETE RECOMMENDATION PIPELINE
class RecommendationRequest(BaseModel):

    user_id: str
    query_embedding: list[float]
    intent: Intent

    retrieval_limit: int = 20
    top_k: int = 5

    @field_validator("query_embedding")
    @classmethod
    def validate_embedding(cls, value):

        if len(value) != 768:
            raise ValueError(
                f"Embedding must contain 768 values, got {len(value)}"
            )

        return value


@app.post("/recommend")
def recommend(request: RecommendationRequest):

    try:

        # 1. Convert intent
        intent = request.intent.model_dump()

        # 2. Retrieve relevant clothes
        clothes = retrieve_clothes(
            user_id=request.user_id,
            query_embedding=request.query_embedding,
            intent=intent,
            limit=request.retrieval_limit
        )

        # 3. Build possible outfits
        outfits = build_outfits(
            clothes
        )
        # 4. Rank outfits
        ranked_outfits = rank_outfits(
            outfits,
            intent
        )
        # 5. Return top K
        recommendations = ranked_outfits[
            :request.top_k
        ]

        return {
            "user_id": request.user_id,
            "intent": intent,
            "retrieved_clothes": len(clothes),
            "generated_outfits": len(outfits),
            "recommendations": recommendations
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/test-ranking")
def test_ranking(request: RecommendationRequest):

    try:

        clothes = retrieve_clothes(
            user_id=request.user_id,
            query_embedding=request.query_embedding,
            intent=request.intent,
            limit=5
        )

        print("Retrieved:", len(clothes))

        outfits = build_outfits(clothes)

        print("Outfits:", len(outfits))

        ranked_outfits = rank_outfits(
            outfits,
            request.intent
        )

        return {
            "retrieved": len(clothes),
            "outfits": len(outfits),
            "ranked": ranked_outfits[:5]
        }

    except Exception as e:

        print("\n===== ERROR =====")
        print(type(e).__name__)
        print(str(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
# FILTER CLOTHES
# class FilterRequest(BaseModel):

#     clothes: list[dict]
#     intent: Intent


# @app.post("/filter-clothes")
# def filter_clothing(request: FilterRequest):

<<<<<<< Updated upstream
=======
        allowed_presets = [
            "weather",
            "meeting",
            "presentation",
            "dinner",
            "party",
            "casual-day",
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

        weather_error = None
        try:
            weather = await get_current_weather(
                request.latitude,
                request.longitude
            )
            weather_context = get_weather_context(
                weather
            )
        except (httpx.HTTPError, ssl.SSLError, TimeoutError):
            logger.warning(
                "Live weather is unavailable for daily recommendations.",
                exc_info=True
            )
            weather = None
            weather_error = (
                "Live weather is temporarily unavailable. "
                "This outfit is based on your closet and selected occasion."
            )
            weather_context = get_weather_context({
                "temperature": 25,
                "rain": 0,
                "weather_code": None,
            })

        print("\n===== WEATHER =====")
        print(weather)


        # ==================================================
        # 3. WEATHER CONTEXT
        # ==================================================

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

            "weather_error": weather_error,

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
                select_diverse_outfits(
                    recommendations,
                    request.top_k
                )
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
>>>>>>> Stashed changes
#     try:

#         filtered = filter_clothes(
#             request.clothes,
#             request.intent.model_dump()
#         )

#         return {
#             "count": len(filtered),
#             "clothes": filtered
#         }

#     except Exception as e:

#         raise HTTPException(
#             status_code=500,
#             detail=str(e)
#         )


# # BUILD OUTFITS
# class BuildOutfitRequest(BaseModel):

#     clothes: list[dict]


# @app.post("/build-outfits")
# def build_outfits_endpoint(request: BuildOutfitRequest):

#     try:

#         outfits = build_outfits(
#             request.clothes
#         )

#         return {
#             "count": len(outfits),
#             "outfits": outfits
#         }

#     except Exception as e:

#         raise HTTPException(
#             status_code=500,
#             detail=str(e)
#         )


# # SCORE SINGLE ITEM
# class ScoreItemRequest(BaseModel):

#     item: dict
#     intent: Intent


# @app.post("/score-item")
# def score_single_item(request: ScoreItemRequest):

#     try:

#         score = score_item(
#             request.item,
#             request.intent.model_dump()
#         )

#         return {
#             "score": score
#         }

#     except Exception as e:

#         raise HTTPException(
#             status_code=500,
#             detail=str(e)
#         )


# # SCORE OUTFIT
# class ScoreOutfitRequest(BaseModel):

#     outfit: dict
#     intent: Intent


# @app.post("/score-outfit")
# def score_single_outfit(request: ScoreOutfitRequest):

#     try:

#         score = score_outfit(
#             request.outfit,
#             request.intent.model_dump()
#         )

#         return {
#             "score": score
#         }

#     except Exception as e:

#         raise HTTPException(
#             status_code=500,
#             detail=str(e)
#         )


# # RANK OUTFITS
# class RankOutfitsRequest(BaseModel):

#     outfits: list[dict]
#     intent: Intent


# @app.post("/rank-outfits")
# def rank_outfits_endpoint(request: RankOutfitsRequest):

#     try:

#         ranked = rank_outfits(
#             request.outfits,
#             request.intent.model_dump()
#         )

#         return {
#             "count": len(ranked),
#             "outfits": ranked
#         }

#     except Exception as e:

#         raise HTTPException(
#             status_code=500,
#             detail=str(e)
#         )

# # COLOR COMPATIBILITY
# class ColorPairRequest(BaseModel):

#     color1: str
#     color2: str


# @app.post("/color-compatible")
# def color_compatible(request: ColorPairRequest):

#     try:

#         compatible = is_color_compatible(
#             request.color1,
#             request.color2
#         )

#         score = score_color_pair(
#             request.color1,
#             request.color2
#         )

#         return {
#             "compatible": compatible,
#             "score": score
#         }

#     except Exception as e:

#         raise HTTPException(
#             status_code=500,
#             detail=str(e)
#         )


# # SCORE OUTFIT COLORS
# class ColorOutfitRequest(BaseModel):

#     outfit: dict


# @app.post("/score-outfit-colors")
# def score_colors(request: ColorOutfitRequest):

#     try:

#         score = score_outfit_colors(
#             request.outfit
#         )

#         return {
#             "color_score": score
#         }

#     except Exception as e:

#         raise HTTPException(
#             status_code=500,
#             detail=str(e)
#         )


