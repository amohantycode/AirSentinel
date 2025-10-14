"""
ETL Script: Fetch air quality data from AirNow API and upsert to Supabase
Run this script hourly via Supabase Edge Function or cron job
"""

import os
import requests
from datetime import datetime
from typing import List, Dict, Any

# Configuration
AIRNOW_API_KEY = os.getenv("AIRNOW_API_KEY", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

# Major cities to monitor
LOCATIONS = [
    {"name": "Los Angeles, CA", "lat": 34.0522, "lon": -118.2437},
    {"name": "San Francisco, CA", "lat": 37.7749, "lon": -122.4194},
    {"name": "New York, NY", "lat": 40.7128, "lon": -74.0060},
    {"name": "Chicago, IL", "lat": 41.8781, "lon": -87.6298},
    {"name": "Houston, TX", "lat": 29.7604, "lon": -95.3698},
    {"name": "Phoenix, AZ", "lat": 33.4484, "lon": -112.0740},
    {"name": "Seattle, WA", "lat": 47.6062, "lon": -122.3321},
    {"name": "Denver, CO", "lat": 39.7392, "lon": -104.9903},
]


def fetch_airnow_data(lat: float, lon: float) -> Dict[str, Any]:
    """Fetch current AQI data from AirNow API"""
    url = "https://www.airnowapi.org/aq/observation/latLong/current/"
    params = {
        "format": "application/json",
        "latitude": lat,
        "longitude": lon,
        "distance": 25,
        "API_KEY": AIRNOW_API_KEY,
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        # Parse pollutant data
        pollutants = {}
        aqi = 0

        for item in data:
            param = item.get("ParameterName", "").lower()
            value = item.get("AQI", 0)

            if param == "pm2.5":
                pollutants["pm25"] = value
            elif param == "pm10":
                pollutants["pm10"] = value
            elif param == "o3":
                pollutants["o3"] = value

            # Use highest AQI value
            aqi = max(aqi, value)

        return {"aqi": aqi, **pollutants}

    except Exception as e:
        print(f"Error fetching AirNow data: {e}")
        return {"aqi": 0}


def upsert_observation(location: Dict[str, Any], data: Dict[str, Any]) -> bool:
    """Upsert observation to Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/observations"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }

    observation = {
        "location_name": location["name"],
        "lat": location["lat"],
        "lon": location["lon"],
        "aqi": data.get("aqi", 0),
        "pm25": data.get("pm25"),
        "pm10": data.get("pm10"),
        "o3": data.get("o3"),
        "source": "airnow",
        "observed_at": datetime.utcnow().isoformat(),
    }

    try:
        response = requests.post(url, json=observation, headers=headers, timeout=10)
        response.raise_for_status()
        print(f"✓ Upserted observation for {location['name']}: AQI {data.get('aqi', 0)}")
        return True
    except Exception as e:
        print(f"✗ Error upserting observation for {location['name']}: {e}")
        return False


def main():
    """Main ETL process"""
    print(f"Starting ETL process at {datetime.utcnow().isoformat()}")

    if not AIRNOW_API_KEY:
        print("Warning: AIRNOW_API_KEY not set. Using mock data.")

    success_count = 0
    for location in LOCATIONS:
        print(f"\nProcessing {location['name']}...")

        # Fetch data from AirNow
        data = fetch_airnow_data(location["lat"], location["lon"])

        # Upsert to Supabase
        if upsert_observation(location, data):
            success_count += 1

    print(f"\nETL complete: {success_count}/{len(LOCATIONS)} locations processed successfully")


if __name__ == "__main__":
    main()
