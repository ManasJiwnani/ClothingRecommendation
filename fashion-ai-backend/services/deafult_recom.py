from models.schemas import Intent


def create_default_intent(
    preset: str,
    weather_context: dict
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
    # DINNER
    # ==================================================

    if preset == "dinner":

        return Intent(
            occasion="dinner",
            style="smart casual",
            formality=3,
            mood="elegant",
            weather_sensitive=True
        )

    # ==================================================
    # MEETING
    # ==================================================

    if preset == "meeting":

        return Intent(
            occasion="work",
            style="smart casual",
            formality=4,
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