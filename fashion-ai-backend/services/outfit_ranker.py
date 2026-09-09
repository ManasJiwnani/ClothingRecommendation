from services.outfit_scorer import score_outfit


def rank_outfits(outfits, intent):

    # Convert Pydantic Intent → dictionary
    if hasattr(intent, "model_dump"):
        intent = intent.model_dump()

    print("\n===== RANKING =====")
    print("Intent type:", type(intent))
    print("Intent:", intent)

    scored = []

    for outfit in outfits:

        score = score_outfit(
            outfit,
            intent
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