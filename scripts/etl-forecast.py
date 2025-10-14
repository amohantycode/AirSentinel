"""
ETL Script: Generate air quality forecasts using weather data
Run this script every 6 hours via Supabase Edge Function or cron job
"""

import os
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

# Major cities to forecast
LOCATIONS = [
    {"name": "Los Angeles, CA", "lat": 34.0522, "lon": -118.2437},
    {"name": "San Francisco, CA", "lat": 37.7749, "lon": -122.4194},
    {"name": "New York, NY", "lat": 40.7128, "lon": -74.0060},
    {"name": "Chicago, IL", "lat": 41.8781, "lon": -87.6298},
]


def fetch_weather_data(lat: float, lon: float) -> List[Dict[str, Any]]:
    """Fetch weather forecast from Open-Meteo API"""
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": "temperature_2m,relative_humidity_2m,wind_speed_10m",
        "forecast_days": 1,
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        hourly = data.get("hourly", {})
        times = hourly.get("time", [])
        temps = hourly.get("temperature_2m", [])
        humidity = hourly.get("relative_humidity_2m", [])
        wind = hourly.get("wind_speed_10m", [])

        return [
            {
                "time": times[i],
                "temp": temps[i],
                "humidity": humidity[i],
                "wind_speed": wind[i],
            }
            for i in range(len(times))
        ]

    except Exception as e:
        print(f"Error fetching weather data: {e}")
        return []


def predict_aqi(weather: Dict[str, Any], base_aqi: int = 75) -> int:
    """Simple AQI prediction based on weather conditions"""
    # This is a simplified model - replace with actual ML model
    aqi = base_aqi

    # High temperature increases AQI
    if weather["temp"] > 85:
        aqi += 10
    elif weather["temp"] > 75:
        aqi += 5

    # Low humidity increases AQI
    if weather["humidity"] < 30:
        aqi += 10
    elif weather["humidity"] < 50:
        aqi += 5

    # Low wind speed increases AQI (less dispersion)
    if weather["wind_speed"] < 5:
        aqi += 10
    elif weather["wind_speed"] < 10:
        aqi += 5

    return min(aqi, 500)  # Cap at 500


def upsert_forecast(location: Dict[str, Any], weather: Dict[str, Any], hour: int) -> bool:
    """Upsert forecast to Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/forecasts"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }

    aqi_predicted = predict_aqi(weather)

    forecast = {
        "location_name": location["name"],
        "lat": location["lat"],
        "lon": location["lon"],
        "forecast_date": datetime.utcnow().date().isoformat(),
        "forecast_hour": hour,
        "aqi_predicted": aqi_predicted,
        "confidence": 0.85,
        "weather_temp": weather["temp"],
        "weather_humidity": weather["humidity"],
        "weather_wind_speed": weather["wind_speed"],
    }

    try:
        response = requests.post(url, json=forecast, headers=headers, timeout=10)
        response.raise_for_status()
        return True
    except Exception as e:
        print(f"Error upserting forecast: {e}")
        return False


def main():
    """Main forecast generation process"""
    print(f"Starting forecast generation at {datetime.utcnow().isoformat()}")

    success_count = 0
    for location in LOCATIONS:
        print(f"\nProcessing {location['name']}...")

        # Fetch weather data
        weather_data = fetch_weather_data(location["lat"], location["lon"])

        if not weather_data:
            print(f"No weather data available for {location['name']}")
            continue

        # Generate forecasts for next 24 hours
        for hour, weather in enumerate(weather_data[:24]):
            if upsert_forecast(location, weather, hour):
                success_count += 1

    print(f"\nForecast generation complete: {success_count} forecasts created")


if __name__ == "__main__":
    main()
