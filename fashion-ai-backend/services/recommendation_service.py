from services.intent_matching import (
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

        if item_constraints and not any(
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
            if item_aesthetic and item_aesthetic not in traditional_domains:
                continue

            garment_description = " ".join((subcategory, name, style)).casefold()
            has_traditional_garment_term = any(
                term in garment_description
                for term in traditional_garment_terms
            )
            has_festival_occasion = any(
                festival in tagged_occasion
                for tagged_occasion in item_occasions
                for festival in ("navratri", "garba", "dandiya")
            )
            if not (
                item_aesthetic in traditional_domains
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

            # If user wants a lehenga skirt, don't pick non-lehenga bottoms (like mermaid or pencil skirts)
            if wants_lehenga and category in ["bottom", "skirt"]:
                if "lehenga" not in subcategory and "lehenga" not in name and "ghagra" not in name:
                    continue

            # If user wants a choli, prioritize choli tops over basic generic blouses/tees
            if wants_choli and category in ["top"]:
                if "choli" not in subcategory and "choli" not in name:
                    # Allow blouses only if no direct choli indicator, or dock points
                    pass

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