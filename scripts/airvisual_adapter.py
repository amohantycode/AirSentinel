#!/usr/bin/env python3
"""
AirVisual API Adapter for Real Air Quality Data
Fetches current + historical pollution data from AirVisual

AirVisual Plans:
  - Free: current data only (city, state, country)
  - Startup+: current + forecasts
  - Premium: historical data access

Free Tier Endpoints:
  GET /v2/city?city=CITY&state=STATE&country=COUNTRY&key=KEY
  Returns: current pollution data

Premium Endpoints:
  GET /v2/city?city=CITY&state=STATE&country=COUNTRY&key=KEY&details=T
  Returns: current + history + forecasts (last 48h history included)

Reference: https://api-docs.airvisual.com/
"""

import os
import sys
import json
import requests
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from pathlib import Path

ROOT = "/Users/shauryamallampati/Desktop/congressionalapp"
MODEL_DIR = os.path.join(ROOT, "models", "daily_7d")

# ---- EPA AQI calculation ----
PM25_BP = [
    (0.0, 12.0, 0, 50),
    (12.1, 35.4, 51, 100),
    (35.5, 55.4, 101, 150),
    (55.5, 150.4, 151, 200),
    (150.5, 250.4, 201, 300),
    (250.5, 350.4, 301, 400),
    (350.5, 500.4, 401, 500)
]

AQI_CATS = [
    (0, 50, "Good"),
    (51, 100, "Moderate"),
    (101, 150, "Unhealthy for Sensitive Groups"),
    (151, 200, "Unhealthy"),
    (201, 300, "Very Unhealthy"),
    (301, 500, "Hazardous")
]

def aqi_from_conc(c, bp):
    """Convert concentration to AQI using breakpoint table."""
    for Cl, Ch, Il, Ih in bp:
        if Cl <= c <= Ch:
            return round(((Ih - Il) / (Ch - Cl)) * (c - Cl) + Il)
    return None

def aqi_category(aqi):
    """Map AQI to category label."""
    if aqi is None:
        return "Unknown"
    for lo, hi, lab in AQI_CATS:
        if lo <= aqi <= hi:
            return lab
    return "Unknown"

def fetch_airvisual_current(city, state, country, key):
    """
    Fetch current pollution data from AirVisual.
    
    Parameters:
      city: City name (e.g., "Washington")
      state: State/region (e.g., "District of Columbia")
      country: Country (e.g., "USA")
      key: AirVisual API key
    
    Returns:
      dict with keys: pm25, o3, no2, ts (timestamp)
      or None if API call fails
    """
    url = "http://api.airvisual.com/v2/city"
    params = {
        "city": city,
        "state": state,
        "country": country,
        "key": key,
        "details": "T"  # Request history + details
    }
    
    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()
        
        if data.get("status") != "success":
            print(f"  ⚠ AirVisual error: {data.get('status')}")
            return None
        
        pollution = data["data"].get("current", {}).get("pollution", {})
        
        result = {
            "ts": pollution.get("ts"),
            "pm25": pollution.get("p2", {}).get("conc"),  # PM2.5 concentration
            "o3": None,  # AirVisual doesn't typically expose O3 in free tier
            "no2": pollution.get("n2", {}).get("conc"),  # NO2 concentration
        }
        
        return result
    except Exception as e:
        print(f"  ✗ AirVisual fetch error: {str(e)[:100]}")
        return None

def fetch_airvisual_history(city, state, country, key, days=31):
    """
    Fetch historical pollution data from AirVisual.
    Free tier: returns current + last 48h
    Premium tier: returns more history
    
    This is a simplified version that makes one call per day.
    For production, cache aggressively to avoid rate limits.
    """
    rows = []
    
    # AirVisual's free history is limited, so we'll fetch current
    # and use local historical data for feature building
    current = fetch_airvisual_current(city, state, country, key)
    
    if current:
        rows.append({
            "date": datetime.fromisoformat(current["ts"].replace("Z", "+00:00")).date().isoformat(),
            "pm25": current.get("pm25"),
            "o3": current.get("o3"),
            "no2": current.get("no2"),
        })
    
    return rows

def featurize_for_today(history_list, value_key, location_name):
    """Build feature row from recent daily history."""
    values = [h.get(value_key) for h in history_list if h.get(value_key) is not None]
    
    if len(values) < 30:
        return None
    
    y = np.array(values[-30:], dtype=float)
    
    feats = {}
    for k in [1, 2, 3, 4, 5, 6, 7, 14, 30]:
        if len(y) >= k:
            feats[f"lag_{k}"] = float(y[-k])
    
    def rolling_mean(window):
        if len(y) >= window + 1:
            return float(np.mean(y[-(window + 1):-1]))
        return np.nan
    
    feats["rollmean_3"] = rolling_mean(3)
    feats["rollmean_7"] = rolling_mean(7)
    feats["rollmean_14"] = rolling_mean(14)
    
    latest_date = pd.to_datetime(history_list[-1]["date"])
    for i in range(1, 7):
        feats[f"dow_{i}"] = 1.0 if latest_date.dayofweek == i else 0.0
    for m in range(2, 13):
        feats[f"month_{m}"] = 1.0 if latest_date.month == m else 0.0
    
    feats["location"] = str(location_name)
    
    return feats

def load_local_history(pollutant_name):
    """
    Load historical data from local combined CSV.
    Used as fallback when AirVisual doesn't provide enough history.
    """
    combined_file = os.path.join(ROOT, "data", "combined-historical-2020-2025.csv")
    
    if not os.path.exists(combined_file):
        return []
    
    try:
        df = pd.read_csv(combined_file)
        # Filter by pollutant
        df_pol = df[df["pollutant"] == pollutant_name].copy()
        df_pol["date"] = pd.to_datetime(df_pol["date"]).dt.date
        
        rows = []
        for _, row in df_pol.iterrows():
            rows.append({
                "date": row["date"].isoformat() if hasattr(row["date"], "isoformat") else str(row["date"]),
                "pm25": row["concentration"] if pollutant_name == "PM2.5" else None,
                "o3": row["concentration"] if pollutant_name == "Ozone" else None,
                "no2": row["concentration"] if pollutant_name == "NO2" else None,
            })
        
        return sorted(rows, key=lambda x: x["date"])[-31:]  # Last 31 days
    except Exception as e:
        print(f"  ⚠ Failed to load local history: {str(e)[:80]}")
        return []

def predict_with_airvisual(city, state, country, key, pollutant_name, pollutant_key, model_path):
    """
    Predict 7 days using AirVisual current data + local historical data.
    """
    print(f"  Fetching {pollutant_name} from AirVisual ({city}, {state})...")
    
    # Fetch current from AirVisual
    current = fetch_airvisual_current(city, state, country, key)
    
    if not current:
        print(f"  ⚠ No AirVisual data; using local history only")
        history = load_local_history(pollutant_name)
    else:
        # Start with current reading
        history = [{
            "date": datetime.fromisoformat(current["ts"].replace("Z", "+00:00")).date().isoformat(),
            "pm25": current.get("pm25"),
            "o3": current.get("o3"),
            "no2": current.get("no2"),
        }]
        # Append local history
        history.extend(load_local_history(pollutant_name))
    
    # Filter to valid readings
    valid_history = [h for h in history if h.get(pollutant_key) is not None]
    
    if len(valid_history) < 30:
        print(f"  ✗ Insufficient {pollutant_name} readings: {len(valid_history)}/30")
        return None
    
    # Load model
    if not os.path.exists(model_path):
        print(f"  ✗ Model not found: {model_path}")
        return None
    
    try:
        from joblib import load
        bundle = load(model_path)
        model = bundle["model"]
        cols = bundle["feature_columns"]
        
        # Build features
        feats = featurize_for_today(valid_history, pollutant_key, city)
        if feats is None:
            return None
        
        x = pd.DataFrame([{c: feats.get(c, 0.0) for c in cols}])
        y7 = model.predict(x)[0]
        
        # Build output
        start = pd.to_datetime(valid_history[-1]["date"]) + pd.Timedelta(days=1)
        days = [(start + pd.Timedelta(days=i)).date().isoformat() for i in range(7)]
        
        # AQI breakpoints
        if pollutant_key == "o3":
            bp = [(0.000, 0.054, 0, 50), (0.055, 0.070, 51, 100), (0.071, 0.085, 101, 150),
                  (0.086, 0.105, 151, 200), (0.106, 0.200, 201, 300)]
            unit = "ppb"
        elif pollutant_key == "no2":
            bp = [(0, 53, 0, 50), (54, 100, 51, 100), (101, 360, 101, 150),
                  (361, 649, 151, 200), (650, 1249, 201, 300), (1250, 1649, 301, 400),
                  (1650, 2049, 401, 500)]
            unit = "ppb"
        else:
            bp = PM25_BP
            unit = "µg/m³"
        
        out = []
        for ts, c in zip(days, y7):
            c = float(max(c, 0.0))
            aqi_val = aqi_from_conc(c, bp)
            out.append({
                "date": ts,
                "value": round(c, 2),
                "aqi": aqi_val,
                "category": aqi_category(aqi_val)
            })
        
        return {"unit": unit, "forecast": out}
    
    except Exception as e:
        print(f"  ✗ Model error: {str(e)[:100]}")
        return None

def forecast_with_airvisual(city, state, country, key):
    """
    Generate 7-day forecast using AirVisual real data + trained models.
    """
    result = {
        "city": f"{city}, {state}, {country}",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "data_source": "AirVisual (real-time) + Local History + CatBoost Models",
        "forecasts": {}
    }
    
    # PM2.5
    pm25 = predict_with_airvisual(city, state, country, key, "PM2.5", "pm25",
                                  os.path.join(MODEL_DIR, "pm25_7d.joblib"))
    if pm25:
        result["forecasts"]["pm25"] = pm25
    
    # Ozone (limited availability in AirVisual free tier)
    o3 = predict_with_airvisual(city, state, country, key, "Ozone", "o3",
                               os.path.join(MODEL_DIR, "ozone_7d.joblib"))
    if o3:
        result["forecasts"]["ozone"] = o3
    
    # NO2
    no2 = predict_with_airvisual(city, state, country, key, "NO2", "no2",
                                os.path.join(MODEL_DIR, "no2_7d.joblib"))
    if no2:
        result["forecasts"]["no2"] = no2
    
    return result

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: airvisual_adapter.py <CITY> <STATE> <COUNTRY> <AIRVISUAL_KEY>")
        print("Example: airvisual_adapter.py Washington \"District of Columbia\" USA YOUR_KEY")
        sys.exit(1)
    
    city = sys.argv[1]
    state = sys.argv[2]
    country = sys.argv[3]
    key = sys.argv[4]
    
    try:
        result = forecast_with_airvisual(city, state, country, key)
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
