"""
Machine Learning Model Training Script for AQI Prediction
Trains on 2025 DMV region air quality data (Maryland, Virginia, DC)
"""

import os
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import json

# Configuration
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', '2025')
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# Mapping CSV files to their data types
DATA_FILES = {
    'maryland_pm25': 'Maryland2.5',
    'maryland_ozone': 'MarylandOzone.csv',
    'maryland_no2': 'Marylandno2.csv',
    'virginia_no2': 'VirginiaNo2.csv',
    'dc_pm25': 'DC2.5',
    'dc_ozone': 'DistrictOfColumbiaOzone.csv',
    'dc_no2': 'DistrictofcolumbiaNO2.csv'
}


def load_and_process_data():
    """Load all CSV files and combine into a single dataset"""
    all_data = []
    
    for data_type, filename in DATA_FILES.items():
        filepath = os.path.join(DATA_DIR, filename)
        if not os.path.exists(filepath):
            print(f"⚠️  Warning: {filename} not found at {filepath}")
            continue
        
        print(f"📁 Loading {filename}...")
        try:
            df = pd.read_csv(filepath)
            
            # Add pollutant type
            if 'pm25' in data_type or 'PM2.5' in filename:
                df['pollutant'] = 'PM2.5'
                df['concentration'] = df.get('Daily Mean PM2.5 Concentration', df.get('concentration', 0))
            elif 'ozone' in data_type or 'Ozone' in filename:
                df['pollutant'] = 'Ozone'
                # Convert ppm to ppb for consistency
                if 'Daily Max 8-hour Ozone Concentration' in df.columns:
                    df['concentration'] = pd.to_numeric(df['Daily Max 8-hour Ozone Concentration'], errors='coerce') * 1000
            elif 'no2' in data_type or 'NO2' in filename:
                df['pollutant'] = 'NO2'
                df['concentration'] = df.get('Daily Max 1-hour NO2 Concentration', df.get('concentration', 0))
            
            # Standardize column names
            df = df.rename(columns={
                'Date': 'date',
                'Daily AQI Value': 'aqi',
                'Local Site Name': 'site_name',
                'Site Latitude': 'latitude',
                'Site Longitude': 'longitude',
                'State': 'state',
                'County': 'county'
            })
            
            # Keep relevant columns
            cols = ['date', 'aqi', 'concentration', 'pollutant', 'site_name', 
                   'latitude', 'longitude', 'state', 'county']
            df = df[[col for col in cols if col in df.columns]]
            
            all_data.append(df)
            print(f"✅ Loaded {len(df)} records from {filename}")
            
        except Exception as e:
            print(f"❌ Error loading {filename}: {e}")
            continue
    
    if not all_data:
        raise ValueError("No data files found! Please ensure CSV files are in the data/2025 directory.")
    
    # Combine all data
    combined_df = pd.concat(all_data, ignore_index=True)
    print(f"\n📊 Total records loaded: {len(combined_df)}")
    print(f"📊 Date range: {combined_df['date'].min()} to {combined_df['date'].max()}")
    print(f"📊 Pollutants: {combined_df['pollutant'].unique()}")
    print(f"📊 States: {combined_df['state'].unique()}")
    
    return combined_df


def engineer_features(df):
    """Create features for the model"""
    df = df.copy()
    
    # Parse date
    df['date'] = pd.to_datetime(df['date'], format='%m/%d/%Y', errors='coerce')
    
    # Temporal features
    df['month'] = df['date'].dt.month
    df['day_of_week'] = df['date'].dt.dayofweek
    df['day_of_year'] = df['date'].dt.dayofyear
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
    
    # Season (meteorological)
    df['season'] = df['month'].map({
        12: 0, 1: 0, 2: 0,  # Winter
        3: 1, 4: 1, 5: 1,   # Spring
        6: 2, 7: 2, 8: 2,   # Summer
        9: 3, 10: 3, 11: 3  # Fall
    })
    
    # One-hot encode pollutant type
    pollutant_dummies = pd.get_dummies(df['pollutant'], prefix='pollutant')
    df = pd.concat([df, pollutant_dummies], axis=1)
    
    # Convert concentration to numeric
    df['concentration'] = pd.to_numeric(df['concentration'], errors='coerce')
    
    # Remove rows with missing critical data
    df = df.dropna(subset=['aqi', 'concentration', 'latitude', 'longitude'])
    
    # Convert AQI to numeric
    df['aqi'] = pd.to_numeric(df['aqi'], errors='coerce')
    
    return df


def prepare_training_data(df):
    """Prepare features and target for model training"""
    # Feature columns
    feature_cols = [
        'concentration', 'latitude', 'longitude',
        'month', 'day_of_week', 'day_of_year', 'is_weekend', 'season'
    ]
    
    # Add pollutant dummy columns
    pollutant_cols = [col for col in df.columns if col.startswith('pollutant_')]
    feature_cols.extend(pollutant_cols)
    
    # Prepare X and y
    X = df[feature_cols].copy()
    y = df['aqi'].copy()
    
    # Handle any remaining NaN values
    X = X.fillna(X.mean())
    
    print(f"\n🔧 Features used: {feature_cols}")
    print(f"🔧 Training samples: {len(X)}")
    print(f"🔧 AQI range: {y.min():.1f} - {y.max():.1f}")
    
    return X, y, feature_cols


def train_models(X, y):
    """Train multiple models and select the best one"""
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    models = {
        'Random Forest': RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        ),
        'Gradient Boosting': GradientBoostingRegressor(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            random_state=42
        )
    }
    
    results = {}
    trained_models = {}
    
    print("\n🤖 Training models...")
    for name, model in models.items():
        print(f"\n  Training {name}...")
        model.fit(X_train_scaled, y_train)
        
        # Predictions
        y_pred_train = model.predict(X_train_scaled)
        y_pred_test = model.predict(X_test_scaled)
        
        # Metrics
        results[name] = {
            'train_mae': mean_absolute_error(y_train, y_pred_train),
            'test_mae': mean_absolute_error(y_test, y_pred_test),
            'train_rmse': np.sqrt(mean_squared_error(y_train, y_pred_train)),
            'test_rmse': np.sqrt(mean_squared_error(y_test, y_pred_test)),
            'train_r2': r2_score(y_train, y_pred_train),
            'test_r2': r2_score(y_test, y_pred_test)
        }
        
        trained_models[name] = model
        
        print(f"    Train MAE: {results[name]['train_mae']:.2f}")
        print(f"    Test MAE:  {results[name]['test_mae']:.2f}")
        print(f"    Test R²:   {results[name]['test_r2']:.3f}")
    
    # Select best model based on test MAE
    best_model_name = min(results, key=lambda k: results[k]['test_mae'])
    best_model = trained_models[best_model_name]
    
    print(f"\n🏆 Best model: {best_model_name}")
    print(f"   Test MAE: {results[best_model_name]['test_mae']:.2f}")
    print(f"   Test RMSE: {results[best_model_name]['test_rmse']:.2f}")
    print(f"   Test R²: {results[best_model_name]['test_r2']:.3f}")
    
    return best_model, scaler, results, best_model_name


def save_model(model, scaler, feature_cols, model_name, metrics):
    """Save the trained model and metadata"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    # Save model
    model_path = os.path.join(MODEL_DIR, f'aqi_model_{timestamp}.pkl')
    joblib.dump(model, model_path)
    print(f"\n💾 Model saved to: {model_path}")
    
    # Save scaler
    scaler_path = os.path.join(MODEL_DIR, f'aqi_scaler_{timestamp}.pkl')
    joblib.dump(scaler, scaler_path)
    print(f"💾 Scaler saved to: {scaler_path}")
    
    # Save metadata
    metadata = {
        'timestamp': timestamp,
        'model_type': model_name,
        'feature_columns': feature_cols,
        'metrics': metrics,
        'training_data_year': 2025,
        'model_path': model_path,
        'scaler_path': scaler_path
    }
    
    metadata_path = os.path.join(MODEL_DIR, f'model_metadata_{timestamp}.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"💾 Metadata saved to: {metadata_path}")
    
    # Also save as "latest" for easy loading
    latest_model_path = os.path.join(MODEL_DIR, 'aqi_model_latest.pkl')
    latest_scaler_path = os.path.join(MODEL_DIR, 'aqi_scaler_latest.pkl')
    latest_metadata_path = os.path.join(MODEL_DIR, 'model_metadata_latest.json')
    
    joblib.dump(model, latest_model_path)
    joblib.dump(scaler, latest_scaler_path)
    with open(latest_metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"💾 Latest model links created")
    
    return model_path, scaler_path, metadata_path


def main():
    """Main training pipeline"""
    print("=" * 60)
    print("🚀 AQI Prediction Model Training Pipeline")
    print("=" * 60)
    
    # Load data
    print("\n📥 Step 1: Loading data...")
    df = load_and_process_data()
    
    # Engineer features
    print("\n🔧 Step 2: Engineering features...")
    df = engineer_features(df)
    
    # Prepare training data
    print("\n📊 Step 3: Preparing training data...")
    X, y, feature_cols = prepare_training_data(df)
    
    # Train models
    print("\n🤖 Step 4: Training models...")
    model, scaler, metrics, model_name = train_models(X, y)
    
    # Save model
    print("\n💾 Step 5: Saving model...")
    model_path, scaler_path, metadata_path = save_model(
        model, scaler, feature_cols, model_name, metrics
    )
    
    print("\n" + "=" * 60)
    print("✅ Training complete!")
    print("=" * 60)
    print(f"\n📦 Model files:")
    print(f"   - Model: {model_path}")
    print(f"   - Scaler: {scaler_path}")
    print(f"   - Metadata: {metadata_path}")
    print(f"\n💡 To use this model in predictions, load:")
    print(f"   - models/aqi_model_latest.pkl")
    print(f"   - models/aqi_scaler_latest.pkl")
    print(f"   - models/model_metadata_latest.json")


if __name__ == "__main__":
    main()
