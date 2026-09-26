import unittest

from services.outfit_scorer import score_outfit


class OutfitScorerTests(unittest.TestCase):
    def test_score_outfit_with_weather_sensitive_intent(self):
        outfit = {
            "type": "separates",
            "top": {
                "category": "top",
                "subcategory": "t-shirt",
                "style": "casual",
                "formality": 2,
                "occasions": ["casual"],
                "color": "white",
                "material": "cotton",
            },
            "bottom": {
                "category": "bottom",
                "subcategory": "jeans",
                "style": "casual",
                "formality": 2,
                "occasions": ["casual"],
                "color": "blue",
                "material": "denim",
            },
            "footwear": {
                "category": "footwear",
                "subcategory": "sneakers",
                "style": "casual",
                "formality": 2,
                "occasions": ["casual"],
                "color": "white",
                "material": "cotton",
            },
        }
        intent = {
            "occasion": "casual",
            "style": "casual",
            "formality": 2,
            "weather_sensitive": True,
        }
        weather = {"temperature": 32, "rain": 0}

        result = score_outfit(outfit, intent, weather)

        self.assertIsInstance(result, float)
        self.assertGreaterEqual(result, 0)
