#!/usr/bin/env python3
"""
Train 7-day daily forecasters for PM2.5, Ozone, and NO2 from your CSVs.

- Scans:
    /Users/shauryamallampati/Desktop/congressionalapp/data/combined-historical-2020-2025.csv (if exists)
    /Users/shauryamallampati/Desktop/congressionalapp/data/2025/*.csv
- Detects pollutant + correct concentration column per file.
- Normalizes units (Ozone ppm, NO2 ppb).
- Builds daily features (lags/rollings + calendar).
- Trains one MultiOutput CatBoost model per pollutant (predicts y+1..y+7).
- Saves to models/daily_7d/<pm25|ozone|no2>_7d.joblib with a meta JSON.

Run:
  ./venv/bin/python3 scripts/train_daily_7d_models.py
"""

import os, glob, json
import numpy as np
import pandas as pd
from pathlib import Path
from joblib import dump
from sklearn.multioutput import MultiOutputRegressor
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_absolute_error
from catboost import CatBoostRegressor

# ---- paths ----
ROOT = "/Users/shauryamallampati/Desktop/congressionalapp"
DATA_ROOT = os.path.join(ROOT, "data")
DATA_2025 = os.path.join(DATA_ROOT, "2025")
COMBINED = os.path.join(DATA_ROOT, "combined-historical-2020-2025.csv")
OUT_DIR = os.path.join(ROOT, "models", "daily_7d")
Path(OUT_DIR).mkdir(parents=True, exist_ok=True)

# ---- columns we’ll search for in different exports ----
POLLUTANT_COLS = {
    "PM2.5": ["Daily Mean PM2.5 Concentration", "PM2.5", "pm2.5", "pm25", "PM25", "Arithmetic Mean"],
    "Ozone": ["Daily Max 8-hour Ozone Concentration", "Ozone", "ozone", "o3", "O3", "Arithmetic Mean"],
    "NO2":   ["Daily Mean NO2 Concentration", "NO2", "no2", "Arithmetic Mean"]
}
DATE_COLS = ["Date", "Date Local", "date"]
SITE_COLS = ["Local Site Name", "Site Name", "City", "CBSA Name"]
STATE_COLS = ["State", "State Name"]
COUNTY_COLS = ["County", "County Name"]

def _first_col(cols, candidates):
    for c in candidates:
        if c in cols:
            return c
    return None

def _which_pollutant(df, fname_lower):
    # Try by filename first
    if "pm2.5" in fname_lower or "pm25" in fname_lower or "2.5" in fname_lower:
        return "PM2.5"
    if "ozone" in fname_lower or "o3" in fname_lower:
        return "Ozone"
    if "no2" in fname_lower:
        return "NO2"
    # Else: try by available measurement columns
    for pol, options in POLLUTANT_COLS.items():
        for o in options:
            if o in df.columns:
                return pol
    return None

def _conc_col(df, pollutant):
    for c in POLLUTANT_COLS[pollutant]:
        if c in df.columns:
            return c
    return None

def load_all_daily():
    """Return a tidy daily dataframe with columns:
       date, location, state, county, pollutant, value
    """
    rows = []

    def _digest_df(df, fname_hint=""):
        # Check if this is already tidy format (date, location, pollutant, value/concentration)
        if "pollutant" in df.columns and ("value" in df.columns or "concentration" in df.columns):
            # Pre-cleaned tidy format
            val_col = "concentration" if "concentration" in df.columns else "value"
            count = 0
            for _, r in df.iterrows():
                try:
                    d = pd.to_datetime(r.get("date"), errors="coerce")
                    if pd.isna(d):
                        continue
                    d = d.date().isoformat()
                    
                    pol = str(r.get("pollutant", "")).strip()
                    if pol not in ["PM2.5", "Ozone", "NO2"]:
                        continue
                    
                    val = float(r.get(val_col, np.nan))
                    if np.isnan(val):
                        continue
                    
                    loc = str(r.get("location", ""))
                    st = str(r.get("state", ""))
                    co = str(r.get("county", ""))
                    
                    # Normalize units
                    if pol == "Ozone":
                        if val > 1.0:
                            val = val / 1000.0
                    elif pol == "NO2":
                        if val < 1.0:
                            val = val * 1000.0
                    
                    rows.append({
                        "date": d,
                        "location": loc,
                        "state": st,
                        "county": co,
                        "pollutant": pol,
                        "value": val
                    })
                    count += 1
                except Exception:
                    continue
            return count
        
        # EPA export format
        pollutant = _which_pollutant(df, fname_hint.lower())
        if pollutant is None:
            return 0
        conc_col = _conc_col(df, pollutant)
        if conc_col is None:
            return 0

        date_col = _first_col(df.columns, DATE_COLS)
        site_col = _first_col(df.columns, SITE_COLS)
        state_col = _first_col(df.columns, STATE_COLS)
        county_col = _first_col(df.columns, COUNTY_COLS)

        if date_col is None or site_col is None:
            return 0

        count = 0
        for _, r in df.iterrows():
            try:
                d = pd.to_datetime(r[date_col], errors="coerce")
                if pd.isna(d):
                    continue
                d = d.date().isoformat()

                loc = str(r[site_col])
                st = str(r.get(state_col, "")) if state_col else ""
                co = str(r.get(county_col, "")) if county_col else ""
                val = float(r.get(conc_col, np.nan))
                if np.isnan(val):
                    continue

                # Normalize units: Ozone->ppm; NO2->ppb
                if pollutant == "Ozone":
                    if val > 1.0:  # likely ppb
                        val = val / 1000.0
                elif pollutant == "NO2":
                    if val < 1.0:  # likely ppm
                        val = val * 1000.0

                rows.append({
                    "date": d,
                    "location": loc,
                    "state": st,
                    "county": co,
                    "pollutant": pollutant,
                    "value": val
                })
                count += 1
            except Exception:
                continue
        return count

    # Combined file first (if present)
    if os.path.exists(COMBINED):
        try:
            df = pd.read_csv(COMBINED)
            n = _digest_df(df, "combined-historical-2020-2025")
            print(f"  ✓ {COMBINED}: {n} rows")
        except Exception as e:
            print(f"  ✗ {COMBINED}: {str(e)[:80]}")

    # Root /data ad_viz files
    for p in sorted(glob.glob(os.path.join(DATA_ROOT, "ad_viz_plotval_data*.csv"))):
        if not os.path.isfile(p):
            continue
        try:
            df = pd.read_csv(p)
            n = _digest_df(df, os.path.basename(p))
            print(f"  ✓ {os.path.basename(p)}: {n} rows")
        except Exception as e:
            print(f"  ✗ {os.path.basename(p)}: {str(e)[:80]}")

    # 2025 folder (all files, not just .csv)
    for p in sorted(glob.glob(os.path.join(DATA_2025, "*"))):
        if not os.path.isfile(p):
            continue
        try:
            df = pd.read_csv(p)
            n = _digest_df(df, os.path.basename(p))
            print(f"  ✓ {os.path.basename(p)}: {n} rows")
        except Exception as e:
            print(f"  ✗ {os.path.basename(p)}: {str(e)[:80]}")

    out = pd.DataFrame(rows)
    if out.empty:
        raise SystemExit("No usable rows found. Check your /data files.")

    # Clean dedup & sort
    out = out.dropna(subset=["date", "location", "pollutant", "value"])
    out["date"] = pd.to_datetime(out["date"]).dt.date
    out = out.drop_duplicates(subset=["date", "location", "pollutant"]) \
             .sort_values(["location", "pollutant", "date"])
    return out

def add_features(df_pol):
    """df_pol: rows for ONE pollutant across many locations (date, location, value)"""
    df = df_pol.sort_values(["location","date"]).copy()

    # Ensure datetime dtype (coerce bad strings to NaT and drop them)
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["date"])

    # lags
    for k in [1,2,3,4,5,6,7,14,30]:
        df[f"lag_{k}"] = df.groupby("location")["value"].shift(k)

    # rolling means (shifted to avoid leakage)
    for w in [3,7,14]:
        df[f"rollmean_{w}"] = df.groupby("location")["value"].shift(1).rolling(w).mean()

    # calendar features
    df["dow"] = df["date"].dt.dayofweek
    df["month"] = df["date"].dt.month
    df = pd.get_dummies(df, columns=["dow","month"], drop_first=True)

    # back to date only (optional)
    df["date"] = df["date"].dt.date
    return df

def make_targets(df):
    out = df.copy()
    ycols = []
    for h in range(1, 8):
        col = f"y_{h}"
        out[col] = out.groupby("location")["value"].shift(-h)
        ycols.append(col)

    feat_cols = [c for c in out.columns if c.startswith(("lag_","rollmean_","dow_","month_"))] + ["location"]
    out = out.dropna(subset=feat_cols + ycols)

    X = out[feat_cols].copy()
    X["location"] = X["location"].astype(str)  # categorical for CatBoost
    Y = out[ycols].copy()
    return X, Y

def cv_score(X, Y):
    tscv = TimeSeriesSplit(n_splits=3)
    maes = []
    for tr, va in tscv.split(X):
        base = CatBoostRegressor(
            iterations=1200, learning_rate=0.05, depth=8,
            loss_function="RMSE", eval_metric="RMSE",
            random_seed=42, verbose=False,
            allow_writing_files=False
        )
        model = MultiOutputRegressor(base, n_jobs=1)
        # IMPORTANT: tell CatBoost which column is categorical
        model.fit(X.iloc[tr], Y.iloc[tr], cat_features=['location'])
        pred = model.predict(X.iloc[va])
        maes.append(mean_absolute_error(Y.iloc[va].values.flatten(), pred.flatten()))
    return float(np.mean(maes)), float(np.std(maes))

def train_and_save(df_all, pollutant):
    print(f"\n=== {pollutant} ===")
    d = df_all[df_all["pollutant"] == pollutant][["date","location","value"]].copy()
    if d.empty:
        print(f"  ⚠ No rows for {pollutant}; skipping.")
        return

    feat_df = add_features(d)
    X, Y = make_targets(feat_df)
    print(f"  rows after featurization: {len(X)}")

    mean_mae, std_mae = cv_score(X, Y)
    print(f"  CV MAE (avg over 7 horizons): {mean_mae:.3f} ± {std_mae:.3f}")

    base = CatBoostRegressor(
        iterations=2000, learning_rate=0.05, depth=8,
        loss_function="RMSE", eval_metric="RMSE",
        random_seed=42, verbose=False,
        allow_writing_files=False
    )
    model = MultiOutputRegressor(base, n_jobs=1)
    # IMPORTANT: categorical column
    model.fit(X, Y, cat_features=['location'])

    bundle = {
        "model": model,
        "feature_columns": list(X.columns),
        "target_columns": list(Y.columns),
        "pollutant": pollutant
    }
    tag = pollutant.lower().replace(".","")
    dump(bundle, os.path.join(OUT_DIR, f"{tag}_7d.joblib"))

    meta = {
        "pollutant": pollutant,
        "train_rows": int(len(d)),
        "featurized_rows": int(len(X)),
        "feature_columns": bundle["feature_columns"],
        "target_columns": bundle["target_columns"]
    }
    with open(os.path.join(OUT_DIR, f"{tag}_meta.json"), "w") as f:
        json.dump(meta, f, indent=2)
    print(f"  ✓ Saved models/daily_7d/{tag}_7d.joblib")

def main():
    df = load_all_daily()
    print(f"Loaded {len(df)} rows across {df['location'].nunique()} locations.")
    for pol in ["PM2.5","Ozone","NO2"]:
        train_and_save(df, pol)

if __name__ == "__main__":
    main()
