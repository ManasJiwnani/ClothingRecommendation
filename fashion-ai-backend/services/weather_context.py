def get_weather_context(weather):
    temperature = weather["temperature"]
    rain = weather.get("rain", 0)
    weather_code = weather.get("weather_code")

    # Temperature category
    if temperature >= 30:
        temperature_category = "hot"
    elif temperature >= 24:
        temperature_category = "warm"
    elif temperature >= 18:
        temperature_category = "cool"
    else:
        temperature_category = "cold"

    # Rain category
    if rain > 0:
        rain_category = "rainy"
    else:
        rain_category = "dry"

    # Overall weather category
    if rain > 0:
        overall = "rainy"
    else:
        overall = temperature_category

    return {
        "temperature": temperature,
        "temperature_category": temperature_category,
        "rain_category": rain_category,
        "overall": overall,
        "weather_code": weather_code
    }    
    
    weather = {
        "temperature": 31,
        "feels_like": 33,
        "precipitation": 0,
        "rain": 0,
        "weather_code": 1,
        "wind_speed": 12
    }
    
    print(get_weather_context(weather))