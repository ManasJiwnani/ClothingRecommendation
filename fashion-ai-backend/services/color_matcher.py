
# COLOR COMPATIBILITY
COLOR_COMPATIBILITY = {

    "black": {
        "white",
        "grey",
        "blue",
        "beige",
        "brown",
        "cream",
        "black"
    },

    "white": {
        "black",
        "blue",
        "grey",
        "beige",
        "brown",
        "cream",
        "white"
    },

    "blue": {
        "white",
        "black",
        "beige",
        "grey",
        "brown",
        "cream",
        "blue"
    },

    "beige": {
        "white",
        "black",
        "blue",
        "brown",
        "grey",
        "cream",
        "beige"
    },

    "grey": {
        "black",
        "white",
        "blue",
        "beige",
        "brown",
        "cream",
        "grey"
    },

    "brown": {
        "white",
        "beige",
        "blue",
        "grey",
        "cream",
        "brown"
    },

    "cream": {
        "black",
        "white",
        "blue",
        "beige",
        "brown",
        "grey",
        "cream"
    }
}

# COLOR ALIASES
COLOR_ALIASES = {

    "navy": "blue",
    "navy blue": "blue",
    "dark blue": "blue",
    "light blue": "blue",
    "royal blue": "blue",

    "off white": "white",
    "off-white": "white",
    "ivory": "white",

    "charcoal": "grey",
    "dark grey": "grey",
    "light grey": "grey",

    "tan": "beige",
    "khaki": "beige"
}

# NORMALIZE COLOR
def normalize_color(color):

    if not color:
        return None

    color = color.lower().strip()

    return COLOR_ALIASES.get(color, color)

# CHECK COLOR COMPATIBILITY
def is_color_compatible(color1, color2):

    color1 = normalize_color(color1)
    color2 = normalize_color(color2)

    # If either color is missing,
    # don't penalize the outfit.
    if not color1 or not color2:
        return True

    # Same colors are allowed.
    if color1 == color2:
        return True

    compatible_colors = COLOR_COMPATIBILITY.get(
        color1,
        set()
    )

    return color2 in compatible_colors

# SCORE TWO COLORS
def score_color_pair(color1, color2):

    color1 = normalize_color(color1)
    color2 = normalize_color(color2)

    if not color1 or not color2:
        return 0

    # Same color
    if color1 == color2:
        return 8

    # Compatible colors
    if is_color_compatible(color1, color2):
        return 10

    # Incompatible colors
    return -5


# SCORE ALL COLORS IN AN OUTFIT
def score_outfit_colors(outfit):

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
        return 0

    # Get colors
    colors = []

    for item in items:

        if not item:
            continue

        color = normalize_color(
            item.get("color")
        )

        if color:
            colors.append(color)

    # Need at least two colors
    if len(colors) < 2:
        return 0

    score = 0

    # Compare every color pair
    for i in range(len(colors)):

        for j in range(i + 1, len(colors)):

            score += score_color_pair(
                colors[i],
                colors[j]
            )

    return score