import os
import ssl
import certifi
import httpx

# try:
import truststore
truststore.inject_into_ssl()
# except Exception:
#     # Fall back to the default SSL handling if truststore is unavailable.
#     pass

os.environ.setdefault("SSL_CERT_FILE", certifi.where())
os.environ.setdefault("REQUESTS_CA_BUNDLE", certifi.where())

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


async def get_current_weather(latitude: float, longitude: float):

    params = {
        "latitude": latitude,
        "longitude": longitude,

        "current": (
            "temperature_2m,"
            "apparent_temperature,"
            "precipitation,"
            "rain,"
            "weather_code,"
            "wind_speed_10m"
        ),

        "timezone": "auto"
    }

    ssl_context = truststore.SSLContext(ssl.PROTOCOL_TLS_CLIENT)

    async with httpx.AsyncClient(verify=ssl_context) as client:
        response = await client.get(
            OPEN_METEO_URL,
            params=params
        )

    response.raise_for_status()

    data = response.json()

    current = data["current"]

    return {
        "temperature": current["temperature_2m"],
        "feels_like": current["apparent_temperature"],
        "precipitation": current["precipitation"],
        "rain": current["rain"],
        "weather_code": current["weather_code"],
        "wind_speed": current["wind_speed_10m"]
    }