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


