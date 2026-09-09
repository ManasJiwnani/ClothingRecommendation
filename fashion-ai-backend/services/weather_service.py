def weather_score(item, weather):

    score = 0

    temperature = weather["temperature"]

    sleeve = item.get("sleeve_type")

    if temperature > 28:
        if sleeve in ["short", "sleeveless"]:
            score += 10

    if temperature < 20:
        if sleeve in ["long", "full"]:
            score += 10

    return score