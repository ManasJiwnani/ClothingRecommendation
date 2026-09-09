from pydantic import BaseModel, Field, field_validator
from typing import Optional


class ClothingAttributes(BaseModel):
    category: str
    subcategory: Optional[str] = None
    color: Optional[str] = None
    secondary_color: Optional[str] = None
    pattern: Optional[str] = None
    material: Optional[str] = None
    sleeve_type: Optional[str] = None
    fit: Optional[str] = None
    style: Optional[str] = None
    formality: Optional[int] = None
    season: Optional[list[str]] = None
    occasions: Optional[list[str]] = None
    
# to-do: add gender to ClothingAttributes

class ClothingCreate(BaseModel):
    attributes: ClothingAttributes
    embedding: list[float]
    dimensions: int
    image_url: str

    @field_validator("embedding")
    @classmethod
    def validate_embedding(cls, value):
        if len(value) != 768:
            raise ValueError(
                f"Embedding must contain exactly 768 values, got {len(value)}"
            )
        return value

    @field_validator("dimensions")
    @classmethod
    def validate_dimensions(cls, value):
        if value != 768:
            raise ValueError(
                f"Embedding dimensions must be 768, got {value}"
            )
        return value


class Intent(BaseModel):
    occasion: Optional[str] = None
    style: Optional[str] = None
    formality: Optional[int] = None
    mood: Optional[str] = None
    weather_sensitive: bool = False
    color_preference: list[str] = Field(default_factory=list)
    excluded_items: list[str] = Field(default_factory=list)


class RecommendationRequest(BaseModel):
    user_id: str
    query_embedding: list[float]
    intent: Intent