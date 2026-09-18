from services.outfit_scorer import score_outfit


# Example outfit
outfit = {
    "type": "separates",

    "top": {
        "category": "top",
        "color": "white",
        "style": "casual",
        "formality": 2,
        "occasions": ["college"],
        "sleeve_type": "short",
        "similarity": 0.8
    },

    "bottom": {
        "category": "bottom",
        "color": "blue",
        "style": "casual",
        "formality": 2,
        "occasions": ["college"],
        "similarity": 0.8
    }
}


intent = {
    "occasion": "college",
    "style": "casual",
    "formality": 2,
    "color_preference": [],
    "excluded_items": []
}


# Hot weather
hot_weather = {
    "temperature": 32,
    "rain": 0
}


# Cold weather
cold_weather = {
    "temperature": 15,
    "rain": 0
}


hot_score = score_outfit(
    outfit,
    intent,
    hot_weather
)

cold_score = score_outfit(
    outfit,
    intent,
    cold_weather
)


print("Hot weather score:", hot_score)
print("Cold weather score:", cold_score)