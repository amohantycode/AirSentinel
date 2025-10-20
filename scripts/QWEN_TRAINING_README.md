# Qwen2.5-1.5B Air Quality Training

This directory contains scripts to fine-tune the **Qwen2.5-1.5B-Instruct** model on DMV (DC, Maryland, Virginia) air quality data for intelligent AQI predictions and analysis.

## 🤖 Model Information

- **Model**: [Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
- **Size**: 1.5 billion parameters
- **Task**: Fine-tuned for air quality prediction and analysis
- **Training Method**: LoRA (Low-Rank Adaptation) for efficient fine-tuning
- **Dataset**: 14,945 observations from 60+ EPA monitoring stations (2025 data)

## 📦 Installation

### 1. Install Required Packages

```bash
pip install transformers torch datasets accelerate peft bitsandbytes
```

### 2. System Requirements

- **GPU**: Recommended (NVIDIA GPU with CUDA support)
- **RAM**: 16GB+ recommended
- **Disk Space**: ~5GB for model and checkpoints
- **Python**: 3.8+

### For Apple Silicon (M1/M2/M3):
```bash
pip install torch torchvision torchaudio
pip install transformers datasets accelerate peft
```

## 🚀 Quick Start

### Step 1: Train the Model

```bash
cd scripts
python train-with-qwen.py
```

This will:
- Load 14,945 air quality observations from 2025 DMV data
- Generate ~30,000+ training examples (multiple formats per observation)
- Fine-tune Qwen2.5-1.5B using LoRA
- Save model to `models/qwen-aqi-dmv/`

**Training Time**: ~2-4 hours on GPU, longer on CPU

### Step 2: Test the Model

```bash
python test-qwen-model.py
```

This runs test cases including:
- AQI prediction from pollutant concentrations
- Health recommendations based on current conditions
- Location comparisons
- Historical pattern analysis

### Step 3: Use the Predictor

```bash
# Predict AQI from pollutant data
python qwen-predictor.py predict "River Terrace" "DC" "PM2.5" 25.5

# Generate 24-hour forecast
python qwen-predictor.py forecast "Baltimore" "Maryland" 85 "Ozone"

# Get health recommendations
python qwen-predictor.py health "Alexandria" "Virginia" 120 "PM2.5"
```

## 📊 Training Details

### Dataset

- **Source**: EPA AirNow monitoring stations
- **Locations**: 60+ stations across DC, Maryland, Virginia
- **Time Period**: January 1 - October 19, 2025
- **Observations**: 14,945 records
- **Pollutants**: PM2.5, Ozone, NO2

### Training Configuration

```python
{
  "model": "Qwen/Qwen2.5-1.5B-Instruct",
  "method": "LoRA fine-tuning",
  "lora_r": 16,
  "lora_alpha": 32,
  "target_modules": ["q_proj", "k_proj", "v_proj", "o_proj"],
  "epochs": 3,
  "batch_size": 4,
  "gradient_accumulation": 4,
  "learning_rate": 2e-4,
  "precision": "fp16"
}
```

### Training Prompts

The model is trained on three types of tasks:

1. **AQI Prediction**: Given location, date, pollutant, and concentration → predict AQI and category
2. **Health Analysis**: Given location, AQI, and pollutant → provide health recommendations
3. **Location Comparison**: Compare air quality between multiple DMV locations

## 🔌 Integration with App

### Update Forecast API

Replace the simple forecast generation in `app/api/forecasts/route.ts` with the Qwen predictor:

```typescript
// Add to API route
import { spawn } from 'child_process'

function getPrediction(location: string, state: string, aqi: number, pollutant: string) {
  return new Promise((resolve, reject) => {
    const python = spawn('python', [
      'scripts/qwen-predictor.py',
      'forecast',
      location,
      state,
      aqi.toString(),
      pollutant
    ])
    
    let data = ''
    python.stdout.on('data', (chunk) => data += chunk)
    python.on('close', () => resolve(JSON.parse(data)))
  })
}
```

### Update Forecast Page

The forecast page (`app/forecast/page.tsx`) can call the new API endpoint that uses Qwen predictions.

## 📁 File Structure

```
scripts/
├── train-with-qwen.py       # Training script
├── test-qwen-model.py        # Testing script
├── qwen-predictor.py         # Prediction API
└── QWEN_TRAINING_README.md   # This file

models/
└── qwen-aqi-dmv/            # Fine-tuned model (after training)
    ├── adapter_model.bin     # LoRA weights
    ├── adapter_config.json   # LoRA config
    ├── tokenizer_config.json # Tokenizer
    └── metadata.json         # Training metadata
```

## 🎯 Model Capabilities

After training, the model can:

### 1. Predict AQI from Raw Data
```
Input: Location: River Terrace, DC
       Date: 2025-10-19
       Pollutant: PM2.5
       Concentration: 25.5

Output: AQI: 78
        Category: Moderate
        This indicates moderate air quality conditions.
```

### 2. Generate Health Recommendations
```
Input: Location: Baltimore, Maryland
       Current AQI: 85
       Primary Pollutant: Ozone

Output: The current air quality in Baltimore is Moderate with an AQI 
        of 85. The primary pollutant is Ozone at 0.062 ppm. 
        Health Advice: Unusually sensitive people should consider 
        limiting prolonged outdoor exertion.
```

### 3. Create Forecasts
```
Input: Location: Alexandria, Virginia
       Current AQI: 120
       Primary Pollutant: PM2.5

Output: 24-hour forecast with hourly predictions, trends, and 
        health advisories based on DMV patterns.
```

## 🔧 Troubleshooting

### Out of Memory Error

If you encounter GPU memory issues:

```python
# In train-with-qwen.py, reduce batch size:
per_device_train_batch_size=2  # Instead of 4
gradient_accumulation_steps=8   # Instead of 4
```

### CPU Training

If no GPU available, the model will use CPU (much slower):

```python
# It will automatically use CPU if no GPU detected
# Training may take 12+ hours
```

### Model Not Loading

Ensure the model is downloaded:

```bash
python -c "from transformers import AutoModelForCausalLM; AutoModelForCausalLM.from_pretrained('Qwen/Qwen2.5-1.5B-Instruct')"
```

## 📈 Performance

### Accuracy Metrics (Expected)

- **AQI Prediction**: Within ±10 points of actual (after fine-tuning)
- **Category Classification**: 90%+ accuracy
- **Health Recommendations**: Contextually appropriate based on EPA guidelines

### Inference Speed

- **With GPU**: ~100-200ms per prediction
- **With CPU**: ~1-2s per prediction

## 🚢 Deployment

### Option 1: Local Inference

Use `qwen-predictor.py` directly in your app (requires Python backend)

### Option 2: API Service

Deploy as a separate microservice:

```bash
# Create FastAPI service
pip install fastapi uvicorn

# Run inference server
uvicorn qwen-api:app --host 0.0.0.0 --port 8000
```

### Option 3: Hugging Face Inference API

Upload fine-tuned model to Hugging Face and use their API:

```bash
huggingface-cli login
huggingface-cli upload qwen-aqi-dmv
```

## 📚 Additional Resources

- [Qwen2.5 Model Card](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
- [LoRA Paper](https://arxiv.org/abs/2106.09685)
- [Transformers Documentation](https://huggingface.co/docs/transformers)
- [EPA AQI Documentation](https://www.airnow.gov/aqi/aqi-basics/)

## 🤝 Next Steps

1. **Train the model** with your 2025 DMV data
2. **Test predictions** to verify accuracy
3. **Integrate with app** using the predictor API
4. **Monitor performance** and retrain with more data as needed
5. **Deploy** to production for real-time predictions

## 💡 Tips

- **More Data = Better Results**: Add 2024 data for improved accuracy
- **Regular Retraining**: Retrain monthly as new data becomes available
- **Ensemble Methods**: Combine Qwen predictions with EPA formulas
- **User Feedback**: Collect feedback to improve future training

---

**Questions?** Check the test cases in `test-qwen-model.py` for examples!
