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
    re.compile(r"\bcholis?\b"),
    re.compile(r"\blehengas?\b"),
    re.compile(r"\bghagras?\b"),
    re.compile(r"\bgarba\b"),
    re.compile(r"\bdandiya\b"),
    re.compile(r"\bnavratri\b"),
)

FESTIVE_OCCASION_TERMS = {
    "diwali",
    "dandiya",
    "festive",
    "garba",
    "navratri",
    "sangeet",
    "wedding",
}

PROFESSIONAL_ITEM_TERMS = {
    "business",
    "conference",
    "interview",
    "meeting",
    "office",
    "presentation",
    "work",
}

CONSTRAINT_CATEGORY_ALIASES = {
    "blouse": "top",
    "bottom": "bottom",
    "bottoms": "bottom",
    "choli": "top",
    "dress": "dress",
    "dresses": "dress",
    "ghagra": "bottom",
    "gown": "dress",
    "jean": "bottom",
    "jeans": "bottom",
    "lehenga": "bottom",
    "pant": "bottom",
    "pants": "bottom",
    "shirt": "top",
    "skirt": "bottom",
    "skirts": "bottom",
    "top": "top",
    "tops": "top",
    "t shirt": "top",
    "t shirts": "top",
    "trouser": "bottom",
    "trousers": "bottom",
}

SPECIFIC_GARMENT_CATEGORIES = {
    "blouse",
    "choli",
    "ghagra",
    "jean",
    "jeans",
    "lehenga",
    "pant",
    "pants",
    "shirt",
    "skirt",
    "skirts",
    "t shirt",
    "t shirts",
    "trouser",
    "trousers",
}

ITEM_PREFERENCE_CATEGORIES = (
    ("top", ("top", "tops", "choli", "blouse", "shirt", "tee")),
    ("bottom", ("jeans", "jean", "trousers", "trouser", "pants", "pant")),
    ("bottom", ("skirt", "skirts", "lehenga", "ghagra")),
    ("dress", ("dress", "dresses", "gown")),
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


def get_item_constraints(intent):
    constraints = intent.get("item_constraints") or []
    if constraints:
        return [
            constraint.model_dump()
            if hasattr(constraint, "model_dump")
            else constraint
            for constraint in constraints
        ]

    preferences = intent.get("category_preference") or []
    colors = intent.get("color_preference") or []
    color = str(colors[0]).strip() if colors else None
    derived = []
    color_assigned = False

    for category, terms in ITEM_PREFERENCE_CATEGORIES:
        preference = next(
            (
                str(value)
                for value in preferences
                if any(_contains_term(_normalize_occasion(value), term) for term in terms)
            ),
            None,
        )
        if preference is None:
            continue

        garment = None
        normalized_preference = _normalize_occasion(preference)
        if category == "bottom" and _contains_term(normalized_preference, "jeans"):
            garment = "jeans"

        derived.append(
            {
                "category": category,
                "color": color if category == "top" and not color_assigned else None,
                "garment": garment,
            }
        )
        if category == "top" and color:
            color_assigned = True

    return derived


def item_matches_constraint(item, constraint):
    requested_category = _normalize_occasion(constraint.get("category"))
    requested_garment = _normalize_occasion(
        constraint.get("garment")
        or (
            requested_category
            if requested_category in SPECIFIC_GARMENT_CATEGORIES
            else ""
        )
    )
    requested_color = _normalize_occasion(constraint.get("color"))
    item_category = _normalize_occasion(item.get("category"))
    item_description = _normalize_occasion(
        " ".join(
            str(item.get(key) or "")
            for key in ("subcategory", "name", "clothing_type", "style")
        )
    )

    expected_category = CONSTRAINT_CATEGORY_ALIASES.get(requested_category)
    if expected_category and item_category != expected_category:
        return False

    if requested_garment and not _contains_term(item_description, requested_garment):
        return False

    item_color = _normalize_occasion(item.get("color"))
    if requested_color and not _contains_term(item_color, requested_color):
        return False

    return bool(expected_category or requested_garment or requested_color)


def outfit_matches_item_constraints(outfit, constraints):
    if not constraints:
        return True

    outfit_items = {
        "top": outfit.get("top"),
        "bottom": outfit.get("bottom"),
        "dress": outfit.get("dress"),
    }

    for constraint in constraints:
        category = _normalize_occasion(constraint.get("category"))
        expected_category = CONSTRAINT_CATEGORY_ALIASES.get(category)
        if expected_category:
            candidates = [outfit_items.get(expected_category)]
        elif constraint.get("garment"):
            candidates = [
                outfit.get("top"),
                outfit.get("bottom"),
                outfit.get("dress"),
            ]
        else:
            candidates = [
                outfit.get("top"),
                outfit.get("bottom"),
                outfit.get("dress"),
            ]

        if not any(
            item and item_matches_constraint(item, constraint)
            for item in candidates
        ):
            return False

    return True


def is_professional_occasion(occasion):
    normalized = _normalize_occasion(occasion)
    return bool(
        PROFESSIONAL_OCCASION_TERMS.intersection(normalized.split())
    )


def is_professional_item_appropriate(item):
    formality = item.get("formality")
    if formality is not None and formality < 3:
        return False

    description = " ".join(
        str(item.get(key) or "")
        for key in (
            "category",
            "subcategory",
            "style",
            "cultural_domain",
            "cultural_aesthetic",
        )
    ).casefold()
    if any(pattern.search(description) for pattern in PROFESSIONAL_GARMENT_EXCLUSIONS):
        return False

    occasions = {
        token
        for occasion in item.get("occasions") or []
        for token in _normalize_occasion(occasion).split()
    }
    if (
        occasions.intersection(FESTIVE_OCCASION_TERMS)
        and not occasions.intersection(PROFESSIONAL_ITEM_TERMS)
    ):
        return False

    return True


def is_professional_outfit_appropriate(outfit):
    if outfit.get("type") == "dress":
        core_items = [outfit.get("dress")]
    else:
        core_items = [outfit.get("top"), outfit.get("bottom")]
    core_items = [item for item in core_items if item]

    return all(is_professional_item_appropriate(item) for item in core_items)


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


def _contains_term(text, term):
    return f" {term} " in f" {text} "
