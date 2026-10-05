import unittest
from unittest.mock import patch

from services import supabase_service


class FakeResponse:
    def __init__(self, data):
        self.data = data


class FakeQuery:
    def __init__(self, response):
        self.response = response
        self.operations = []

    def insert(self, data):
        self.operations.append(("insert", data))
        return self

    def select(self, columns):
        self.operations.append(("select", columns))
        return self

    def eq(self, column, value):
        self.operations.append(("eq", column, value))
        return self

    def order(self, column, desc=False):
        self.operations.append(("order", column, desc))
        return self

    def execute(self):
        return self.response


class FakeSupabase:
    def __init__(self, response):
        self.response = response
        self.table_name = None
        self.query = FakeQuery(response)

    def table(self, name):
        self.table_name = name
        return self.query


class SavedOutfitsTests(unittest.TestCase):
    def test_like_outfit_inserts_into_saved_outfits(self):
        expected = {"id": "saved-id", "user_id": "user-id", "outfit": {}}
        supabase = FakeSupabase(FakeResponse([expected]))

        with patch.object(
            supabase_service,
            "get_supabase_client",
            return_value=supabase,
        ):
            result = supabase_service.like_outfit("user-id", {})

        self.assertEqual(supabase.table_name, "saved_outfits")
        self.assertEqual(result, expected)

    def test_get_liked_outfits_queries_saved_outfits_for_user(self):
        expected = [{"id": "saved-id", "user_id": "user-id", "outfit": {}}]
        supabase = FakeSupabase(FakeResponse(expected))

        with patch.object(
            supabase_service,
            "get_supabase_client",
            return_value=supabase,
        ):
            result = supabase_service.get_liked_outfits("user-id")

        self.assertEqual(supabase.table_name, "saved_outfits")
        self.assertEqual(result, expected)
        self.assertIn(("eq", "user_id", "user-id"), supabase.query.operations)
