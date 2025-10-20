"""
AQI Prediction Script using Trained ML Model
Uses the trained model to predict AQI values based on pollutant concentrations
"""

import os
import joblib
import json
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, Any, List


class AQIPredictor:
    """Class to load trained model and make predictions"""
    
    def __init__(self, model_dir: str = None):
        if model_dir is None:
            model_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
        
        self.model_dir = model_dir
        self.model = None
        self.scaler = None
        self.metadata = None
        self.feature_cols = None
        
        self._load_model()
    
    def _load_model(self):
        """Load the trained model, scaler, and metadata"""
        model_path = os.path.join(self.model_dir, 'aqi_model_latest.pkl')
        scaler_path = os.path.join(self.model_dir, 'aqi_scaler_latest.pkl')
        metadata_path = os.path.join(self.model_dir, 'model_metadata_latest.json')
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model not found at {model_path}. "
                "Please run train-aqi-model.py first."
            )
        
        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)
        
        with open(metadata_path, 'r') as f:
            self.metadata = json.load(f)
        
        self.feature_cols = self.metadata['feature_columns']
        
        print(f"✅ Model loaded: {self.metadata['model_type']}")
        print(f"   Trained: {self.metadata['timestamp']}")
        print(f"   Test MAE: {self.metadata['metrics'][self.metadata['model_type']]['test_mae']:.2f}")
    
    def predict(self, 
                concentration: float,
                pollutant: str,
                latitude: float,
                longitude: float,
                date: datetime = None) -> Dict[str, Any]:
        """
        Predict AQI from input features
        
        Args:
            concentration: Pollutant concentration (ug/m3 for PM2.5, ppb for NO2/Ozone)
            pollutant: Type of pollutant ('PM2.5', 'NO2', 'Ozone')
            latitude: Location latitude
            longitude: Location longitude
            date: Date for prediction (defaults to now)
        
        Returns:
            Dictionary with predicted AQI and confidence metrics
        """
        if date is None:
            date = datetime.now()
        
        # Extract temporal features
        month = date.month
        day_of_week = date.weekday()
        day_of_year = date.timetuple().tm_yday
        is_weekend = 1 if day_of_week in [5, 6] else 0
        
        # Season (meteorological)
        season_map = {
            12: 0, 1: 0, 2: 0,  # Winter
            3: 1, 4: 1, 5: 1,   # Spring
            6: 2, 7: 2, 8: 2,   # Summer
            9: 3, 10: 3, 11: 3  # Fall
        }
        season = season_map[month]
        
        # Create feature dictionary
        features = {
            'concentration': concentration,
            'latitude': latitude,
            'longitude': longitude,
            'month': month,
            'day_of_week': day_of_week,
            'day_of_year': day_of_year,
            'is_weekend': is_weekend,
            'season': season,
        }
        
        # Add pollutant one-hot encoding
        for col in self.feature_cols:
            if col.startswith('pollutant_'):
                pollutant_type = col.replace('pollutant_', '')
                features[col] = 1 if pollutant_type == pollutant else 0
        
        # Create DataFrame with correct column order
        X = pd.DataFrame([features])[self.feature_cols]
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        # Predict
        aqi_pred = self.model.predict(X_scaled)[0]
        
        # Ensure AQI is in valid range
        aqi_pred = max(0, min(500, aqi_pred))
        
        return {
            'aqi': round(aqi_pred),
            'concentration': concentration,
            'pollutant': pollutant,
            'location': {'lat': latitude, 'lon': longitude},
            'date': date.isoformat(),
            'category': self._get_aqi_category(aqi_pred)
        }
    
    def predict_batch(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Predict AQI for multiple inputs
        
        Args:
            data: List of dictionaries with keys: concentration, pollutant, latitude, longitude, date
        
        Returns:
            List of prediction dictionaries
        """
        return [self.predict(**item) for item in data]
    
    @staticmethod
    def _get_aqi_category(aqi: float) -> str:
        """Get AQI category from numeric value"""
        if aqi <= 50:
            return "Good"
        elif aqi <= 100:
            return "Moderate"
        elif aqi <= 150:
            return "Unhealthy for Sensitive Groups"
        elif aqi <= 200:
            return "Unhealthy"
        elif aqi <= 300:
            return "Very Unhealthy"
        else:
            return "Hazardous"


def example_predictions():
    """Example usage of the AQI predictor"""
    print("=" * 60)
    print("🔮 AQI Prediction Examples")
    print("=" * 60)
    
    try:
        predictor = AQIPredictor()
        
        # Example predictions for DMV locations
        test_cases = [
            {
                'concentration': 8.5,
                'pollutant': 'PM2.5',
                'latitude': 38.9072,
                'longitude': -77.0369,
                'date': datetime(2025, 7, 15)  # Summer day
            },
            {
                'concentration': 25.0,
                'pollutant': 'NO2',
                'latitude': 39.2904,
                'longitude': -76.6122,
                'date': datetime(2025, 1, 10)  # Winter day
            },
            {
                'concentration': 0.045,  # ppm converted to ppb: 45
                'pollutant': 'Ozone',
                'latitude': 38.8048,
                'longitude': -77.0469,
                'date': datetime(2025, 8, 20)  # Late summer
            }
        ]
        
        locations = ['Washington DC', 'Baltimore MD', 'Alexandria VA']
        
        print("\n📍 Test Predictions:\n")
        for i, (case, location) in enumerate(zip(test_cases, locations), 1):
            result = predictor.predict(**case)
            print(f"{i}. {location} - {result['pollutant']}")
            print(f"   Concentration: {result['concentration']}")
            print(f"   Predicted AQI: {result['aqi']} ({result['category']})")
            print(f"   Date: {case['date'].strftime('%Y-%m-%d')}")
            print()
        
    except FileNotFoundError as e:
        print(f"\n❌ Error: {e}")
        print("\n💡 Please run: python scripts/train-aqi-model.py")


if __name__ == "__main__":
    example_predictions()
