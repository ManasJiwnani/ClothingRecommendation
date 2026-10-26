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


def _outfit_has_traditional_signature(outfit):
    if outfit.get("type") == "dress":
        items = [outfit.get("dress")]
    else:
        items = [outfit.get("top"), outfit.get("bottom")]

    terms = (
        "lehenga",
        "ghagra",
        "choli",
        "kurta",
        "saree",
        "sari",
        "anarkali",
        "ethnic",
        "traditional",
        "festive",
        "navratri",
        "garba",
        "dandiya",
        "wedding",
        "embroidered",
        "silk",
        "palazzo",
    )

    for item in items:
        if not item:
            continue
        descriptor = " ".join(
            str(item.get(key) or "")
            for key in ("subcategory", "name", "style", "cultural_domain", "cultural_aesthetic", "category")
        ).casefold()
        if any(term in descriptor for term in terms):
            return True

    return False


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

    if not scored:
        return []

    requested_aesthetic = str(intent.get("cultural_aesthetic") or "").casefold()
    requested_occasion = str(intent.get("occasion") or "").casefold()
    is_traditional_context = (
        bool(intent.get("is_strictly_traditional"))
        or "traditional" in requested_aesthetic
        or "indian ethnic" in requested_aesthetic
        or any(keyword in requested_occasion for keyword in ("navratri", "garba", "dandiya", "diwali", "festive", "wedding", "sangeet"))
    )

    if is_traditional_context:
        scored.sort(
            key=lambda candidate: (
                1 if _outfit_has_traditional_signature(candidate["outfit"]) else 0,
                candidate["score"],
            ),
            reverse=True,
        )
    else:
        scored.sort(key=lambda x: x["score"], reverse=True)

    selected = []
    seen_core_items = set()
    seen_footwear = set()
    selected_core_outfits = set()
    footwear_pool = {
        _item_key(candidate["outfit"].get("footwear"))
        for candidate in scored
        if candidate["outfit"].get("footwear") is not None
    }
    enforce_unique_footwear = len(footwear_pool) > 1

    def add_non_overlapping():
        for candidate in scored:
            if candidate in selected:
                continue

            outfit = candidate["outfit"]
            footwear = outfit.get("footwear")
            footwear_key = _item_key(footwear)
            if enforce_unique_footwear and footwear_key is not None and footwear_key in seen_footwear:
                continue

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
            if enforce_unique_footwear and footwear_key is not None:
                seen_footwear.add(footwear_key)

            if len(selected) == top_k:
                return

    add_non_overlapping()

    for candidate in scored:
        if len(selected) == top_k:
            break
        if candidate in selected:
            continue

        outfit = candidate["outfit"]
        footwear = outfit.get("footwear")
        footwear_key = _item_key(footwear)
        if enforce_unique_footwear and footwear_key is not None and footwear_key in seen_footwear:
            continue

        core_keys = _core_item_keys(outfit)
        core_outfit_key = frozenset(core_keys)
        if not core_keys or core_outfit_key in selected_core_outfits:
            continue

        selected.append(candidate)
        selected_core_outfits.add(core_outfit_key)
        if enforce_unique_footwear and footwear_key is not None:
            seen_footwear.add(footwear_key)

    return selected