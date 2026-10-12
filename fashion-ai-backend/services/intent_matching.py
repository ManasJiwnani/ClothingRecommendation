import re


PROFESSIONAL_OCCASION_TERMS = {
    "business",
    "conference",
    "interview",
    "meeting",
    "office",
    "presentation",
    "work",
}

PROFESSIONAL_GARMENT_EXCLUSIONS = (
    re.compile(r"\bmini\s+skirts?\b"),
    re.compile(r"\bmicro\s+skirts?\b"),
    re.compile(r"\bone[\s-]+shoulder\b"),
    re.compile(r"\bcrop\s+tops?\b"),
    re.compile(r"\btube\s+tops?\b"),
    re.compile(r"\bhalter\s+tops?\b"),
    re.compile(r"\bbralettes?\b"),
    re.compile(r"\bcut[\s-]?outs?\b"),
)


def occasion_matches(requested_occasion, item_occasions):
    requested = _normalize_occasion(requested_occasion)
    if not requested:
        return False

    for item_occasion in item_occasions or []:
        candidate = _normalize_occasion(item_occasion)
        if not candidate:
            continue

        if (
            requested == candidate
            or re.search(rf"(?<!\w){re.escape(requested)}(?!\w)", candidate)
            or re.search(rf"(?<!\w){re.escape(candidate)}(?!\w)", requested)
        ):
            return True

    return False


def is_professional_occasion(occasion):
    normalized = _normalize_occasion(occasion)
    return bool(
        PROFESSIONAL_OCCASION_TERMS.intersection(normalized.split())
    )


def is_professional_outfit_appropriate(outfit):
    if outfit.get("type") == "dress":
        core_items = [outfit.get("dress")]
    else:
        core_items = [outfit.get("top"), outfit.get("bottom")]
    core_items = [item for item in core_items if item]

    for item in core_items:
        formality = item.get("formality")
        if formality is not None and formality < 3:
            return False

        description = " ".join(
            str(item.get(key) or "")
            for key in ("category", "subcategory", "style")
        ).casefold()
        if any(pattern.search(description) for pattern in PROFESSIONAL_GARMENT_EXCLUSIONS):
            return False

    return True


def outfit_matches_occasion(outfit, occasion):
    if not occasion:
        return True

    if outfit.get("type") == "dress":
        core_items = [outfit.get("dress")]
    else:
        core_items = [outfit.get("top"), outfit.get("bottom")]

    return any(
        item and occasion_matches(occasion, item.get("occasions"))
        for item in core_items
    )


def _normalize_occasion(value):
    if not value:
        return ""

    return re.sub(r"[^\w]+", " ", str(value).casefold()).strip()
