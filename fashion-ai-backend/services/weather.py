import os
import ssl
import certifi
import httpx

try:
    import truststore
    truststore.inject_into_ssl()
except Exception:
    pass

os.environ.setdefault("SSL_CERT_FILE", certifi.where())
os.environ.setdefault("REQUESTS_CA_BUNDLE", certifi.where())


def _build_client_kwargs():
    value = os.getenv("ENABLE_SSL_VERIFICATION")

    if value is not None:
        enable_ssl_verification = value.lower() in {"1", "true", "yes", "on"}
        if not enable_ssl_verification:
            return {"verify": False}

    try:
        ssl_context = ssl.create_default_context(cafile=certifi.where())
        return {"verify": ssl_context}
    except Exception:
        return {"verify": certifi.where()}

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

    client_kwargs = _build_client_kwargs()

    async with httpx.AsyncClient(**client_kwargs) as client:
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