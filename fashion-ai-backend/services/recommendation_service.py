def filter_clothes(clothes, intent):

    if hasattr(intent, "model_dump"):
        intent = intent.model_dump()

    scored = []

    for item in clothes:

        # -------------------------
        # EXCLUDED ITEMS
        # -------------------------

        excluded_items = intent.get("excluded_items") or []

        item_id = str(item.get("id", "")).lower()
        subcategory = str(item.get("subcategory", "")).lower()
        category = str(item.get("category", "")).lower()
        color = str(item.get("color", "")).lower()

        excluded = False

        for excluded_item in excluded_items:

            excluded_item = str(excluded_item).lower().strip()

            if (
                excluded_item == item_id
                or excluded_item in subcategory
                or excluded_item in category
                or excluded_item in color
            ):
                excluded = True
                break

        if excluded:
            continue

        score = 0

        # -------------------------
        # OCCASION
        # -------------------------

        requested_occasion = intent.get("occasion")

        if requested_occasion:

            occasions = item.get("occasions") or []

            if requested_occasion.lower() in [
                str(x).lower() for x in occasions
            ]:
                score += 30

        # -------------------------
        # STYLE
        # -------------------------

        requested_style = intent.get("style")
        item_style = item.get("style")

        if requested_style and item_style:

            if requested_style.lower() == item_style.lower():
                score += 20

        # -------------------------
        # FORMALITY
        # -------------------------

        requested_formality = intent.get("formality")
        item_formality = item.get("formality")

        if (
            requested_formality is not None
            and item_formality is not None
        ):

            difference = abs(
                item_formality - requested_formality
            )

            score += max(
                0,
                20 - difference * 10
            )

        # -------------------------
        # VECTOR SIMILARITY
        # -------------------------

        similarity = item.get("similarity", 0)

        score += similarity * 30

        scored.append({
            "item": item,
            "score": score
        })

    # Highest score first
    scored.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return [
        result["item"]
        for result in scored
    ]