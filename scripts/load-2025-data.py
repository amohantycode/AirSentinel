"""
Load 2025 DMV air quality data and convert to JSON for the Next.js app
"""

import pandas as pd
import json
import os
from datetime import datetime
import glob

def load_all_2025_data():
    """Load all 2025 CSV files and combine them"""
    
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data', '2025')
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
            elif 'ozone' in filename:
                pollutant = 'Ozone'
            elif 'no2' in filename:
                pollutant = 'NO2'
            else:
                continue
            
            # Process each row
            for _, row in df.iterrows():
                try:
                    # Parse data
                    date_str = row.get('Date', '')
                    location = row.get('Local Site Name', row.get('Site Name', 'Unknown'))
                    state = row.get('State', '')
                    county = row.get('County', '')
                    lat = row.get('Site Latitude', 0)
                    lon = row.get('Site Longitude', 0)
                    
                    # Get concentration value
                    if pollutant == 'PM2.5':
                        concentration = float(row.get('Daily Mean PM2.5 Concentration', 0))
                    elif pollutant == 'Ozone':
                        concentration = float(row.get('Daily Max 8-hour Ozone Concentration', 0))
                    elif pollutant == 'NO2':
                        concentration = float(row.get('Daily Mean NO2 Concentration', 0))
                    else:
                        continue
                    
                    aqi = int(row.get('Daily AQI Value', 0))
                    
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
                        'date': date_str,
                        'location': location,
                        'state': state,
                        'county': county,
                        'latitude': float(lat),
                        'longitude': float(lon),
                        'pollutant': pollutant,
                        'concentration': concentration,
                        'aqi': aqi,
                        'category': category
                    })
                except Exception as e:
                    continue
        
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    return all_data


def get_latest_observations():
    """Get the most recent observation for each location"""
    
    all_data = load_all_2025_data()
    
    # Convert to DataFrame for easier processing
    df = pd.DataFrame(all_data)
    
    # Parse dates
    df['date'] = pd.to_datetime(df['date'], format='%m/%d/%Y')
    
    # Get most recent data for each location-pollutant combination
    latest = df.sort_values('date').groupby(['location', 'pollutant']).last().reset_index()
    
    # Convert date to string for JSON serialization
    latest['date'] = latest['date'].dt.strftime('%Y-%m-%d')
    
    # Convert to list of dicts
    return latest.to_dict('records')


def get_observations_by_date(date_str=None):
    """Get observations for a specific date (default: latest)"""
    
    all_data = load_all_2025_data()
    df = pd.DataFrame(all_data)
    df['date'] = pd.to_datetime(df['date'], format='%m/%d/%Y')
    
    if date_str:
        target_date = pd.to_datetime(date_str)
        df = df[df['date'] == target_date]
    else:
        # Get latest date
        latest_date = df['date'].max()
        df = df[df['date'] == latest_date]
    
    # Convert date to string for JSON serialization
    df['date'] = df['date'].dt.strftime('%Y-%m-%d')
    
    return df.to_dict('records')


def get_location_history(location, pollutant=None, days=30):
    """Get historical data for a specific location"""
    
    all_data = load_all_2025_data()
    df = pd.DataFrame(all_data)
    df['date'] = pd.to_datetime(df['date'], format='%m/%d/%Y')
    
    # Filter by location
    df = df[df['location'] == location]
    
    # Filter by pollutant if specified
    if pollutant:
        df = df[df['pollutant'] == pollutant]
    
    # Get last N days
    df = df.sort_values('date').tail(days)
    
    # Convert date to string for JSON serialization
    df['date'] = df['date'].dt.strftime('%Y-%m-%d')
    
    return df.to_dict('records')


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == 'latest':
            data = get_latest_observations()
            print(json.dumps(data, indent=2))
        
        elif command == 'date' and len(sys.argv) > 2:
            date = sys.argv[2]
            data = get_observations_by_date(date)
            print(json.dumps(data, indent=2))
        
        elif command == 'history' and len(sys.argv) > 2:
            location = sys.argv[2]
            pollutant = sys.argv[3] if len(sys.argv) > 3 else None
            data = get_location_history(location, pollutant)
            print(json.dumps(data, indent=2))
        
        else:
            print("Usage:")
            print("  python load-2025-data.py latest")
            print("  python load-2025-data.py date YYYY-MM-DD")
            print("  python load-2025-data.py history 'Location Name' [pollutant]")
    else:
        # Default: output latest observations
        data = get_latest_observations()
        print(json.dumps(data, indent=2))
