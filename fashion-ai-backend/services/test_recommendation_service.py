import unittest

from models.schemas import Intent
from services.deafult_recom import create_default_intent
from services.outfit_builder import build_outfits
from services.outfit_ranker import rank_outfits
from services.intent_matching import occasion_matches
from services.recommendation_service import filter_clothes


class RecommendationServiceTests(unittest.TestCase):
    def test_festive_occasion_matches_wedding_and_diwali_tags(self):
        self.assertTrue(occasion_matches("festive", ["wedding"]))
        self.assertTrue(occasion_matches("festive", ["Diwali celebration"]))
        self.assertFalse(occasion_matches("festive", ["office"]))

    def test_festive_preset_ranks_wedding_and_diwali_items_first(self):
        clothes = [
            {"id": "office-top", "category": "top", "occasions": ["office"]},
            {"id": "diwali-top", "category": "top", "occasions": ["diwali"]},
            {"id": "wedding-top", "category": "top", "occasions": ["wedding"]},
        ]

        filtered_clothes = filter_clothes(
            clothes,
            {"occasion": "festive"},
        )

        self.assertEqual(
            [item["id"] for item in filtered_clothes],
            ["diwali-top", "wedding-top", "office-top"],
        )

    def test_saree_constraint_only_builds_saree_outfit(self):
        clothes = [
            {
                "id": "silk-saree",
                "category": "dress",
                "subcategory": "saree",
                "occasions": ["wedding", "diwali"],
                "cultural_domain": "indian_ethnic",
            },
            {
                "id": "evening-gown",
                "category": "dress",
                "subcategory": "gown",
                "occasions": ["wedding"],
            },
        ]
        intent = Intent.model_validate(
            {
                "occasion": "festive",
                "category_preference": ["saree"],
                "item_constraints": [
                    {"category": "dress", "garment": "saree"},
                ],
                "cultural_aesthetic": "Indian Ethnic",
                "is_strictly_traditional": True,
            }
        )

        filtered_clothes = filter_clothes(clothes, intent)
        recommendations = rank_outfits(
            build_outfits(filtered_clothes),
            intent,
            top_k=5,
        )

        self.assertEqual([item["id"] for item in filtered_clothes], ["silk-saree"])
        self.assertEqual(len(recommendations), 1)
        self.assertEqual(
            recommendations[0]["outfit"]["dress"]["id"],
            "silk-saree",
        )

    def test_male_festive_intent_builds_kurta_and_pants_outfit(self):
        intent = create_default_intent(
            "festive",
            {"temperature": 25},
            "male",
        )
        clothes = [
            {
                "id": "festive-kurta",
                "category": "top",
                "subcategory": "kurta",
                "occasions": ["wedding"],
                "cultural_domain": "indian_ethnic",
            },
            {
                "id": "festive-pants",
                "category": "bottom",
                "subcategory": "pants",
                "occasions": ["festive"],
                "cultural_domain": "indian_ethnic",
            },
            {
                "id": "saree",
                "category": "dress",
                "subcategory": "saree",
                "occasions": ["wedding"],
            },
        ]

        filtered_clothes = filter_clothes(clothes, intent)
        recommendations = rank_outfits(
            build_outfits(filtered_clothes),
            intent,
            top_k=5,
        )

        self.assertEqual(
            {item["id"] for item in filtered_clothes},
            {"festive-kurta", "festive-pants"},
        )
        self.assertEqual(len(recommendations), 1)
        self.assertEqual(
            recommendations[0]["outfit"]["top"]["subcategory"],
            "kurta",
        )
        self.assertEqual(
            recommendations[0]["outfit"]["bottom"]["subcategory"],
            "pants",
        )

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

    def test_intent_schema_preserves_traditional_constraints(self):
        intent = Intent.model_validate(
            {
                "occasion": "Navratri",
                "category_preference": ["lehenga", "choli"],
                "cultural_aesthetic": "Indian Ethnic",
                "is_strictly_traditional": True,
            }
        )

        self.assertEqual(
            intent.model_dump()["category_preference"],
            ["lehenga", "choli"],
        )
        self.assertEqual(
            intent.model_dump()["cultural_aesthetic"],
            "Indian Ethnic",
        )
        self.assertTrue(intent.model_dump()["is_strictly_traditional"])

    def test_intent_schema_preserves_per_garment_color_and_type_constraints(self):
        intent = Intent.model_validate(
            {
                "category_preference": ["tops", "jeans"],
                "color_preference": ["red"],
                "item_constraints": [
                    {"category": "top", "color": "red"},
                    {"category": "bottom", "garment": "jeans"},
                ],
            }
        )

        self.assertEqual(
            [
                (item.category, item.color, item.garment)
                for item in intent.item_constraints
            ],
            [("top", "red", None), ("bottom", None, "jeans")],
        )

    def test_red_top_and_jeans_constraints_exclude_wrong_color_and_skirt(self):
        clothes = [
            {
                "id": "red-top",
                "category": "top",
                "subcategory": "t-shirt",
                "color": "red",
            },
            {
                "id": "black-top",
                "category": "top",
                "subcategory": "tube top",
                "color": "black",
            },
            {
                "id": "blue-jeans",
                "category": "bottom",
                "subcategory": "jeans",
                "color": "blue",
            },
            {
                "id": "denim-skirt",
                "category": "bottom",
                "subcategory": "denim skirt",
                "color": "light blue",
            },
            {
                "id": "sandals",
                "category": "footwear",
                "subcategory": "sandals",
            },
        ]
        intent = {
            "color_preference": ["red"],
            "category_preference": ["tops", "jeans"],
            "item_constraints": [
                {"category": "top", "color": "red"},
                {"category": "bottom", "garment": "jeans"},
            ],
        }

        typed_intent = Intent.model_validate(intent)
        filtered_clothes = filter_clothes(clothes, typed_intent)
        recommendations = rank_outfits(
            build_outfits(filtered_clothes),
            typed_intent,
            top_k=5,
        )

        self.assertEqual(
            {item["id"] for item in filtered_clothes},
            {"red-top", "blue-jeans", "sandals"},
        )
        self.assertEqual(len(recommendations), 1)
        outfit = recommendations[0]["outfit"]
        self.assertEqual(outfit["top"]["id"], "red-top")
        self.assertEqual(outfit["bottom"]["id"], "blue-jeans")

    def test_legacy_intent_derives_constraints_from_categories_and_color(self):
        clothes = [
            {"id": "red-top", "category": "top", "color": "red"},
            {"id": "black-top", "category": "top", "color": "black"},
            {"id": "jeans", "category": "bottom", "subcategory": "jeans"},
            {"id": "denim-skirt", "category": "bottom", "subcategory": "denim skirt"},
        ]

        filtered_clothes = filter_clothes(
            clothes,
            {
                "category_preference": ["tops", "jeans"],
                "color_preference": ["red"],
            },
        )

        self.assertEqual(
            {item["id"] for item in filtered_clothes},
            {"red-top", "jeans"},
        )

    def test_jeans_category_constraint_does_not_match_a_denim_skirt(self):
        clothes = [
            {
                "id": "jeans",
                "category": "bottom",
                "subcategory": "jeans",
            },
            {
                "id": "denim-skirt",
                "category": "bottom",
                "subcategory": "denim skirt",
            },
        ]

        filtered_clothes = filter_clothes(
            clothes,
            {
                "item_constraints": [
                    {"category": "jeans"},
                ]
            },
        )

        self.assertEqual(
            {item["id"] for item in filtered_clothes},
            {"jeans"},
        )

    def test_navratri_occasion_excludes_western_garments(self):
        clothes = [
            {
                "id": "choli",
                "category": "top",
                "subcategory": "choli",
                "occasions": ["festive"],
            },
            {
                "id": "lehenga",
                "category": "bottom",
                "subcategory": "lehenga skirt",
            },
            {
                "id": "western-dress",
                "category": "dress",
                "subcategory": "mini dress",
                "cultural_domain": "western",
            },
            {
                "id": "western-jeans",
                "category": "bottom",
                "subcategory": "jeans",
            },
            {
                "id": "sandals",
                "category": "footwear",
                "subcategory": "sandals",
            },
        ]

        filtered_clothes = filter_clothes(
            clothes,
            {"occasion": "Navratri"},
        )

        self.assertEqual(
            {item["id"] for item in filtered_clothes},
            {"choli", "lehenga", "sandals"},
        )

    def test_office_presentation_excludes_festive_outfit_even_when_formal(self):
        clothes = [
            {
                "id": "work-blouse",
                "category": "top",
                "subcategory": "blouse",
                "formality": 4,
                "occasions": ["office"],
            },
            {
                "id": "work-trousers",
                "category": "bottom",
                "subcategory": "trousers",
                "formality": 4,
                "occasions": ["office"],
            },
            {
                "id": "navratri-choli",
                "category": "top",
                "subcategory": "choli blouse",
                "formality": 4,
                "occasions": ["Navratri"],
            },
            {
                "id": "navratri-lehenga",
                "category": "bottom",
                "subcategory": "lehenga skirt",
                "formality": 4,
                "occasions": ["festive"],
            },
        ]
        intent = {
            "occasion": "Office presentation",
            "formality": 4,
        }

        filtered_clothes = filter_clothes(clothes, intent)
        recommendations = rank_outfits(
            build_outfits(filtered_clothes),
            intent,
            top_k=5,
        )

        self.assertEqual(
            {item["id"] for item in filtered_clothes},
            {"work-blouse", "work-trousers"},
        )
        self.assertEqual(len(recommendations), 1)
        outfit = recommendations[0]["outfit"]
        self.assertEqual(outfit["top"]["id"], "work-blouse")
        self.assertEqual(outfit["bottom"]["id"], "work-trousers")


if __name__ == "__main__":
    unittest.main()
