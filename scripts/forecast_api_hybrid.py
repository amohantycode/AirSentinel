#!/usr/bin/env python3
"""
Hybrid Forecast API - Uses REAL live data from WeatherAPI + local historical data
- Fetches TODAY's real-time AQ from WeatherAPI /current.json
- Loads last 30 days from local historical dataset (combined-historical-2020-2025.csv)
- Builds feature vector and predicts next 7 days
"""

import os, sys, json, requests
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path
from joblib import load

# Use relative paths from script location
SCRIPT_DIR = Path(__file__).parent.resolve()
ROOT = SCRIPT_DIR.parent
MODEL_DIR = ROOT / "models" / "daily_7d"
DATA_DIR = ROOT / "data"

# EPA AQI calculation
PM25_BP = [
    (0.0, 12.0, 0, 50),
    (12.1, 35.4, 51, 100),
    (35.5, 55.4, 101, 150),
    (55.5, 150.4, 151, 200),
    (150.5, 250.4, 201, 300),
    (250.5, 350.4, 301, 400),
    (350.5, 500.4, 401, 500)
]

O3_BP_PPM = [(0.000, 0.054, 0, 50), (0.055, 0.070, 51, 100), (0.071, 0.085, 101, 150),
              (0.086, 0.105, 151, 200), (0.106, 0.200, 201, 300)]

NO2_BP_PPB = [(0, 53, 0, 50), (54, 100, 51, 100), (101, 360, 101, 150),
              (361, 649, 151, 200), (650, 1249, 201, 300), (1250, 1649, 301, 400),
              (1650, 2049, 401, 500)]

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

def fetch_current_aq(city, key):
    """Fetch REAL-TIME air quality from WeatherAPI /current.json."""
    url = "https://api.weatherapi.com/v1/current.json"
    params = {"key": key, "q": city, "aqi": "yes"}
    
    try:
        r = requests.get(url, params=params, timeout=10)
        r.raise_for_status()
        data = r.json()
        
        if "current" in data and "air_quality" in data["current"]:
            aq = data["current"]["air_quality"]
            # WeatherAPI returns µg/m³ - convert to training units
            pm25_raw = aq.get("pm2_5")
            o3_raw = aq.get("o3")
            no2_raw = aq.get("no2")
            
            return {
                "pm25": float(pm25_raw) if pm25_raw else None,  # µg/m³ (no conversion)
                "o3": float(o3_raw) * 0.0005 if o3_raw else None,  # µg/m³ → ppm
                "no2": float(no2_raw) * 0.5319 if no2_raw else None,  # µg/m³ → ppb
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        return None
    except Exception as e:
        print(f"ERROR fetching current AQ: {e}", file=sys.stderr)
        return None

def load_historical_data(location_filter=None, days=30):
    """Load historical data from local CSV (real EPA data).
    If not enough recent data, fall back to older data."""
    csv_path = DATA_DIR / "combined-historical-2020-2025.csv"
    
    if not csv_path.exists():
        print(f"ERROR: {csv_path} not found", file=sys.stderr)
        return pd.DataFrame()
    
    try:
        df = pd.read_csv(str(csv_path))
        
        # Parse date column safely - handle both M/D/YYYY and YYYY-MM-DD formats
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        df = df.dropna(subset=["date"])
        df = df.sort_values("date")
        
        # Filter by location if specified
        if location_filter:
            # Try location column first
            mask = df["location"].astype(str).str.contains(location_filter, case=False, na=False)
            if mask.sum() == 0:
                # Try state
                mask = df["state"].astype(str).str.contains(location_filter, case=False, na=False)
            if mask.sum() == 0:
                # Default to first location with data
                print(f"  No exact match for '{location_filter}', using all DC/Maryland locations", file=sys.stderr)
                mask = (df["state"].astype(str).str.contains("District", case=False, na=False) | 
                        df["state"].astype(str).str.contains("Maryland", case=False, na=False))
            df = df[mask]
        
        # Try to get last N days
        cutoff_date = datetime.utcnow().date() - timedelta(days=days)
        df_recent = df[df["date"].dt.date >= cutoff_date]
        
        # If no recent data, fall back to all available data (don't filter by date)
        if df_recent.empty:
            print(f"  ⚠ No data from last {days} days, using all available historical data", file=sys.stderr)
            return df
        
        return df_recent
    except Exception as e:
        print(f"ERROR loading historical data: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return pd.DataFrame()

def build_history_sequence(location, pollutant_key, current_aq_value):
    """
    Build 30-day sequence by merging:
    - Last 29 days from local historical CSV
    - TODAY from real-time WeatherAPI
    """
    # Map pollutant_key to dataset pollutant name
    pol_map = {"pm25": "PM2.5", "o3": "Ozone", "no2": "NO2"}
    pollutant_name = pol_map.get(pollutant_key)
    
    if not pollutant_name:
        return []
    
    # Load last 40 days (to ensure we get 29+ valid)
    df_hist = load_historical_data(location, days=40)
    
    if df_hist.empty:
        print(f"  No local historical data for {location}", file=sys.stderr)
        return []
    
    # Filter to this pollutant
    df_pol = df_hist[df_hist["pollutant"] == pollutant_name].copy()
    df_pol = df_pol.sort_values("date")
    
    # Get daily averages if multiple readings per day
    df_daily = df_pol.groupby("date")["concentration"].mean().reset_index()
    df_daily["date"] = pd.to_datetime(df_daily["date"]).dt.date
    df_daily = df_daily.sort_values("date")
    
    # Take last 29 days
    historical_rows = []
    for _, row in df_daily.tail(29).iterrows():
        historical_rows.append({
            "date": row["date"].isoformat(),
            pollutant_key: float(row["concentration"])
        })
    
    # Add today's REAL-TIME value from WeatherAPI
    if current_aq_value is not None:
        today = datetime.utcnow().date()
        historical_rows.append({
            "date": today.isoformat(),
            pollutant_key: current_aq_value
        })
    
    return historical_rows

def featurize_for_today(history_list, value_key, location_name):
    """Build feature row from 30-day sequence."""
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

def predict_pollutant_hybrid(city, key, pollutant_name, pollutant_key, model_path):
    """
    Hybrid prediction using:
    - REAL current AQ from WeatherAPI
    - REAL historical data from local CSV
    """
    print(f"\n--- Predicting {pollutant_name} ---", file=sys.stderr)
    
    # Step 1: Fetch today's REAL AQ from WeatherAPI
    current_aq = fetch_current_aq(city, key)
    if not current_aq:
        print(f"  ✗ Could not fetch current AQ", file=sys.stderr)
        return None
    
    current_value = current_aq.get(pollutant_key)
    if current_value is None:
        print(f"  ✗ No {pollutant_key} in current AQ", file=sys.stderr)
        return None
    
    print(f"  ✓ Current {pollutant_key}: {current_value:.3f}", file=sys.stderr)
    
    # Step 2: Build 30-day sequence (29 historical + 1 current)
    history = build_history_sequence(city, pollutant_key, current_value)
    
    # Allow predictions with 15+ days (pad with zeros if needed)
    if len(history) < 15:
        print(f"  ✗ Only {len(history)} days available (need at least 15)", file=sys.stderr)
        return None
    elif len(history) < 30:
        print(f"  ⚠ Only {len(history)} days available (using zero-padding for remaining)", file=sys.stderr)
        # Pad with zeros at the beginning
        missing_days = 30 - len(history)
        start_date = pd.to_datetime(history[0]["date"]) - pd.Timedelta(days=missing_days)
        for i in range(missing_days):
            pad_date = (start_date + pd.Timedelta(days=i)).date().isoformat()
            history.insert(0, {"date": pad_date, pollutant_key: 0.0})
    
    print(f"  ✓ Built 30-day sequence ({len(history)-1} historical + 1 live)", file=sys.stderr)
    
    # Step 3: Load model and predict
    if not os.path.exists(model_path):
        print(f"  ✗ Model not found: {model_path}", file=sys.stderr)
        return None
    
    try:
        bundle = load(model_path)
        model = bundle["model"]
        cols = bundle["feature_columns"]
        
        feats = featurize_for_today(history, pollutant_key, city)
        if feats is None:
            print(f"  ✗ Featurization failed", file=sys.stderr)
            return None
        
        x = pd.DataFrame([{c: feats.get(c, 0.0) for c in cols}])
        y7 = model.predict(x)[0]
        
        print(f"  ✓ Predicted 7-day values: {y7[:3]}... (first 3)", file=sys.stderr)
        
        # Step 4: Build forecast JSON
        start = datetime.utcnow().date() + timedelta(days=1)
        days = [(start + timedelta(days=i)).isoformat() for i in range(7)]
        
        if pollutant_key == "o3":
            bp = O3_BP_PPM
            unit = "ppm"
        elif pollutant_key == "no2":
            bp = NO2_BP_PPB
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
        print(f"  ✗ Prediction error: {e}", file=sys.stderr)
        return None

def forecast_hybrid(city, key):
    """Main hybrid forecast - REAL data from API + local history."""
    print(f"\n{'='*60}", file=sys.stderr)
    print(f"Hybrid Forecast for {city}", file=sys.stderr)
    print(f"Using REAL WeatherAPI current data + local EPA history", file=sys.stderr)
    print(f"{'='*60}", file=sys.stderr)
    
    result = {
        "city": city,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "data_source": "hybrid_weatherapi_current_plus_local_history",
        "forecasts": {}
    }
    
    # PM2.5
    pm25_result = predict_pollutant_hybrid(
        city, key, "PM2.5", "pm25",
        os.path.join(MODEL_DIR, "pm25_7d.joblib")
    )
    if pm25_result:
        result["forecasts"]["pm25"] = pm25_result
    
    # Ozone
    o3_result = predict_pollutant_hybrid(
        city, key, "Ozone", "o3",
        os.path.join(MODEL_DIR, "ozone_7d.joblib")
    )
    if o3_result:
        result["forecasts"]["ozone"] = o3_result
    
    # NO2
    no2_result = predict_pollutant_hybrid(
        city, key, "NO2", "no2",
        os.path.join(MODEL_DIR, "no2_7d.joblib")
    )
    if no2_result:
        result["forecasts"]["no2"] = no2_result
    
    print(f"\n{'='*60}", file=sys.stderr)
    print(f"✓ Forecast complete!", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)
    
    return result

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: forecast_api_hybrid.py <city> <weatherapi_key>"}))
        sys.exit(1)
    
    city = sys.argv[1]
    key = sys.argv[2]
    
    try:
        result = forecast_hybrid(city, key)
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
