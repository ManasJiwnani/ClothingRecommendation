import unittest

from services.outfit_builder import build_outfits
from services.recommendation_service import filter_clothes


class RecommendationServiceTests(unittest.TestCase):
    def test_dress_request_keeps_both_outfit_types_eligible(self):
        clothes = [
            {"id": "dress-1", "category": "dress"},
            {"id": "top-1", "category": "top"},
            {"id": "bottom-1", "category": "bottom"},
            {"id": "shoes-1", "category": "footwear"},
        ]

        filtered_clothes = filter_clothes(
            clothes,
            {"outfit_type": "dress"},
        )
        outfits = build_outfits(filtered_clothes)

        self.assertEqual(
            {item["category"] for item in filtered_clothes},
            {"dress", "top", "bottom", "footwear"},
        )
        self.assertEqual(
            {outfit["type"] for outfit in outfits},
            {"dress", "separates"},
        )

    def test_unspecified_outfit_type_preserves_existing_separates(self):
        clothes = [
            {"id": "top-1", "category": "top"},
            {"id": "bottom-1", "category": "bottom"},
        ]

        filtered_clothes = filter_clothes(clothes, {})

        self.assertEqual(len(filtered_clothes), 2)
        self.assertEqual(
            {item["category"] for item in filtered_clothes},
            {"top", "bottom"},
        )

    def test_dinner_date_matches_dinner_tag_when_ranking_clothes(self):
        clothes = [
            {
                "id": "office-dress",
                "category": "dress",
                "occasions": ["office"],
            },
            {
                "id": "dinner-dress",
                "category": "dress",
                "occasions": ["dinner"],
            },
        ]

        filtered_clothes = filter_clothes(
            clothes,
            {
                "occasion": "dinner date",
                "outfit_type": "dress",
            },
        )

        self.assertEqual(filtered_clothes[0]["id"], "dinner-dress")


if __name__ == "__main__":
    unittest.main()
