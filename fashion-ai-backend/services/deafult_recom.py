from models.schemas import Intent


def create_default_intent(
    preset: str,
    weather_context: dict,
    gender: str = "female",
) -> Intent:

    temperature = weather_context.get(
        "temperature",
        25
    )

    temperature_category = weather_context.get(
        "temperature_category",
        "warm"
    )

    rain_category = weather_context.get(
        "rain_category",
        "dry"
    )

    overall = weather_context.get(
        "overall",
        temperature_category
    )

    # ==================================================
    # WEATHER PRESET
    # ==================================================

    if preset == "weather":

        # ------------------------------------------
        # HOT + DRY
        # ------------------------------------------

        if temperature_category == "hot" and rain_category == "dry":

            return Intent(
                occasion="daily",
                style="casual",
                formality=1,
                mood="light",
                weather_sensitive=True
            )

        # ------------------------------------------
        # HOT + RAINY
        # ------------------------------------------

        if temperature_category == "hot" and rain_category == "rainy":

            return Intent(
                occasion="daily",
                style="casual",
                formality=1,
                mood="light",
                weather_sensitive=True
            )

        # ------------------------------------------
        # WARM
        # ------------------------------------------

        if temperature_category == "warm":

            return Intent(
                occasion="daily",
                style="casual",
                formality=2,
                mood="comfortable",
                weather_sensitive=True
            )

        # ------------------------------------------
        # COOL
        # ------------------------------------------

        if temperature_category == "cool":

            return Intent(
                occasion="daily",
                style="casual",
                formality=2,
                mood="comfortable",
                weather_sensitive=True
            )

        # ------------------------------------------
        # COLD
        # ------------------------------------------

        if temperature_category == "cold":

            return Intent(
                occasion="daily",
                style="smart casual",
                formality=2,
                mood="cozy",
                weather_sensitive=True
            )

    # ==================================================
    # FESTIVE OCCASIONS
    # ==================================================

    if preset == "festive":
        if gender.casefold().strip() == "male":
            return Intent(
                occasion="festive",
                style="ethnic",
                formality=4,
                mood="festive",
                weather_sensitive=False,
                category_preference=["kurta", "pants"],
                item_constraints=[
                    {
                        "category": "top",
                        "garment": "kurta",
                    },
                    {
                        "category": "bottom",
                        "garment": "trousers",
                    },
                ],
            )

        return Intent(
            occasion="festive",
            style="ethnic",
            formality=4,
            mood="festive",
            weather_sensitive=False,
            category_preference=["saree","kurta","suit"],
            item_constraints=[
                {
                    "category": "dress",
                    "garment": "saree",
                }
            ],
            cultural_aesthetic="Indian Ethnic",
            is_strictly_traditional=True,
        )

    # ==================================================
    # MEETING
    # ==================================================

    if preset == "meeting":
        return Intent(
            occasion="office",
            style="casual",
            formality=2,
            mood="professional",
            weather_sensitive=True
        )

    # ==================================================
    # WEEKEND
    # ==================================================

    if preset == "weekend":

        return Intent(
            occasion="weekend",
            style="casual",
            formality=2,
            mood="relaxed",
            weather_sensitive=True
        )

    # ==================================================
    # FALLBACK
    # ==================================================

    return Intent(
        occasion="daily",
        style="casual",
        formality=2,
        mood="comfortable",
        weather_sensitive=True
    )