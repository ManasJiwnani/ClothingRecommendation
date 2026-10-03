def convert_member2_output(
    member2_output: dict,
    user_id: str,
    latitude: float,
    longitude: float,
    retrieval_limit: int = 5,
    top_k: int = 5,
):
    attributes = member2_output.get("attributes", {})

    return {
        "user_id": user_id,

        "query_embedding": member2_output.get(
            "embedding",
            []
        ),

        "intent": {
            "occasion": attributes.get("occasion"),
            "style": attributes.get("style"),
            "formality": attributes.get("formality"),
            "mood": attributes.get("mood"),
            "weather_sensitive": attributes.get(
                "weather_sensitive",
                False
            ),
            "color_preference": attributes.get(
                "color_preference",
                []
            ),
            "excluded_items": attributes.get(
                "excluded_items",
                []
            ),
        },

        "latitude": latitude,
        "longitude": longitude,

        "retrieval_limit": retrieval_limit,
        "top_k": top_k,
    }