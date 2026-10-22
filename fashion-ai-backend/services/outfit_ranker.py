from services.outfit_scorer import score_outfit
from services.intent_matching import (
    is_professional_occasion,
    is_professional_outfit_appropriate,
    get_item_constraints,
    outfit_matches_item_constraints,
)


def _item_key(item):
    if item is None:
        return None

    item_id = item.get("id")
    if item_id is not None:
        return ("id", str(item_id))

    return ("object", id(item))


def _core_item_keys(outfit):
    if outfit.get("type") == "dress":
        core_items = [outfit.get("dress")]
    else:
        core_items = [outfit.get("top"), outfit.get("bottom")]

    return {
        key
        for item in core_items
        if (key := _item_key(item)) is not None
    }


def rank_outfits(outfits, intent, weather=None, top_k=5):
    if top_k <= 0:
        return []

    if hasattr(intent, "model_dump"):
        intent = intent.model_dump()

    professional_occasion = is_professional_occasion(intent.get("occasion"))
    item_constraints = get_item_constraints(intent)
    scored = []

    for outfit in outfits:
        if not outfit_matches_item_constraints(
            outfit,
            item_constraints,
        ):
            continue

        if professional_occasion and not is_professional_outfit_appropriate(outfit):
            continue

        score = score_outfit(outfit, intent, weather)
        scored.append({
            "outfit": outfit,
            "score": round(score, 2)
        })

    scored.sort(key=lambda x: x["score"], reverse=True)

    selected = []
    seen_core_items = set()
    selected_core_outfits = set()

    def add_non_overlapping():
        for candidate in scored:
            if candidate in selected:
                continue

            outfit = candidate["outfit"]
            core_keys = _core_item_keys(outfit)
            core_outfit_key = frozenset(core_keys)
            if (
                not core_keys
                or core_outfit_key in selected_core_outfits
                or core_keys & seen_core_items
            ):
                continue

            selected.append(candidate)
            selected_core_outfits.add(core_outfit_key)
            seen_core_items.update(core_keys)

            if len(selected) == top_k:
                return

    add_non_overlapping()

    for candidate in scored:
        if len(selected) == top_k:
            break
        if candidate in selected:
            continue

        outfit = candidate["outfit"]
        core_keys = _core_item_keys(outfit)
        core_outfit_key = frozenset(core_keys)
        if not core_keys or core_outfit_key in selected_core_outfits:
            continue

        selected.append(candidate)
        selected_core_outfits.add(core_outfit_key)

    return selected