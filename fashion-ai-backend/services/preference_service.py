from supabase import create_client
import os

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_ANON_KEY")
)


def get_user_preferences(user_id: str):
    response = (
        supabase
        .table("user_preferences")
        .select("*")
        .eq("id", user_id)
        .single()
        .execute()
    )

    return response.data