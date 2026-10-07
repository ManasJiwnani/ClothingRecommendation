import unittest

from services.outfit_ranker import select_diverse_outfits


class SelectDiverseOutfitsTests(unittest.TestCase):
    def test_selects_different_bottom_items_before_repeating_a_bottom(self):
        recommendations = [
            {"outfit": {"bottom": {"id": "skirt-1"}}, "score": 10},
            {"outfit": {"bottom": {"id": "skirt-1"}, "footwear": {"id": "shoe-1"}}, "score": 9},
            {"outfit": {"bottom": {"id": "jeans-1"}}, "score": 8},
        ]

        selected = select_diverse_outfits(recommendations, limit=2)

        self.assertEqual(
            [entry["outfit"]["bottom"]["id"] for entry in selected],
            ["skirt-1", "jeans-1"],
        )

    def test_includes_denim_before_more_items_from_same_bottom_family(self):
        recommendations = [
            {
                "outfit": {
                    "bottom": {
                        "id": "skirt-1",
                        "category": "bottom",
                        "subcategory": "Mini skirt",
                    }
                },
                "score": 10,
            },
            {
                "outfit": {
                    "bottom": {
                        "id": "skirt-2",
                        "category": "bottom",
                        "subcategory": "Midi skirt",
                    }
                },
                "score": 9,
            },
            {
                "outfit": {
                    "bottom": {
                        "id": "jeans-1",
                        "category": "bottom",
                        "subcategory": "Straight jeans",
                    }
                },
                "score": 8,
            },
        ]

        selected = select_diverse_outfits(recommendations, limit=2)

        self.assertEqual(
            [entry["outfit"]["bottom"]["id"] for entry in selected],
            ["skirt-1", "jeans-1"],
        )

    def test_fills_remaining_slots_when_only_one_bottom_is_available(self):
        recommendations = [
            {"outfit": {"bottom": {"id": "skirt-1"}}, "score": 10},
            {"outfit": {"bottom": {"id": "skirt-1"}, "footwear": {"id": "shoe-1"}}, "score": 9},
        ]

        selected = select_diverse_outfits(recommendations, limit=2)

        self.assertEqual(selected, recommendations)

    def test_non_positive_limit_returns_no_outfits(self):
        self.assertEqual(
            select_diverse_outfits([{"outfit": {}}], limit=0),
            [],
        )


if __name__ == "__main__":
    unittest.main()
