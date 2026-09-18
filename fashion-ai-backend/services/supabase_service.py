from supabase import create_client
from config import settings


_supabase = None


def get_supabase_client():
    global _supabase

    if _supabase is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_KEY must be configured in the environment or a .env file."
            )

        _supabase = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )

    return _supabase


def add_clothing(clothing_data: dict):

    response = (
        get_supabase_client()
        .table("clothes")
        .insert(clothing_data)
        .execute()
    )

    return response.data


def get_user_clothes(user_id: str):

    response = (
        get_supabase_client()
        .table("clothes")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )

    return response.data


def get_clothing_by_id(clothing_id: str):

    response = (
        get_supabase_client()
        .table("clothes")
        .select("*")
        .eq("id", clothing_id)
        .single()
        .execute()
    )

    return response.data


def search_similar_clothes(
    user_id: str,
    query_embedding: list[float],
    limit: int = 5
):

    response = get_supabase_client().rpc(
        "match_clothes",
        {
            "query_embedding": query_embedding,
            "match_user_id": user_id,
            "match_count": limit
        }
    ).execute()

    return response.data

def search_similar_clothes_by_category(
    user_id: str,
    query_embedding: list[float],
    category: str,
    limit: int = 5
):
    response = get_supabase_client().rpc(
        "match_clothes_by_category",
        {
            "query_embedding": query_embedding,
            "match_user_id": user_id,
            "match_category": category,
            "match_count": limit
        }
    ).execute()

    return response.data

def prepare_clothing_data(
    user_id: str,
    image_url: str,
    attributes: dict,
    embedding: list[float]
):

    return {
        "user_id": user_id,
        "image_url": image_url,

        "category": attributes.get("category"),
        "subcategory": attributes.get("subcategory"),
        "color": attributes.get("color"),
        "secondary_color": attributes.get("secondary_color"),
        "pattern": attributes.get("pattern"),
        "material": attributes.get("material"),
        "sleeve_type": attributes.get("sleeve_type"),
        "fit": attributes.get("fit"),
        "style": attributes.get("style"),
        "formality": attributes.get("formality"),
        "season": attributes.get("season"),
        "occasions": attributes.get("occasions"),
        "embedding": embedding
    }