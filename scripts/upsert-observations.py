"""
Enhanced ETL Script: Fetch air quality data from AirNow API and upsert to Supabase
Run this script hourly via cron job or Supabase Edge Function

Usage:
  python scripts/upsert-observations.py
"""

import os
import requests
from datetime import datetime
from typing import List, Dict, Any

# Configuration
AIRNOW_API_KEY = os.getenv("AIRNOW_API_KEY", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

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
    {"name": "Boston, MA", "lat": 42.3601, "lon": -71.0589},
    {"name": "Miami, FL", "lat": 25.7617, "lon": -80.1918},
]


def fetch_airnow_data(lat: float, lon: float) -> Dict[str, Any]:
    """Fetch current AQI data from AirNow API"""
    if not AIRNOW_API_KEY:
        # Return mock data if API key not set
        import random
        return {
            "aqi": random.randint(30, 120),
            "pm25": random.uniform(10, 50),
            "pm10": random.uniform(20, 80),
            "o3": random.uniform(0.02, 0.06),
        }

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
            aqi_value = item.get("AQI", 0)
            concentration = item.get("Value", 0)

            if param == "pm2.5":
                pollutants["pm25"] = concentration
                aqi = max(aqi, aqi_value)
            elif param == "pm10":
                pollutants["pm10"] = concentration
                aqi = max(aqi, aqi_value)
            elif param == "o3":
                pollutants["o3"] = concentration / 1000  # Convert to ppm
                aqi = max(aqi, aqi_value)

        return {"aqi": aqi if aqi > 0 else 50, **pollutants}

    except Exception as e:
        print(f"Error fetching AirNow data: {e}")
        # Return default values on error
        return {"aqi": 50}


def upsert_observation(location: Dict[str, Any], data: Dict[str, Any]) -> bool:
    """Upsert observation to Supabase"""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("Error: Supabase configuration missing")
        return False

    url = f"{SUPABASE_URL}/rest/v1/observations"
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=representation",
    }

    observation = {
        "location_name": location["name"],
        "lat": location["lat"],
        "lon": location["lon"],
        "aqi": data.get("aqi", 0),
        "pm25": data.get("pm25"),
        "pm10": data.get("pm10"),
        "o3": data.get("o3"),
        "source": "airnow" if AIRNOW_API_KEY else "mock",
        "observed_at": datetime.utcnow().isoformat() + "Z",
        "created_at": datetime.utcnow().isoformat() + "Z",
    }

    try:
        response = requests.post(url, json=observation, headers=headers, timeout=10)
        response.raise_for_status()
        print(f"✓ Upserted observation for {location['name']}: AQI {data.get('aqi', 0)}")
        return True
    except Exception as e:
        print(f"✗ Error upserting observation for {location['name']}: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"  Response: {e.response.text}")
        return False


def main():
    """Main ETL process"""
    print(f"\n{'='*60}")
    print(f"Starting ETL process at {datetime.utcnow().isoformat()}")
    print(f"{'='*60}\n")

    if not AIRNOW_API_KEY:
        print("⚠️  Warning: AIRNOW_API_KEY not set. Using mock data.\n")

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        return

    success_count = 0
    for location in LOCATIONS:
        print(f"Processing {location['name']}...")

        # Fetch data from AirNow
        data = fetch_airnow_data(location["lat"], location["lon"])

        # Upsert to Supabase
        if upsert_observation(location, data):
            success_count += 1

    print(f"\n{'='*60}")
    print(f"ETL complete: {success_count}/{len(LOCATIONS)} locations processed successfully")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
