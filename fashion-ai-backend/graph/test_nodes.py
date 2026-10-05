import asyncio
import unittest
from unittest.mock import patch

import httpx

from graph.nodes import weather_node


class WeatherNodeTests(unittest.TestCase):
    def test_weather_failure_does_not_block_recommendations(self):
        state = {"latitude": 12.97, "longitude": 77.59}

        with patch(
            "graph.nodes.get_current_weather",
            side_effect=httpx.ConnectTimeout("SSL handshake timed out"),
        ):
            result = asyncio.run(weather_node(state))

        self.assertIsNone(result["weather"])
        self.assertIsNone(result["weather_context"])
        self.assertIn("weather is temporarily unavailable", result["weather_error"])
