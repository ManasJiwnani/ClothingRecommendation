try:
    import truststore
    truststore.inject_into_ssl()
except Exception:
    pass 

def is_layer_item(item):
    """
    Check whether a clothing item can be used as a layer.
    """

    category = str(
        item.get("category", "")
    ).lower()

    subcategory = str(
        item.get("subcategory", "")
    ).lower()

    layer_keywords = [
        "jacket",
        "blazer",
        "sweater",
        "cardigan",
        "shrug",
        "hoodie",
        "coat",
        "vest",
        "jacket",
        "outerwear"
    ]

    text = f"{category} {subcategory}"

    return any(
        keyword in text
        for keyword in layer_keywords
    )


def layer_weather_score(item, temperature):
    """
    Score a layer according to temperature.
    """

    if temperature is None:
        return 0

    subcategory = str(
        item.get("subcategory", "")
    ).lower()

    score = 0

    # Very cold
    if temperature < 10:

        if any(
            x in subcategory
            for x in [
                "coat",
                "jacket",
                "sweater"
            ]
        ):
            score += 40

    # Cold
    elif temperature < 18:

        if any(
            x in subcategory
            for x in [
                "jacket",
                "sweater",
                "cardigan",
                "coat"
            ]
        ):
            score += 35

    # Mild
    elif temperature < 24:

        if any(
            x in subcategory
            for x in [
                "shrug",
                "cardigan",
                "light jacket",
                "blazer"
            ]
        ):
            score += 30

    # Warm
    elif temperature < 28:

        if any(
            x in subcategory
            for x in [
                "shrug",
                "light jacket",
                "blazer"
            ]
        ):
            score += 15

    # Hot
    else:

        # Usually don't recommend layering
        score -= 30

    return score


def layer_style_score(
    layer,
    outfit_items
):
    """
    Give a compatibility score between
    the layer and the existing outfit.
    """

    score = 0

    layer_style = str(
        layer.get("style", "")
    ).lower()

    layer_formality = layer.get(
        "formality"
    )

    for item in outfit_items:

        item_style = str(
            item.get("style", "")
        ).lower()

        item_formality = item.get(
            "formality"
        )

        # Same style
        if (
            layer_style
            and item_style
            and layer_style == item_style
        ):
            score += 15

        # Similar formality
        if (
            layer_formality is not None
            and item_formality is not None
        ):

            difference = abs(
                layer_formality
                - item_formality
            )

            if difference == 0:
                score += 15

            elif difference == 1:
                score += 10

            elif difference == 2:
                score += 5

    return score


def layer_color_score(
    layer,
    outfit_items
):
    """
    Basic color compatibility score.
    """

    layer_color = str(
        layer.get("color", "")
    ).lower()

    if not layer_color:
        return 0

    neutral_colors = [
        "black",
        "white",
        "grey",
        "gray",
        "beige",
        "cream",
        "brown",
        "navy"
    ]

    score = 0

    # Neutral layers are generally versatile
    if layer_color in neutral_colors:
        score += 10

    return score


def score_layer(
    layer,
    outfit_items,
    temperature=None,
    requested_layer_type=None
):
    """
    Calculate the final layer score.
    """

    score = 0

    # --------------------------------
    # WEATHER
    # --------------------------------

    score += layer_weather_score(
        layer,
        temperature
    )

    # --------------------------------
    # STYLE
    # --------------------------------

    score += layer_style_score(
        layer,
        outfit_items
    )

    # --------------------------------
    # COLOR
    # --------------------------------

    score += layer_color_score(
        layer,
        outfit_items
    )

    # --------------------------------
    # USER REQUESTED TYPE
    # --------------------------------

    if requested_layer_type:

        subcategory = str(
            layer.get("subcategory", "")
        ).lower()

        if requested_layer_type.lower() in subcategory:
            score += 30

    return score


def recommend_layers(
    clothes,
    outfit_items,
    temperature=None,
    requested_layer_type=None,
    top_k=5
):
    """
    Find and rank suitable layering items.
    """

    candidates = []

    for item in clothes:

        # Only layer-compatible clothes
        if not is_layer_item(item):
            continue

        score = score_layer(
            layer=item,
            outfit_items=outfit_items,
            temperature=temperature,
            requested_layer_type=requested_layer_type
        )

        # Remove embedding from output
        layer_output = {
            key: value
            for key, value in item.items()
            if key != "embedding"
        }

        candidates.append({
            "item": layer_output,
            "score": score
        })

    # Highest score first
    candidates.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return candidates[:top_k]