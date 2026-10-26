from services.intent_matching import (
    CONSTRAINT_CATEGORY_ALIASES,
    is_professional_item_appropriate,
    is_professional_occasion,
    get_item_constraints,
    item_matches_constraint,
    occasion_matches,
)


def filter_clothes(clothes, intent):
    if hasattr(intent, "model_dump"):
        intent = intent.model_dump()

    scored = []

    # ----------------------------------------------------
    # EXTRACT INTENT CONSTRAINTS
    # ----------------------------------------------------
    excluded_items = [str(x).lower().strip() for x in (intent.get("excluded_items") or [])]
    requested_aesthetic = str(intent.get("cultural_aesthetic") or "").casefold()
    explicitly_nontraditional = requested_aesthetic in {
        "western",
        "indo-western",
        "fusion",
    }
    occasion = str(intent.get("occasion") or "").casefold()
    is_festival_query = any(
        festival in occasion
        for festival in ("navratri", "garba", "dandiya")
    )
    is_strictly_traditional = (
        not explicitly_nontraditional
        and (
            intent.get("is_strictly_traditional", False)
            or "ethnic" in requested_aesthetic
            or "traditional" in requested_aesthetic
            or is_festival_query
        )
    )
    category_preference = [str(c).lower() for c in (intent.get("category_preference") or [])]
    item_constraints = [
        constraint
        for constraint in get_item_constraints(intent)
        if constraint
    ]
    professional_occasion = is_professional_occasion(occasion)

    traditional_domains = {"indian_ethnic", "ethnic", "traditional"}
    traditional_garment_terms = {
        "anarkali",
        "choli",
        "dandiya",
        "dhoti",
        "garba",
        "ghagra",
        "indian",
        "kurta",
        "lehenga",
        "salwar",
        "saree",
        "sari",
        "traditional",
    }

    for item in clothes:
        category = str(item.get("category", "")).lower()
        
        item_id = str(item.get("id", "")).lower()
        subcategory = str(item.get("subcategory", "")).lower()
        name = str(item.get("name", "")).lower()
        color = str(item.get("color", "")).lower()
        style = str(item.get("style", "")).casefold()
        item_aesthetic = str(
            item.get("cultural_domain")
            or item.get("cultural_aesthetic")
            or ""
        ).casefold().replace(" ", "_")
        item_occasions = [
            str(value).casefold()
            for value in (item.get("occasions") or [])
        ]

        if professional_occasion and not is_professional_item_appropriate(item):
            continue

        if item.get("category") in {"top", "bottom", "dress"} and item_constraints and not any(
            item_matches_constraint(item, constraint)
            for constraint in item_constraints
        ):
            continue

        # -------------------------
        # 1. EXCLUDED ITEMS
        # -------------------------
        searchable_item = " ".join(
            (
                item_id,
                subcategory,
                category,
                color,
                name,
                style,
                item_aesthetic,
            )
        )
        if any(
            excluded
            and (excluded == item_id or excluded in searchable_item)
            for excluded in excluded_items
        ):
            continue

        # -------------------------
        # 2. STRICT TRADITIONAL / ETHNIC FILTER
        # -------------------------
        if is_strictly_traditional:
            item_descriptor = " ".join(
                (
                    category,
                    subcategory,
                    name,
                    style,
                    item_aesthetic,
                    " ".join(item_occasions),
                )
            ).casefold()

            if category in {"footwear", "accessory", "outerwear"}:
                pass
            else:
                if item_aesthetic and item_aesthetic not in traditional_domains:
                    if not any(
                        term in item_descriptor
                        for term in traditional_garment_terms
                    ):
                        continue

                garment_description = " ".join((subcategory, name, style)).casefold()
                has_traditional_garment_term = any(
                    term in garment_description
                    for term in traditional_garment_terms
                )
                has_festival_occasion = any(
                    festival in tagged_occasion
                    for tagged_occasion in item_occasions
                    for festival in ("navratri", "garba", "dandiya", "diwali", "festive", "wedding")
                )
                has_traditional_aesthetic = item_aesthetic in traditional_domains
                if not (
                    has_traditional_aesthetic
                    or has_traditional_garment_term
                    or has_festival_occasion
                ):
                    continue

        # -------------------------
        # 3. GARMENT TYPE HARD-CHECK (lehenga, choli, etc.)
        # -------------------------
        if category_preference:
            wants_lehenga = any("lehenga" in cp or "ghagra" in cp for cp in category_preference)
            wants_choli = any("choli" in cp for cp in category_preference)
            wants_kurta = any("kurta" in cp for cp in category_preference)
            wants_saree = any("saree" in cp or "sari" in cp for cp in category_preference)
            wants_anarkali = any("anarkali" in cp for cp in category_preference)

            if wants_lehenga and category in ["bottom", "skirt"]:
                if "lehenga" not in subcategory and "lehenga" not in name and "ghagra" not in name:
                    continue

            if wants_choli and category == "top":
                if "choli" not in subcategory and "choli" not in name and "blouse" not in subcategory:
                    continue

            if wants_kurta and category == "top":
                if "kurta" not in subcategory and "kurta" not in name and "anarkali" not in subcategory and "anarkali" not in name:
                    continue

            if wants_saree and category == "dress":
                if "saree" not in subcategory and "saree" not in name and "sari" not in subcategory and "sari" not in name:
                    continue

            if wants_anarkali and category == "dress":
                if "anarkali" not in subcategory and "anarkali" not in name:
                    continue

        if item_constraints:
            for constraint in item_constraints:
                if not constraint:
                    continue
                expected_category = CONSTRAINT_CATEGORY_ALIASES.get(str(constraint.get("category") or "").casefold())
                if expected_category and category != expected_category:
                    continue
                requested_garment = str(constraint.get("garment") or "").casefold()
                if requested_garment and requested_garment not in " ".join((subcategory, name)):
                    continue
                requested_color = str(constraint.get("color") or "").casefold()
                if requested_color and requested_color not in color:
                    continue

        score = 0

        # -------------------------
        # 4. OCCASION (Substring matching)
        # -------------------------
        requested_occasion = intent.get("occasion")
        if requested_occasion:
            if occasion_matches(requested_occasion, item_occasions):
                score += 35

        # -------------------------
        # 5. GARMENT BONUS
        # -------------------------
        for pref in category_preference:
            if pref in subcategory or pref in name:
                score += 40

        # -------------------------
        # 6. STYLE
        # -------------------------
        requested_style = intent.get("style")
        item_style = item.get("style")
        if requested_style and item_style:
            if requested_style.lower() in item_style.lower() or item_style.lower() in requested_style.lower():
                score += 20

        # -------------------------
        # 7. FORMALITY
        # -------------------------
        requested_formality = intent.get("formality")
        item_formality = item.get("formality")
        if requested_formality is not None and item_formality is not None:
            diff = abs(item_formality - requested_formality)
            score += max(0, 20 - diff * 10)

        # -------------------------
        # 8. VECTOR SIMILARITY
        # -------------------------
        score += float(item.get("similarity", 0)) * 30

        scored.append({"item": item, "score": score})

    # Sort descending
    scored.sort(key=lambda x: x["score"], reverse=True)

    return [res["item"] for res in scored]