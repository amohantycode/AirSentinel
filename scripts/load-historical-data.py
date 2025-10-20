"""
Load and process historical air quality data (2020-2024) from Downloads/data folder
Combines with 2025 data for comprehensive training dataset
"""

import os
import pandas as pd
import numpy as np
import json
from datetime import datetime
import glob

def load_historical_csvs():
    """
    Load all historical CSV files from Downloads/data folder
    These are the EPA data files from 2020-2024
    """
    # Path to the Downloads/data folder
    data_dir = os.path.expanduser('~/Downloads/data')
    
    if not os.path.exists(data_dir):
        print(f"❌ Directory not found: {data_dir}")
        print("Please ensure the CSV files are in ~/Downloads/data/")
        return pd.DataFrame()
    
    csv_files = glob.glob(os.path.join(data_dir, '*.csv'))
    
    print(f"📁 Found {len(csv_files)} CSV files in {data_dir}")
    
    all_data = []
    
    for file_path in csv_files:
        filename = os.path.basename(file_path)
        print(f"\n📄 Processing: {filename}")
        
        try:
            df = pd.read_csv(file_path)
            print(f"   Rows: {len(df)}")
            
            # Determine pollutant type from columns
            if 'Daily Mean PM2.5 Concentration' in df.columns:
                pollutant = 'PM2.5'
                conc_col = 'Daily Mean PM2.5 Concentration'
                print(f"   Type: PM2.5 data")
            elif 'Daily Max 8-hour Ozone Concentration' in df.columns:
                pollutant = 'Ozone'
                conc_col = 'Daily Max 8-hour Ozone Concentration'
                print(f"   Type: Ozone data")
            elif 'Daily Max 1-hour NO2 Concentration' in df.columns:
                pollutant = 'NO2'
                conc_col = 'Daily Max 1-hour NO2 Concentration'
                print(f"   Type: NO2 data")
            else:
                print(f"   ⚠️  Unknown format, skipping")
                continue
            
            # Process each row
            for _, row in df.iterrows():
                try:
                    # Parse date - handle different formats
                    date_str = str(row.get('Date', ''))
                    if '/' in date_str:
                        # Format: MM/DD/YYYY
                        date_obj = datetime.strptime(date_str, '%m/%d/%Y')
                        formatted_date = date_obj.strftime('%Y-%m-%d')
                    else:
                        formatted_date = date_str
                    
                    location = str(row.get('Local Site Name', row.get('Site Name', 'Unknown'))).strip()
                    state = str(row.get('State', '')).strip()
                    county = str(row.get('County', '')).strip()
                    
                    concentration = float(row.get(conc_col, 0))
                    aqi = int(row.get('Daily AQI Value', 0))
                    
                    lat = float(row.get('Site Latitude', 0))
                    lon = float(row.get('Site Longitude', 0))
                    
                    # Determine AQI category
                    if aqi <= 50:
                        category = 'Good'
                    elif aqi <= 100:
                        category = 'Moderate'
                    elif aqi <= 150:
                        category = 'Unhealthy for Sensitive Groups'
                    elif aqi <= 200:
                        category = 'Unhealthy'
                    elif aqi <= 300:
                        category = 'Very Unhealthy'
                    else:
                        category = 'Hazardous'
                    
                    all_data.append({
                        'date': formatted_date,
                        'location': location,
                        'state': state,
                        'county': county,
                        'pollutant': pollutant,
                        'concentration': concentration,
                        'aqi': aqi,
                        'category': category,
                        'latitude': lat,
                        'longitude': lon,
                        'year': date_obj.year if '/' in date_str else int(formatted_date[:4])
                    })
                    
                except Exception as e:
                    continue
            
            print(f"   ✅ Processed {len(df)} rows")
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    result_df = pd.DataFrame(all_data)
    return result_df


def load_2025_data():
    """Load 2025 data from existing data directory"""
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data', '2025')
    
    if not os.path.exists(data_dir):
        print(f"⚠️  2025 data not found at {data_dir}")
        return pd.DataFrame()
    
    csv_files = glob.glob(os.path.join(data_dir, '*'))
    
    all_data = []
    
    for file_path in csv_files:
        if not os.path.isfile(file_path):
            continue
        
        try:
            df = pd.read_csv(file_path)
            
            # Determine pollutant from filename
            filename = os.path.basename(file_path).lower()
            if '2.5' in filename or 'pm2.5' in filename:
                pollutant = 'PM2.5'
                conc_col = 'Daily Mean PM2.5 Concentration'
            elif 'ozone' in filename:
                pollutant = 'Ozone'
                conc_col = 'Daily Max 8-hour Ozone Concentration'
            elif 'no2' in filename:
                pollutant = 'NO2'
                conc_col = 'Daily Max 1-hour NO2 Concentration'
            else:
                continue
            
            for _, row in df.iterrows():
                try:
                    date_str = row.get('Date', '')
                    location = row.get('Local Site Name', row.get('Site Name', 'Unknown'))
                    state = row.get('State', '')
                    county = row.get('County', '')
                    concentration = float(row.get(conc_col, 0))
                    aqi = int(row.get('Daily AQI Value', 0))
                    lat = float(row.get('Site Latitude', 0))
                    lon = float(row.get('Site Longitude', 0))
                    
                    if aqi <= 50:
                        category = 'Good'
                    elif aqi <= 100:
                        category = 'Moderate'
                    elif aqi <= 150:
                        category = 'Unhealthy for Sensitive Groups'
                    elif aqi <= 200:
                        category = 'Unhealthy'
                    elif aqi <= 300:
                        category = 'Very Unhealthy'
                    else:
                        category = 'Hazardous'
                    
                    all_data.append({
                        'date': date_str,
                        'location': location,
                        'state': state,
                        'county': county,
                        'pollutant': pollutant,
                        'concentration': concentration,
                        'aqi': aqi,
                        'category': category,
                        'latitude': lat,
                        'longitude': lon,
                        'year': 2025
                    })
                except Exception:
                    continue
        
        except Exception:
            continue
    
    return pd.DataFrame(all_data)


def combine_and_export():
    """Combine historical and 2025 data, export for training"""
    print("=" * 60)
    print("Loading Historical Air Quality Data (2020-2025)")
    print("=" * 60)
    
    # Load historical data (2020-2024)
    print("\n📊 Loading 2020-2024 historical data...")
    historical_df = load_historical_csvs()
    
    if len(historical_df) > 0:
        print(f"\n✅ Loaded {len(historical_df)} historical observations")
        print(f"   Years: {sorted(historical_df['year'].unique())}")
        print(f"   Locations: {historical_df['location'].nunique()}")
        print(f"   Pollutants: {', '.join(historical_df['pollutant'].unique())}")
    else:
        print("⚠️  No historical data loaded")
    
    # Load 2025 data
    print("\n📊 Loading 2025 data...")
    data_2025 = load_2025_data()
    
    if len(data_2025) > 0:
        print(f"\n✅ Loaded {len(data_2025)} observations from 2025")
        print(f"   Locations: {data_2025['location'].nunique()}")
        print(f"   Pollutants: {', '.join(data_2025['pollutant'].unique())}")
    else:
        print("⚠️  No 2025 data found")
    
    # Combine datasets
    if len(historical_df) > 0 and len(data_2025) > 0:
        combined_df = pd.concat([historical_df, data_2025], ignore_index=True)
    elif len(historical_df) > 0:
        combined_df = historical_df
    elif len(data_2025) > 0:
        combined_df = data_2025
    else:
        print("\n❌ No data available!")
        return None
    
    # Sort by date
    combined_df = combined_df.sort_values('date')
    
    print("\n" + "=" * 60)
    print("Combined Dataset Summary")
    print("=" * 60)
    print(f"\n📊 Total Observations: {len(combined_df):,}")
    print(f"📅 Date Range: {combined_df['date'].min()} to {combined_df['date'].max()}")
    print(f"📍 Unique Locations: {combined_df['location'].nunique()}")
    print(f"🗺️  States: {', '.join(combined_df['state'].unique())}")
    print(f"🧪 Pollutants: {', '.join(combined_df['pollutant'].unique())}")
    
    # Year breakdown
    print(f"\n📆 Observations by Year:")
    year_counts = combined_df['year'].value_counts().sort_index()
    for year, count in year_counts.items():
        print(f"   {year}: {count:,} observations")
    
    # Pollutant breakdown
    print(f"\n🧪 Observations by Pollutant:")
    pollutant_counts = combined_df['pollutant'].value_counts()
    for pollutant, count in pollutant_counts.items():
        print(f"   {pollutant}: {count:,} observations")
    
    # Export combined data
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    os.makedirs(output_dir, exist_ok=True)
    
    # Export to CSV
    csv_path = os.path.join(output_dir, 'combined-historical-2020-2025.csv')
    combined_df.to_csv(csv_path, index=False)
    print(f"\n💾 Exported to CSV: {csv_path}")
    
    # Export latest observations to JSON (for API)
    latest_df = combined_df.sort_values('date').groupby(['location', 'pollutant']).last().reset_index()
    
    json_data = []
    for _, row in latest_df.iterrows():
        json_data.append({
            'location': row['location'],
            'state': row['state'],
            'county': row['county'],
            'pollutant': row['pollutant'],
            'aqi': int(row['aqi']),
            'concentration': float(row['concentration']),
            'category': row['category'],
            'date': row['date'],
            'latitude': float(row['latitude']),
            'longitude': float(row['longitude'])
        })
    
    json_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data-combined-latest.json')
    with open(json_path, 'w') as f:
        json.dump(json_data, f, indent=2)
    
    print(f"💾 Exported latest observations to JSON: {json_path}")
    print(f"   Latest observations: {len(json_data)}")
    
    # Statistics
    print("\n" + "=" * 60)
    print("Data Quality Metrics")
    print("=" * 60)
    
    print(f"\n📊 AQI Distribution:")
    print(f"   Average AQI: {combined_df['aqi'].mean():.1f}")
    print(f"   Median AQI: {combined_df['aqi'].median():.1f}")
    print(f"   Min AQI: {combined_df['aqi'].min()}")
    print(f"   Max AQI: {combined_df['aqi'].max()}")
    
    print(f"\n📊 AQI Categories:")
    category_counts = combined_df['category'].value_counts()
    for category, count in category_counts.items():
        pct = (count / len(combined_df)) * 100
        print(f"   {category}: {count:,} ({pct:.1f}%)")
    
    print("\n" + "=" * 60)
    print("✅ Data Ready for Training!")
    print("=" * 60)
    print(f"\n🚀 Next Steps:")
    print(f"   1. Train Qwen model: python scripts/train-with-qwen.py")
    print(f"   2. Model will use {len(combined_df):,} observations from 2020-2025")
    print(f"   3. This includes {len(historical_df):,} historical + {len(data_2025):,} recent observations")
    
    return combined_df


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "stats":
            # Just show statistics
            df = combine_and_export()
        else:
            print("Unknown command. Use: python load-historical-data.py")
    else:
        # Default: combine and export
        combine_and_export()
