import asyncio
import ssl
import unittest
from unittest.mock import patch

import httpx

import main
from models.schemas import DailyRecommendationRequest


class DailyRecommendationTests(unittest.TestCase):
    def test_festive_preset_returns_festive_intent(self):
        request = DailyRecommendationRequest(
            user_id="user-id",
            preset="festive",
            latitude=12.97,
            longitude=77.59,
        )
        outfit = {
            "type": "separates",
            "top": {"category": "top"},
            "bottom": {"category": "bottom"},
        }
        ranked_outfit = {"outfit": outfit, "score": 10}
        captured_intents = []
        closet = [
            {
                "id": "silk-saree",
                "category": "dress",
                "subcategory": "saree",
                "season": ["winter"],
            },
            {
                "id": "summer-top",
                "category": "top",
                "season": ["summer"],
            },
        ]

        with (
            patch(
                "main.get_current_weather",
                return_value={"temperature": 35, "rain": 0},
            ),
            patch(
                "main.get_weather_context",
                return_value={
                    "temperature": 35,
                    "temperature_category": "hot",
                    "rain_category": "dry",
                    "overall": "hot",
                },
            ),
            patch(
                "main.get_user_clothes",
                return_value=closet,
            ),
            patch("main.get_user_preferences", return_value={"gender": "female"}),
            patch(
                "main.filter_clothes",
                side_effect=lambda clothes, intent: (
                    captured_intents.append((intent, clothes)) or clothes
                ),
            ),
            patch("main.build_outfits", return_value=[outfit]),
            patch("main.rank_outfits", return_value=[ranked_outfit]),
        ):
            response = asyncio.run(main.daily_recommendation(request))

        self.assertEqual(response["preset"], "festive")
        self.assertEqual(response["intent"]["occasion"], "festive")
        self.assertEqual(response["intent"]["style"], "ethnic")
        self.assertEqual(response["intent"]["formality"], 4)
        self.assertEqual(response["intent"]["mood"], "festive")
        self.assertEqual(
            response["intent"]["category_preference"],
            ["saree", "kurta", "suit"],
        )
        self.assertEqual(
            response["intent"]["item_constraints"][0]["garment"],
            "saree",
        )
        self.assertEqual(captured_intents[0][0]["occasion"], "festive")
        self.assertEqual(
            captured_intents[0][0]["item_constraints"][0]["garment"],
            "saree",
        )
        self.assertEqual(
            [item["id"] for item in captured_intents[0][1]],
            ["silk-saree", "summer-top"],
        )

    def test_festive_preset_for_male_profile_requests_kurta_and_pants(self):
        request = DailyRecommendationRequest(
            user_id="user-id",
            preset="festive",
            latitude=12.97,
            longitude=77.59,
        )
        outfit = {
            "type": "separates",
            "top": {"category": "top", "subcategory": "kurta"},
            "bottom": {"category": "bottom", "subcategory": "pants"},
        }
        ranked_outfit = {"outfit": outfit, "score": 10}
        captured_intents = []
        closet = [
            {
                "id": "festive-kurta",
                "category": "top",
                "subcategory": "kurta",
                "occasions": ["wedding"],
                "season": ["all"],
            },
            {
                "id": "formal-pants",
                "category": "bottom",
                "subcategory": "pants",
                "occasions": ["festive"],
                "season": ["all"],
            },
        ]

        with (
            patch(
                "main.get_current_weather",
                return_value={"temperature": 25, "rain": 0},
            ),
            patch(
                "main.get_weather_context",
                return_value={
                    "temperature": 25,
                    "temperature_category": "warm",
                    "rain_category": "dry",
                    "overall": "warm",
                },
            ),
            patch("main.get_user_preferences", return_value={"gender": "male"}),
            patch("main.get_user_clothes", return_value=closet),
            patch(
                "main.filter_clothes",
                side_effect=lambda clothes, intent: (
                    captured_intents.append(intent) or clothes
                ),
            ),
            patch("main.build_outfits", return_value=[outfit]),
            patch("main.rank_outfits", return_value=[ranked_outfit]),
        ):
            response = asyncio.run(main.daily_recommendation(request))

        self.assertEqual(response["intent"]["category_preference"], ["kurta", "pants"])
        self.assertEqual(
            [constraint["garment"] for constraint in response["intent"]["item_constraints"]],
            ["kurta", "pants"],
        )
        self.assertEqual(
            [constraint["category"] for constraint in captured_intents[0]["item_constraints"]],
            ["top", "bottom"],
        )

    def test_weather_timeout_still_returns_closet_recommendations(self):
        failures = (
            httpx.ConnectTimeout("SSL handshake timed out"),
            ssl.SSLError("SSL handshake timed out"),
            TimeoutError("SSL handshake timed out"),
        )

        for failure in failures:
            with self.subTest(failure=type(failure).__name__):
                request = DailyRecommendationRequest(
                    user_id="user-id",
                    preset="dinner",
                    latitude=12.97,
                    longitude=77.59,
                )
                outfit = {
                    "type": "separates",
                    "top": {"category": "top"},
                    "bottom": {"category": "bottom"},
                }
                ranked_outfit = {"outfit": outfit, "score": 10}

                with (
                    patch("main.get_current_weather", side_effect=failure),
                    patch(
                        "main.get_user_clothes",
                        return_value=[{"season": ["all"]}],
                    ),
                    patch(
                        "main.filter_clothes",
                        side_effect=lambda clothes, intent: clothes,
                    ),
                    patch("main.build_outfits", return_value=[outfit]),
                    patch("main.rank_outfits", return_value=[ranked_outfit]),
                ):
                    response = asyncio.run(
                        main.daily_recommendation(request)
                    )

                self.assertIsNone(response["weather"])
                self.assertEqual(response["weather_context"]["temperature"], 25)
                self.assertEqual(response["preset"], "dinner")
                self.assertEqual(response["recommendations"], [ranked_outfit])
                self.assertIn(
                    "Live weather is temporarily unavailable",
                    response["weather_error"],
                )
