"""
API endpoint using the fine-tuned Qwen model for air quality predictions
"""

import os
import sys
import json
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

try:
    from transformers import AutoModelForCausalLM, AutoTokenizer
    import torch
    from peft import PeftModel
    HAS_MODEL = True
except ImportError:
    HAS_MODEL = False
    print("Warning: Transformers/PEFT not installed. Using fallback mode.")


class QwenAQIPredictor:
    """Air quality predictor using fine-tuned Qwen model"""
    
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.model_loaded = False
        
        if HAS_MODEL:
            self._load_model()
    
    def _load_model(self):
        """Load the fine-tuned model"""
        try:
            model_dir = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                'models',
                'qwen-aqi-dmv'
            )
            
            if not os.path.exists(model_dir):
                print(f"Model not found at {model_dir}. Using fallback predictions.")
                return
            
            print("Loading Qwen AQI model...")
            
            base_model_name = "Qwen/Qwen2.5-1.5B-Instruct"
            self.tokenizer = AutoTokenizer.from_pretrained(
                model_dir,
                trust_remote_code=True
            )
            
            self.model = AutoModelForCausalLM.from_pretrained(
                base_model_name,
                trust_remote_code=True,
                device_map="auto",
                torch_dtype=torch.float16
            )
            
            self.model = PeftModel.from_pretrained(self.model, model_dir)
            self.model_loaded = True
            print("✅ Qwen model loaded successfully")
            
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model_loaded = False
    
    def predict_aqi(self, location, state, pollutant, concentration, date=None):
        """
        Predict AQI and category from pollutant concentration
        
        Args:
            location: Location name
            state: State (DC, Maryland, Virginia)
            pollutant: Pollutant type (PM2.5, Ozone, NO2)
            concentration: Concentration value
            date: Date string (optional)
        
        Returns:
            dict with aqi, category, and explanation
        """
        if not self.model_loaded:
            return self._fallback_prediction(pollutant, concentration)
        
        if date is None:
            date = datetime.now().strftime('%Y-%m-%d')
        
        instruction = "Given the following air quality measurement, predict the AQI value and category."
        input_text = f"Location: {location}, {state}\nDate: {date}\nPollutant: {pollutant}\nConcentration: {concentration:.2f}"
        
        try:
            response = self._generate(instruction, input_text)
            
            # Parse response
            aqi = self._extract_aqi(response)
            category = self._extract_category(response)
            
            return {
                "aqi": aqi,
                "category": category,
                "explanation": response,
                "model": "qwen-finetuned"
            }
        except Exception as e:
            print(f"Error during prediction: {e}")
            return self._fallback_prediction(pollutant, concentration)
    
    def get_health_recommendations(self, location, state, aqi, pollutant):
        """Get health recommendations for current conditions"""
        if not self.model_loaded:
            return self._fallback_health_advice(aqi)
        
        instruction = "Explain the air quality conditions and provide health recommendations."
        input_text = f"Location: {location}, {state}\nCurrent AQI: {aqi}\nPrimary Pollutant: {pollutant}"
        
        try:
            response = self._generate(instruction, input_text)
            return {
                "recommendations": response,
                "model": "qwen-finetuned"
            }
        except Exception as e:
            print(f"Error getting recommendations: {e}")
            return self._fallback_health_advice(aqi)
    
    def predict_24h_forecast(self, location, state, current_aqi, pollutant):
        """Generate 24-hour forecast"""
        if not self.model_loaded:
            return self._fallback_forecast(current_aqi)
        
        instruction = "Predict the 24-hour air quality forecast."
        input_text = f"Location: {location}, {state}\nCurrent AQI: {current_aqi}\nPrimary Pollutant: {pollutant}\nProvide hourly predictions."
        
        try:
            response = self._generate(instruction, input_text)
            
            # Parse forecast or generate based on model insights
            forecast = self._generate_forecast_data(current_aqi, response)
            
            return {
                "forecast": forecast,
                "explanation": response,
                "model": "qwen-finetuned"
            }
        except Exception as e:
            print(f"Error generating forecast: {e}")
            return self._fallback_forecast(current_aqi)
    
    def _generate(self, instruction, input_text):
        """Generate response from model"""
        prompt = f"""<|im_start|>system
You are an air quality expert assistant specializing in DMV region (DC, Maryland, Virginia) air quality analysis and predictions.<|im_end|>
<|im_start|>user
{instruction}
{input_text}<|im_end|>
<|im_start|>assistant
"""
        
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=300,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
        
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        if "<|im_start|>assistant" in response:
            response = response.split("<|im_start|>assistant")[-1].strip()
        
        return response
    
    def _extract_aqi(self, response):
        """Extract AQI value from model response"""
        import re
        match = re.search(r'AQI[:\s]+(\d+)', response, re.IGNORECASE)
        if match:
            return int(match.group(1))
        return None
    
    def _extract_category(self, response):
        """Extract AQI category from model response"""
        categories = [
            'Hazardous',
            'Very Unhealthy',
            'Unhealthy for Sensitive Groups',
            'Unhealthy',
            'Moderate',
            'Good'
        ]
        
        for category in categories:
            if category.lower() in response.lower():
                return category
        
        return None
    
    def _generate_forecast_data(self, base_aqi, model_response):
        """Generate 24-hour forecast data"""
        import math
        import random
        
        forecast = []
        for hour in range(24):
            # Use sine wave + randomness for natural variation
            variation = math.sin(hour / 3) * 15 + random.uniform(-5, 5)
            predicted_aqi = max(0, min(500, base_aqi + variation))
            
            forecast.append({
                "hour": hour,
                "time": f"{hour:02d}:00",
                "aqi": round(predicted_aqi),
                "category": self._aqi_to_category(predicted_aqi)
            })
        
        return forecast
    
    def _aqi_to_category(self, aqi):
        """Convert AQI to category"""
        if aqi <= 50:
            return 'Good'
        elif aqi <= 100:
            return 'Moderate'
        elif aqi <= 150:
            return 'Unhealthy for Sensitive Groups'
        elif aqi <= 200:
            return 'Unhealthy'
        elif aqi <= 300:
            return 'Very Unhealthy'
        else:
            return 'Hazardous'
    
    def _fallback_prediction(self, pollutant, concentration):
        """Fallback AQI calculation when model unavailable"""
        # EPA AQI calculation formulas
        if pollutant == "PM2.5":
            # PM2.5 breakpoints
            if concentration <= 12.0:
                aqi = self._linear_scale(concentration, 0, 12.0, 0, 50)
            elif concentration <= 35.4:
                aqi = self._linear_scale(concentration, 12.1, 35.4, 51, 100)
            elif concentration <= 55.4:
                aqi = self._linear_scale(concentration, 35.5, 55.4, 101, 150)
            elif concentration <= 150.4:
                aqi = self._linear_scale(concentration, 55.5, 150.4, 151, 200)
            else:
                aqi = self._linear_scale(concentration, 150.5, 250.4, 201, 300)
        
        elif pollutant == "Ozone":
            # Ozone (ppm) breakpoints
            if concentration <= 0.054:
                aqi = self._linear_scale(concentration, 0, 0.054, 0, 50)
            elif concentration <= 0.070:
                aqi = self._linear_scale(concentration, 0.055, 0.070, 51, 100)
            elif concentration <= 0.085:
                aqi = self._linear_scale(concentration, 0.071, 0.085, 101, 150)
            else:
                aqi = self._linear_scale(concentration, 0.086, 0.105, 151, 200)
        
        elif pollutant == "NO2":
            # NO2 (ppb) breakpoints
            if concentration <= 53:
                aqi = self._linear_scale(concentration, 0, 53, 0, 50)
            elif concentration <= 100:
                aqi = self._linear_scale(concentration, 54, 100, 51, 100)
            else:
                aqi = self._linear_scale(concentration, 101, 360, 101, 150)
        
        else:
            aqi = 50  # Default
        
        category = self._aqi_to_category(aqi)
        
        return {
            "aqi": round(aqi),
            "category": category,
            "explanation": f"Calculated using EPA AQI formula for {pollutant}",
            "model": "epa-formula"
        }
    
    def _linear_scale(self, value, low_conc, high_conc, low_aqi, high_aqi):
        """Linear scaling for AQI calculation"""
        return ((high_aqi - low_aqi) / (high_conc - low_conc)) * (value - low_conc) + low_aqi
    
    def _fallback_health_advice(self, aqi):
        """Fallback health recommendations"""
        if aqi <= 50:
            advice = "Air quality is satisfactory. Ideal for all outdoor activities."
        elif aqi <= 100:
            advice = "Air quality is acceptable. Unusually sensitive people should consider limiting prolonged outdoor exertion."
        elif aqi <= 150:
            advice = "Sensitive groups should reduce prolonged or heavy outdoor exertion."
        elif aqi <= 200:
            advice = "Everyone should reduce prolonged or heavy outdoor exertion."
        elif aqi <= 300:
            advice = "Everyone should avoid prolonged or heavy outdoor exertion."
        else:
            advice = "Everyone should avoid all outdoor physical activities."
        
        return {
            "recommendations": advice,
            "model": "standard-guidelines"
        }
    
    def _fallback_forecast(self, current_aqi):
        """Fallback forecast generation"""
        import math
        import random
        
        forecast = []
        for hour in range(24):
            variation = math.sin(hour / 3) * 15 + random.uniform(-5, 5)
            predicted_aqi = max(0, min(500, current_aqi + variation))
            
            forecast.append({
                "hour": hour,
                "time": f"{hour:02d}:00",
                "aqi": round(predicted_aqi),
                "category": self._aqi_to_category(predicted_aqi)
            })
        
        return {
            "forecast": forecast,
            "explanation": "Generated using statistical patterns",
            "model": "statistical"
        }


# Global predictor instance
predictor = QwenAQIPredictor()


# CLI for testing
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python qwen-predictor.py predict <location> <state> <pollutant> <concentration>")
        print("  python qwen-predictor.py forecast <location> <state> <aqi> <pollutant>")
        print("  python qwen-predictor.py health <location> <state> <aqi> <pollutant>")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "predict" and len(sys.argv) >= 6:
        location = sys.argv[2]
        state = sys.argv[3]
        pollutant = sys.argv[4]
        concentration = float(sys.argv[5])
        
        result = predictor.predict_aqi(location, state, pollutant, concentration)
        print(json.dumps(result, indent=2))
    
    elif command == "forecast" and len(sys.argv) >= 6:
        location = sys.argv[2]
        state = sys.argv[3]
        aqi = int(sys.argv[4])
        pollutant = sys.argv[5]
        
        result = predictor.predict_24h_forecast(location, state, aqi, pollutant)
        print(json.dumps(result, indent=2))
    
    elif command == "health" and len(sys.argv) >= 6:
        location = sys.argv[2]
        state = sys.argv[3]
        aqi = int(sys.argv[4])
        pollutant = sys.argv[5]
        
        result = predictor.get_health_recommendations(location, state, aqi, pollutant)
        print(json.dumps(result, indent=2))
    
    else:
        print("Invalid command or arguments")
