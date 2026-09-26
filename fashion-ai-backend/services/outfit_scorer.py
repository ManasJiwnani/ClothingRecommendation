# defines style compatibility between different styles
# get items from outfit
# score individual item relevance based on occasion style formality and semantic similarity
# score occasion compatibility based on requested occasion and item occasions
# score formality compatibility based on requested formality and item formality
# score style compatibility based on item styles and predefined style compatibility
# score color compatibility based on item colors and predefined color compatibility
# calculate total score for outfit based on individual item relevance, occasion compatibility, formality compatibility, style compatibility, color compatibility, and user color preference
from services.weather_scorer import weather_score as item_weather_score
from services.color_matcher import (
    score_outfit_colors
)


# STYLE COMPATIBILITY
STYLE_COMPATIBILITY = {

    "casual": {
        "casual",
        "streetwear",
        "sporty",
        "minimalist"
    },

    "formal": {
        "formal",
        "classic",
        "minimalist",
        "elegant"
    },

    "smart_casual": {
        "smart_casual",
        "casual",
        "classic",
        "minimalist",
        "elegant"
    },

    "sporty": {
        "sporty",
        "casual",
        "streetwear"
    },

    "streetwear": {
        "streetwear",
        "casual",
        "sporty"
    },

    "classic": {
        "classic",
        "formal",
        "minimalist",
        "elegant",
        "smart_casual"
    },

    "elegant": {
        "elegant",
        "classic",
        "formal",
        "minimalist",
        "smart_casual"
    },

    "minimalist": {
        "minimalist",
        "casual",
        "formal",
        "classic",
        "elegant",
        "smart_casual"
    }
}

# GET ITEMS FROM OUTFIT
def get_outfit_items(outfit):

    if outfit.get("type") == "separates":

        items = [
            outfit.get("top"),
            outfit.get("bottom"),
            outfit.get("footwear")
        ]

    elif outfit.get("type") == "dress":

        items = [
            outfit.get("dress"),
            outfit.get("footwear")
        ]

    else:

        items = []

    return [
        item
        for item in items
        if item
    ]


# ITEM RELEVANCE
def score_item_relevance(item, intent):

    score = 0

    # Occasion
    requested_occasion = intent.get("occasion")

    if requested_occasion:

        occasions = item.get("occasions") or []

        if requested_occasion in occasions:

            score += 20


    # Style requested by user
    requested_style = intent.get("style")

    if requested_style:

        item_style = item.get("style")

        if item_style == requested_style:

            score += 15

    # Formality requested by user
    requested_formality = intent.get("formality")

    item_formality = item.get("formality")

    if (
        requested_formality is not None
        and item_formality is not None
    ):

        difference = abs(
            item_formality - requested_formality
        )

        if difference == 0:

            score += 15

        elif difference == 1:

            score += 10

        elif difference == 2:

            score += 3

        else:

            score -= 5


    # Semantic similarity
    similarity = item.get(
        "similarity",
        0
    )

    score += similarity * 10


    return score


# OCCASION COMPATIBILITY
def score_occasion(items, intent):

    requested_occasion = intent.get(
        "occasion"
    )

    if not requested_occasion:

        return 0

    score = 0

    for item in items:

        occasions = item.get(
            "occasions"
        ) or []

        if requested_occasion in occasions:

            score += 8

        else:

            # Small penalty instead of
            # completely rejecting the item.
            score -= 2

    return score

# FORMALITY COMPATIBILITY
def score_formality_compatibility(
    items,
    requested_formality
):

    if requested_formality is None:

        return 0

    score = 0

    for item in items:

        item_formality = item.get(
            "formality"
        )

        if item_formality is None:

            continue

        difference = abs(
            item_formality
            - requested_formality
        )

        # Exact match
        if difference == 0:

            score += 8

        # Close match
        elif difference == 1:

            score += 5

        # Somewhat different
        elif difference == 2:

            score += 0

        # Very different
        else:

            score -= 8

        # Strong penalty for casual items
        # in formal outfits
        if (
            requested_formality >= 4
            and item_formality <= 2
        ):

            score -= 10

    return score

# STYLE COMPATIBILITY
def score_style_compatibility(items):

    styles = []

    for item in items:

        style = item.get("style")

        if style:

            styles.append(
                style.lower().strip()
            )

    if len(styles) < 2:

        return 0

    score = 0

    # Compare every pair of items
    for i in range(len(styles)):

        for j in range(i + 1, len(styles)):

            style1 = styles[i]
            style2 = styles[j]

            # Same style
            if style1 == style2:

                score += 5

            # Compatible styles
            elif (
                style2
                in STYLE_COMPATIBILITY.get(
                    style1,
                    set()
                )
            ):

                score += 3

            # Incompatible styles
            else:

                score -= 3

    return score

# COLOR PREFERENCE
def score_color_preference(items, intent):

    preferred_colors = (
        intent.get("color_preference")
        or []
    )

    if not preferred_colors:

        return 0

    preferred_colors = {
        color.lower().strip()
        for color in preferred_colors
    }

    score = 0

    for item in items:

        color = item.get("color")

        if not color:

            continue

        color = color.lower().strip()

        if color in preferred_colors:

            score += 8

    return score

# OUTFIT SCORING
def score_outfit(outfit, intent, weather=None):
    items = get_outfit_items(
        outfit
    )

    if not items:

        return 0


    total_score = 0

    # 1. Individual item relevance
    for item in items:

        total_score += score_item_relevance(
            item,
            intent
        )

    # 2. Occasion compatibility
    total_score += score_occasion(
        items,
        intent
    )

    # 3. Formality compatibility
    total_score += score_formality_compatibility(
        items,
        intent.get("formality")
    )

    # 4. Style compatibility
    total_score += score_style_compatibility(
        items
    )

    # 5. Color compatibility
    total_score += score_outfit_colors(
        outfit
    )

    # 6. User color preference
    total_score += score_color_preference(
        items,
        intent
    )

    if weather:
        for item in items:
            total_score += item_weather_score(item, weather)

    return round(total_score, 2)


    