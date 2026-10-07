from services.outfit_scorer import score_outfit


<<<<<<< Updated upstream
def rank_outfits(outfits, intent):
=======
def _item_identity(item):
    for field in ("id", "image_url"):
        value = item.get(field)
        if value:
            return field, str(value)

    return (
        "attributes",
        str(item.get("category", "")).lower(),
        str(item.get("subcategory", "")).lower(),
        str(item.get("color", "")).lower(),
    )


def _bottom_family(item):
    description = " ".join(
        str(item.get(field, "")).lower()
        for field in ("category", "clothing_type", "subcategory")
    )
    if "jean" in description or "denim" in description:
        return "denim"
    if "skirt" in description:
        return "skirt"
    if "short" in description:
        return "shorts"
    if "legging" in description:
        return "leggings"
    if "jogger" in description:
        return "joggers"
    if "culotte" in description:
        return "culottes"
    if "trouser" in description or "pant" in description:
        return "trousers"
    return description


def select_diverse_outfits(recommendations, limit):
    if limit <= 0:
        return []

    selected = []
    selected_bottoms = set()
    selected_families = set()

    # Prefer showing different garment types (for example, denim and skirts)
    # before filling the list with several outfits using the same type.
    for recommendation in recommendations:
        outfit = recommendation.get("outfit", {})
        bottom = outfit.get("bottom") or outfit.get("dress")
        if not bottom:
            continue

        identity = _item_identity(bottom)
        family = _bottom_family(bottom)
        if identity in selected_bottoms or family in selected_families:
            continue

        selected_bottoms.add(identity)
        selected_families.add(family)
        selected.append(recommendation)
        if len(selected) == limit:
            return selected

    for recommendation in recommendations:
        outfit = recommendation.get("outfit", {})
        bottom = outfit.get("bottom") or outfit.get("dress")
        if bottom:
            identity = _item_identity(bottom)
            if identity in selected_bottoms:
                continue
            selected_bottoms.add(identity)
        selected.append(recommendation)
        if len(selected) == limit:
            return selected

    if len(selected) < limit:
        selected_ids = {id(recommendation) for recommendation in selected}
        for recommendation in recommendations:
            if id(recommendation) in selected_ids:
                continue
            selected.append(recommendation)
            if len(selected) == limit:
                break

    return selected


def rank_outfits(outfits, intent, weather=None):
>>>>>>> Stashed changes

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