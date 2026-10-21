import unittest

from services.outfit_builder import build_outfits
from services.outfit_ranker import rank_outfits


class OutfitRankerTests(unittest.TestCase):
    def test_fills_recommendations_with_distinct_garment_combinations(self):
        clothes = [
            {"id": "top-1", "category": "top"},
            {"id": "top-2", "category": "top"},
            {"id": "bottom-1", "category": "bottom"},
            {"id": "bottom-2", "category": "bottom"},
            {"id": "shoes-1", "category": "footwear"},
        ]

        recommendations = rank_outfits(
            build_outfits(clothes),
            {},
            top_k=5,
        )

        self.assertEqual(len(recommendations), 4)

        core_outfits = []
        for recommendation in recommendations:
            outfit = recommendation["outfit"]
            core_outfits.append(
                (outfit["top"]["id"], outfit["bottom"]["id"])
            )

        self.assertEqual(len(core_outfits), len(set(core_outfits)))

    def test_returns_all_available_recommendations_when_fewer_than_requested(self):
        clothes = [
            {"id": "dress-1", "category": "dress"},
            {"id": "shoes-1", "category": "footwear"},
            {"id": "shoes-2", "category": "footwear"},
        ]

        recommendations = rank_outfits(
            build_outfits(clothes),
            {},
            top_k=5,
        )

        self.assertEqual(len(recommendations), 1)
        self.assertEqual(recommendations[0]["outfit"]["dress"]["id"], "dress-1")

    def test_ranker_prefers_unique_footwear_when_possible(self):
        clothes = [
            {"id": "top-1", "category": "top"},
            {"id": "top-2", "category": "top"},
            {"id": "bottom-1", "category": "bottom"},
            {"id": "bottom-2", "category": "bottom"},
            {"id": "shoes-1", "category": "footwear"},
            {"id": "shoes-2", "category": "footwear"},
        ]

        recommendations = rank_outfits(
            build_outfits(clothes),
            {},
            top_k=2,
        )

        self.assertEqual(len(recommendations), 2)
        self.assertEqual(
            {
                recommendation["outfit"]["footwear"]["id"]
                for recommendation in recommendations
            },
            {"shoes-1", "shoes-2"},
        )

    def test_relevance_score_orders_items_by_query_embedding_similarity(self):
        clothes = [
            {
                "id": "less-relevant",
                "category": "dress",
                "similarity": 0.2,
            },
            {
                "id": "most-relevant",
                "category": "dress",
                "similarity": 0.9,
            },
        ]

        recommendations = rank_outfits(
            build_outfits(clothes),
            {},
            top_k=2,
        )

        self.assertEqual(
            recommendations[0]["outfit"]["dress"]["id"],
            "most-relevant",
        )

    def test_professional_ranking_rejects_festive_items_with_matching_formality(self):
        outfits = [
            {
                "type": "separates",
                "top": {
                    "id": "formal-choli",
                    "category": "top",
                    "subcategory": "choli blouse",
                    "formality": 4,
                    "occasions": ["Navratri"],
                },
                "bottom": {
                    "id": "formal-lehenga",
                    "category": "bottom",
                    "subcategory": "lehenga skirt",
                    "formality": 4,
                    "occasions": ["festive"],
                },
            },
            {
                "type": "separates",
                "top": {
                    "id": "office-top",
                    "category": "top",
                    "subcategory": "blouse",
                    "formality": 4,
                    "occasions": ["office"],
                },
                "bottom": {
                    "id": "office-bottom",
                    "category": "bottom",
                    "subcategory": "trousers",
                    "formality": 4,
                    "occasions": ["office"],
                },
            },
        ]

        recommendations = rank_outfits(
            outfits,
            {"occasion": "office presentation", "formality": 4},
            top_k=5,
        )

        self.assertEqual(len(recommendations), 1)
        self.assertEqual(
            recommendations[0]["outfit"]["top"]["id"],
            "office-top",
        )

    def test_ranking_rejects_outfits_that_violate_explicit_item_constraints(self):
        outfits = [
            {
                "type": "separates",
                "top": {
                    "id": "black-top",
                    "category": "top",
                    "color": "black",
                },
                "bottom": {
                    "id": "jeans",
                    "category": "bottom",
                    "subcategory": "jeans",
                },
            },
            {
                "type": "separates",
                "top": {
                    "id": "red-top",
                    "category": "top",
                    "color": "red",
                },
                "bottom": {
                    "id": "denim-skirt",
                    "category": "bottom",
                    "subcategory": "denim skirt",
                },
            },
        ]
        intent = {
            "item_constraints": [
                {"category": "top", "color": "red"},
                {"category": "bottom", "garment": "jeans"},
            ]
        }

        recommendations = rank_outfits(outfits, intent, top_k=5)

        self.assertEqual(recommendations, [])


if __name__ == "__main__":
    unittest.main()
