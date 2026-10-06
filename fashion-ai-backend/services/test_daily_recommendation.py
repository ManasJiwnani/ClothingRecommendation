import asyncio
import ssl
import unittest
from unittest.mock import patch

import httpx

import main
from models.schemas import DailyRecommendationRequest


class DailyRecommendationTests(unittest.TestCase):
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
