#!/usr/bin/env python3
import sys
import json
import requests
from datetime import datetime

# Script arguments:
# sys.argv[1]: API Key
# sys.argv[2]: City

if len(sys.argv) < 3:
    print(json.dumps({"error": "Missing arguments. Usage: script.py <API_KEY> <CITY>"}))
    sys.exit(1)

KEY = sys.argv[1]
city = sys.argv[2]

# EPA AQI breakpoints
PM25_BP = [(0.0, 12.0, 0, 50), (12.1, 35.4, 51, 100), (35.5, 55.4, 101, 150),
           (55.5, 150.4, 151, 200), (150.5, 250.4, 201, 300), (250.5, 350.4, 301, 400),
           (350.5, 500.4, 401, 500)]
O3_BP = [(0.000, 0.054, 0, 50), (0.055, 0.070, 51, 100), (0.071, 0.085, 101, 150),
         (0.086, 0.105, 151, 200), (0.106, 0.200, 201, 300)]
NO2_BP = [(0, 53, 0, 50), (54, 100, 51, 100), (101, 360, 101, 150),
          (361, 649, 151, 200), (650, 1249, 201, 300), (1250, 1649, 301, 400),
          (1650, 2049, 401, 500)]
CATS = [(0, 50, "Good"), (51, 100, "Moderate"), (101, 150, "Unhealthy for Sensitive Groups"),
        (151, 200, "Unhealthy"), (201, 300, "Very Unhealthy"), (301, 500, "Hazardous")]

def calc_aqi(c, bp):
    for Cl, Ch, Il, Ih in bp:
        if Cl <= c <= Ch:
            return round(((Ih - Il) / (Ch - Cl)) * (c - Cl) + Il)
    return None

def get_cat(aqi):
    if not aqi: return "Unknown"
    for lo, hi, lab in CATS:
        if lo <= aqi <= hi: return lab
    return "Unknown"

try:
    url = "https://api.weatherapi.com/v1/current.json"
    r = requests.get(url, params={"key": KEY, "q": city, "aqi": "yes"}, timeout=10)
    r.raise_for_status()
    data = r.json()

    aq = data["current"]["air_quality"]
    pm25_ug = float(aq.get("pm2_5", 0))
    o3_ug = float(aq.get("o3", 0))
    no2_ug = float(aq.get("no2", 0))

    # Convert units
    o3_ppm = o3_ug * 0.0005
    no2_ppb = no2_ug * 0.5319

    result = {
        "city": city,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "current": {
            "pm25": {"value": round(pm25_ug, 2), "unit": "µg/m³", "aqi": calc_aqi(pm25_ug, PM25_BP), "category": get_cat(calc_aqi(pm25_ug, PM25_BP))},
            "o3": {"value": round(o3_ppm, 3), "unit": "ppm", "aqi": calc_aqi(o3_ppm, O3_BP), "category": get_cat(calc_aqi(o3_ppm, O3_BP))},
            "no2": {"value": round(no2_ppb, 2), "unit": "ppb", "aqi": calc_aqi(no2_ppb, NO2_BP), "category": get_cat(calc_aqi(no2_ppb, NO2_BP))}
        }
    }
    print(json.dumps(result))

except Exception as e:
    # Print error as JSON so caller understands it failed gracefully
    print(json.dumps({"error": str(e), "city": city}))
    sys.exit(1)
