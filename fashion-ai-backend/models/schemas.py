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