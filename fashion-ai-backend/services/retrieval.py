from services.supabase_service import search_similar_clothes_by_category
from services.recommendation_service import filter_clothes


def retrieve_clothes(
    user_id,
    query_embedding,
    intent,
    limit=5
):
    # Convert Pydantic Intent → dictionary
    if hasattr(intent, "model_dump"):
        intent = intent.model_dump()

    all_clothes = []

    categories = [
        "top",
        "bottom",
        "dress",
        "footwear"
    ]

    for category in categories:

        items = search_similar_clothes_by_category(
            user_id=user_id,
            query_embedding=query_embedding,
            category=category,
            limit=limit
        )

        all_clothes.extend(items)

    print("\n===== BEFORE FILTERING =====")
    print("Total clothes:", len(all_clothes))

    for item in all_clothes:
        print(
            item.get("category"),
            "|",
            item.get("subcategory"),
            "|",
            item.get("color"),
            "|",
            item.get("style"),
            "| similarity:",
            item.get("similarity")
        )

    filtered_clothes = filter_clothes(
        all_clothes,
        intent
    )

    print("\n===== AFTER FILTERING =====")
    print("Total clothes:", len(filtered_clothes))

    for item in filtered_clothes:
        print(
            item.get("category"),
            "|",
            item.get("subcategory"),
            "|",
            item.get("color"),
            "|",
            item.get("style"),
            "| similarity:",
            item.get("similarity")
        )

    return filtered_clothes