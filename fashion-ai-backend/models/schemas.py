from pydantic import BaseModel, Field, field_validator
from typing import Optional


# ==================================================
# INTENT
# ==================================================

class Intent(BaseModel):
    occasion: Optional[str] = None
    style: Optional[str] = None
    formality: Optional[int] = None
    mood: Optional[str] = None
    weather_sensitive: bool = False
    color_preference: list[str] = Field(default_factory=list)
    excluded_items: list[str] = Field(default_factory=list)

    @field_validator("formality")
    @classmethod
    def validate_formality(cls, value):
        if value is not None and not 1 <= value <= 5:
            raise ValueError("Formality must be between 1 and 5")
        return value


# ==================================================
# CLOTHING
# ==================================================

class ClothingCreate(BaseModel):
    user_id: str
    image_url: str

    category: Optional[str] = None
    subcategory: Optional[str] = None
    color: Optional[str] = None
    secondary_color: Optional[str] = None
    pattern: Optional[str] = None
    material: Optional[str] = None
    sleeve_type: Optional[str] = None
    fit: Optional[str] = None
    style: Optional[str] = None
    formality: Optional[int] = None

    season: list[str] = Field(default_factory=list)
    occasions: list[str] = Field(default_factory=list)

    embedding: list[float]

    @field_validator("embedding")
    @classmethod
    def validate_embedding(cls, value):
        if len(value) != 768:
            raise ValueError(
                f"Clothing embedding must have 768 dimensions, got {len(value)}"
            )
        return value


# ==================================================
# SEARCH
# ==================================================

class SearchRequest(BaseModel):
    user_id: str

    query_embedding: list[float]

    limit: int = Field(default=5, gt=0, le=20)

    @field_validator("query_embedding")
    @classmethod
    def validate_query_embedding(cls, value):
        if len(value) != 768:
            raise ValueError(
                f"Query embedding must have 768 dimensions, got {len(value)}"
            )
        return value


# ==================================================
# RETRIEVAL
# ==================================================

class RetrieveRequest(BaseModel):
    user_id: str

    query_embedding: list[float]

    dimensions: int = 768

    intent: Intent

    limit: int = Field(default=20, gt=0, le=50)

    @field_validator("query_embedding")
    @classmethod
    def validate_query_embedding(cls, value):
        if len(value) != 768:
            raise ValueError(
                f"Query embedding must have 768 dimensions, got {len(value)}"
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


# ==================================================
# WEATHER
# ==================================================

class WeatherRecommendationRequest(BaseModel):
    user_id: str

    latitude: float
    longitude: float

    top_k: int = Field(default=5, gt=0, le=20)


# ==================================================
# COMPLETE RECOMMENDATION
# ==================================================

class RecommendationRequest(BaseModel):
    user_id: str

    query_embedding: list[float]

    intent: Intent

    latitude: float
    longitude: float

    retrieval_limit: int = Field(default=5, gt=0, le=20)

    top_k: int = Field(default=5, gt=0, le=20)

    @field_validator("query_embedding")
    @classmethod
    def validate_query_embedding(cls, value):
        if len(value) != 768:
            raise ValueError(
                f"Query embedding must have 768 dimensions, got {len(value)}"
            )
        return value

class DailyRecommendationRequest(BaseModel):
    user_id: str
    preset: str = "weather"
    latitude: float
    longitude: float
    top_k: int = Field(
        default=5,
        gt=0,
        le=20
    )

class SwapItemRequest(BaseModel):
    user_id: str
    swap_category: str

    current_item_id: str | None = None

    locked_items: list[dict] = Field(
        default_factory=list
    )

    limit: int = 5



class LayerRecommendationRequest(BaseModel):
    user_id: str

    # IDs of the clothes currently present in the outfit
    outfit_item_ids: list[str] = Field(
        default_factory=list
    )

    # Optional: user can explicitly ask for a type of layer
    layer_type: Optional[str] = None

    # Optional weather information
    temperature: Optional[float] = None

    weather_condition: Optional[str] = None

    # Number of layer recommendations
    top_k: int = Field(
        default=5,
        gt=0,
        le=10
    )

    @field_validator("layer_type")
    @classmethod
    def validate_layer_type(cls, value):

        if value is None:
            return value

        allowed = [
            "jacket",
            "blazer",
            "sweater",
            "cardigan",
            "shrug",
            "hoodie",
            "coat",
            "vest",
            "layer"
        ]

        value = value.lower().strip()

        if value not in allowed:
            raise ValueError(
                f"Invalid layer_type. Choose from: {allowed}"
            )

        return value

from typing import Any
from pydantic import BaseModel


class LikeOutfitRequest(BaseModel):
    user_id: str
    outfit: dict[str, Any]

class LikeOutfitResponse(BaseModel):
    success: bool
    message: str
    liked_outfit_id: str | None = None