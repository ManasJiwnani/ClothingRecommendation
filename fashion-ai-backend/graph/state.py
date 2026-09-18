from typing import Any, TypedDict


class RecommendationState(TypedDict, total=False):

    # -----------------------------
    # INPUT FROM FASTAPI
    # -----------------------------

    user_id: str

    query_embedding: list[float]

    intent: dict[str, Any]

    latitude: float
    longitude: float

    retrieval_limit: int
    top_k: int

    # -----------------------------
    # WEATHER
    # -----------------------------

    weather: dict[str, Any]

    weather_context: dict[str, Any]

    # -----------------------------
    # RETRIEVAL
    # -----------------------------

    clothes: list[dict[str, Any]]

    # -----------------------------
    # OUTFIT GENERATION
    # -----------------------------

    outfits: list[dict[str, Any]]

    # -----------------------------
    # RANKING
    # -----------------------------

    ranked_outfits: list[dict[str, Any]]

    # -----------------------------
    # FINAL RESULT
    # -----------------------------

    recommendations: list[dict[str, Any]]