from services.outfit_scorer import score_outfit


def rank_outfits(outfits, intent, weather=None):

    if hasattr(intent, "model_dump"):
        intent = intent.model_dump()

    scored = []

    for outfit in outfits:

        score = score_outfit(
            outfit,
            intent,
            weather
        )

        scored.append({
            "outfit": outfit,
            "score": round(score, 2)
        })

    scored.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return scored