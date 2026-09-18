from services.weather import get_current_weather
from services.weather_context import get_weather_context

from services.retrieval import (
    retrieve_clothes as retrieve_clothes_service
)

from services.outfit_builder import build_outfits
from services.outfit_ranker import rank_outfits

from graph.state import RecommendationState


# =========================================================
# 1. PREPARE INTENT
# =========================================================

def prepare_intent_node(
    state: RecommendationState
):

    print("\n================================")
    print("LANGGRAPH - PREPARE INTENT")
    print("================================")

    intent = state.get("intent", {})

    print("Intent:", intent)

    return {
        "intent": intent
    }


# =========================================================
# 2. GET WEATHER
# =========================================================

async def weather_node(
    state: RecommendationState
):

    print("\n================================")
    print("LANGGRAPH - WEATHER")
    print("================================")

    latitude = state["latitude"]
    longitude = state["longitude"]

    print("Latitude:", latitude)
    print("Longitude:", longitude)

    # Get current weather
    weather = await get_current_weather(
        latitude,
        longitude
    )

    # Convert weather into categories
    weather_context = get_weather_context(
        weather
    )

    print("Weather:", weather)
    print("Weather context:", weather_context)

    return {
        "weather": weather,
        "weather_context": weather_context
    }


# =========================================================
# 3. RETRIEVE CLOTHES
# =========================================================

def retrieval_node(
    state: RecommendationState
):

    print("\n================================")
    print("LANGGRAPH - RETRIEVAL")
    print("================================")

    user_id = state["user_id"]
    query_embedding = state["query_embedding"]
    intent = state["intent"]

    retrieval_limit = state.get(
        "retrieval_limit",
        5
    )

    clothes = retrieve_clothes_service(
        user_id=user_id,
        query_embedding=query_embedding,
        intent=intent,
        limit=retrieval_limit
    )

    print(
        "Retrieved clothes:",
        len(clothes)
    )

    return {
        "clothes": clothes
    }


# =========================================================
# 4. BUILD OUTFITS
# =========================================================

def outfit_builder_node(
    state: RecommendationState
):

    print("\n================================")
    print("LANGGRAPH - OUTFIT BUILDING")
    print("================================")

    clothes = state.get(
        "clothes",
        []
    )

    outfits = build_outfits(
        clothes
    )

    print(
        "Generated outfits:",
        len(outfits)
    )

    return {
        "outfits": outfits
    }


# =========================================================
# 5. RANK OUTFITS
# =========================================================

def ranking_node(
    state: RecommendationState
):

    print("\n================================")
    print("LANGGRAPH - OUTFIT RANKING")
    print("================================")

    outfits = state.get(
        "outfits",
        []
    )

    intent = state["intent"]

    weather = state.get(
        "weather"
    )

    ranked_outfits = rank_outfits(
        outfits,
        intent,
        weather
    )

    print(
        "Ranked outfits:",
        len(ranked_outfits)
    )

    return {
        "ranked_outfits": ranked_outfits
    }


# =========================================================
# 6. FINALIZE RECOMMENDATIONS
# =========================================================

def finalize_node(
    state: RecommendationState
):

    print("\n================================")
    print("LANGGRAPH - FINALIZE")
    print("================================")

    ranked_outfits = state.get(
        "ranked_outfits",
        []
    )

    top_k = state.get(
        "top_k",
        5
    )

    recommendations = ranked_outfits[
        :top_k
    ]

    print(
        "Final recommendations:",
        len(recommendations)
    )

    return {
        "recommendations": recommendations
    }