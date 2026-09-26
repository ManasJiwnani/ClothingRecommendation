import asyncio
import ssl
import unittest
from unittest.mock import patch

from services.weather import get_current_weather


class FakeResponse:
    def raise_for_status(self):
        return None

    def json(self):
        return {
            "current": {
                "temperature_2m": 21.5,
                "apparent_temperature": 20.0,
                "precipitation": 0.0,
                "rain": 0.0,
                "weather_code": 1,
                "wind_speed_10m": 12.5,
            }
        }


class FakeAsyncClient:
    def __init__(self, *args, **kwargs):
        self.kwargs = kwargs

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def get(self, url, params):
        self.url = url
        self.params = params
        return FakeResponse()


class WeatherSSLTests(unittest.TestCase):
    def test_get_current_weather_uses_certifi_bundle(self):
        fake_client = None

        def factory(*args, **kwargs):
            nonlocal fake_client
            fake_client = FakeAsyncClient(*args, **kwargs)
            return fake_client

        with patch("services.weather.httpx.AsyncClient", side_effect=factory):
            result = asyncio.run(get_current_weather(12.97, 77.59))

        self.assertEqual(result["temperature"], 21.5)
        self.assertIsInstance(fake_client.kwargs.get("verify"), ssl.SSLContext)
        self.assertFalse(fake_client.kwargs.get("verify") is False)
