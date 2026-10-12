import os

from supabase import Client, create_client


_supabase: Client | None = None


def get_supabase_client() -> Client:
    global _supabase

    if _supabase is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
        if not url or not key:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY) "
                "must be configured in the environment or a .env file."
            )

        _supabase = create_client(url, key)

    return _supabase


def get_cached_tryon(user_id: str, outfit_hash: str) -> dict | None:
    response = (
        get_supabase_client()
        .table("tryon_cache")
        .select("image_url")
        .eq("user_id", user_id)
        .eq("outfit_hash", outfit_hash)
        .maybe_single()
        .execute()
    )
    return response.data


def save_cached_tryon(
    user_id: str,
    outfit_hash: str,
    image_url: str,
    clothing_urls: dict,
) -> dict:
    data = {
        "user_id": user_id,
        "outfit_hash": outfit_hash,
        "image_url": image_url,
        "clothing_urls": clothing_urls,
    }
    response = (
        get_supabase_client()
        .table("tryon_cache")
        .upsert(data, on_conflict="user_id,outfit_hash")
        .execute()
    )
    return response.data[0] if response.data else data

def get_user_preferences(user_id: str):
    response = (
        get_supabase_client()
        .table("user_preferences")
        .select("*")
        .eq("id", user_id)
        .single()
        .execute()
    )

    return response.data