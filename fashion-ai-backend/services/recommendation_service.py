# # It filters the clothes from the database based on the intent of the user query. 
# # It takes in a list of clothes and an intent dictionary and returns a list of clothes that match the intent.

# def filter_clothes(clothes, intent):

#     filtered = []

#     for item in clothes:

#         # Occasion
#         if intent.get("occasion"):

#             occasions = item.get("occasions") or []

#             if intent["occasion"] not in occasions:
#                 continue

#         # Style
#         if intent.get("style"):

#             item_style = item.get("style")

#             if item_style and item_style != intent["style"]:
#                 continue

#         # -------------------------
#         # Formality
#         # -------------------------
#         if intent.get("formality") is not None:

#             item_formality = item.get("formality")

#             if item_formality is not None:

#                 difference = abs(
#                     item_formality - intent["formality"]
#                 )

#                 # Allow a difference of 1
#                 if difference > 1:
#                     continue

#         filtered.append(item)

#     return filtered


def filter_clothes(clothes, intent):

    scored = []

    requested_category = intent.get("category")
    requested_subcategory = intent.get("subcategory")

    for item in clothes:

        # Excluded items
        excluded_items = intent.get("excluded_items") or []

        if str(item.get("id")) in excluded_items:
            continue

        score = 0

        # Category match
        if requested_category:
            if item.get("category") == requested_category:
                score += 30

        # Subcategory match
        if requested_subcategory:
            if item.get("subcategory") == requested_subcategory:
                score += 40

        # Occasion
        if intent.get("occasion"):
            occasions = item.get("occasions") or []

            if intent["occasion"] in occasions:
                score += 30

        # Style
        if intent.get("style"):
            if item.get("style") == intent["style"]:
                score += 20

        # Formality
        if intent.get("formality") is not None:

            item_formality = item.get("formality")

            if item_formality is not None:

                difference = abs(
                    item_formality - intent["formality"]
                )

                score += max(
                    0,
                    20 - difference * 10
                )

        # Semantic similarity
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