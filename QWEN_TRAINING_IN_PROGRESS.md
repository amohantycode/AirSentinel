# 🚀 Qwen2.5-1.5B Training In Progress

## Current Status: TRAINING 🔥

**Started:** October 20, 2025  
**Model:** Qwen/Qwen2.5-1.5B-Instruct  
**Training Method:** LoRA Fine-tuning (Low-Rank Adaptation)

---

## 📊 Training Dataset

### Combined Historical Data (2020-2025)
- **Total Observations:** 73,782
- **Unique Locations:** 42 EPA monitoring stations
- **States:** DC, Maryland, Virginia
- **Date Range:** January 1, 2020 - October 19, 2025

### Breakdown by Year:
- **2020:** 11,743 observations
- **2021:** 11,624 observations  
- **2022:** 11,650 observations
- **2023:** 11,971 observations
- **2024:** 11,849 observations
- **2025:** 14,945 observations

### Pollutants:
- **Ozone:** 32,747 observations (44.4%)
- **PM2.5:** 26,166 observations (35.5%)
- **NO2:** 14,869 observations (20.1%)

### Data Quality:
- **Average AQI:** 33.3
- **AQI Categories:**
  - Good: 64,917 (88.0%)
  - Moderate: 8,608 (11.7%)
  - Unhealthy for Sensitive Groups: 208 (0.3%)
  - Unhealthy: 48 (0.1%)
  - Very Unhealthy: 1 (0.0%)

---

## 🎯 Training Configuration

### Model Architecture:
- **Base Model:** Qwen2.5-1.5B-Instruct (1.5 billion parameters)
- **Fine-tuning Method:** LoRA (Parameter Efficient Fine-Tuning)
- **Trainable Parameters:** ~37M (2.36% of total model)

### LoRA Configuration:
```python
{
  "r": 16,  # LoRA rank
  "lora_alpha": 32,
  "target_modules": ["q_proj", "k_proj", "v_proj", "o_proj"],
  "lora_dropout": 0.05,
  "task_type": "CAUSAL_LM"
}
```

### Training Parameters:
- **Epochs:** 3
- **Batch Size:** 4 per device
- **Gradient Accumulation:** 4 steps
- **Effective Batch Size:** 16
- **Learning Rate:** 2e-4
- **Warmup Steps:** 100
- **Precision:** FP16 (mixed precision)

### Training Examples:
The model will be trained on **~150,000+ examples** created from the 73,782 observations:
- **Format 1:** AQI prediction from pollutant concentration
- **Format 2:** Health recommendations based on current conditions
- **Format 3:** Location comparisons across DMV region

---

## ⏱️ Estimated Training Time

### On Apple Silicon (M1/M2/M3):
- **Expected Duration:** 4-8 hours
- **Hardware:** CPU training (Metal acceleration)

### On NVIDIA GPU:
- **Expected Duration:** 2-4 hours
- **Hardware:** CUDA-enabled GPU

---

## 📁 Output Location

The trained model will be saved to:
```
/Users/ankit/Downloads/congressional (1)/models/qwen-aqi-dmv/
```

Files created:
- `adapter_model.bin` - LoRA weights
- `adapter_config.json` - LoRA configuration
- `tokenizer_config.json` - Tokenizer settings
- `metadata.json` - Training metadata

---

## 🔍 What the Model Will Learn

### 1. AQI Prediction
```
Input: Location: River Terrace, DC
       Date: 2025-10-19
       Pollutant: PM2.5
       Concentration: 25.5

Output: AQI: 78
        Category: Moderate
        This indicates moderate air quality conditions.
```

### 2. Health Recommendations
```
Input: Location: Baltimore, Maryland
       Current AQI: 85
       Primary Pollutant: Ozone

Output: The current air quality in Baltimore is Moderate with 
        an AQI of 85. The primary pollutant is Ozone. 
        Health Advice: Unusually sensitive people should 
        consider limiting prolonged outdoor exertion.
```

### 3. Forecasting & Analysis
```
Input: Location: Alexandria, Virginia
       Current AQI: 120
       Primary Pollutant: PM2.5

Output: 24-hour forecast with hourly predictions, trends, 
        and health advisories based on DMV historical patterns.
```

---

## 📝 Training Progress

### Phase 1: Data Loading ✅
- Loaded 73,782 observations from combined CSV
- 42 unique DMV locations identified
- All 3 pollutants (PM2.5, Ozone, NO2) processed

### Phase 2: Prompt Creation ⏳ IN PROGRESS
- Generating training examples (3 formats per observation)
- Expected: ~150,000-220,000 total training examples
- Creating instruction-response pairs

### Phase 3: Dataset Preparation
- Split into 90% train / 10% validation
- Tokenization with Qwen tokenizer
- Max sequence length: 512 tokens

### Phase 4: Model Loading
- Download Qwen2.5-1.5B-Instruct from Hugging Face
- Apply LoRA adapters
- Prepare for 4-bit training (optional)

### Phase 5: Training (3 Epochs)
- Monitor loss reduction
- Validation every 50 steps
- Save checkpoints every 100 steps

### Phase 6: Model Export
- Save fine-tuned LoRA weights
- Export metadata and configuration
- Test inference

---

## 🎉 What You'll Get

After training completes, you'll have:

### 1. **Fine-Tuned Model**
- Specialized for DMV air quality analysis
- Trained on 6 years of historical data
- Understands PM2.5, Ozone, and NO2 patterns

### 2. **Prediction API**
- Ready-to-use Python predictor (`qwen-predictor.py`)
- Three main functions:
  - `predict_aqi()` - Predict AQI from concentrations
  - `get_health_recommendations()` - Get health advice
  - `predict_24h_forecast()` - Generate forecasts

### 3. **Testing Tools**
- Test script (`test-qwen-model.py`)
- CLI interface for quick predictions
- Integration examples

---

## 🚀 Next Steps (After Training)

### 1. Test the Model
```bash
python scripts/test-qwen-model.py
```

### 2. Make Predictions
```bash
# Predict AQI
python scripts/qwen-predictor.py predict "River Terrace" "DC" "PM2.5" 25.5

# Generate forecast
python scripts/qwen-predictor.py forecast "Baltimore" "Maryland" 85 "Ozone"

# Get health advice
python scripts/qwen-predictor.py health "Alexandria" "Virginia" 120 "PM2.5"
```

### 3. Integrate with App
- Update `/app/api/forecasts/route.ts` to use Qwen predictor
- Replace simple forecast generation with AI-powered predictions
- Deploy to production

---

## 📊 Monitoring Training

To check training progress, look for:

### Success Indicators:
- ✅ Training loss decreasing over time
- ✅ Validation loss decreasing
- ✅ Perplexity improving
- ✅ No NaN or Inf values

### Red Flags:
- ❌ Loss not decreasing
- ❌ NaN/Inf values appearing
- ❌ Out of memory errors
- ❌ Training stuck/frozen

---

## 💡 Training Tips

### If Training is Slow:
- Reduce batch size from 4 to 2
- Increase gradient accumulation steps
- Use smaller max sequence length

### If Out of Memory:
- Enable 4-bit quantization
- Reduce LoRA rank from 16 to 8
- Decrease batch size to 1

### If Loss Not Decreasing:
- Increase learning rate to 3e-4
- Add more warmup steps (200-500)
- Check data quality

---

## 📚 Resources

- **Model Card:** https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- **LoRA Paper:** https://arxiv.org/abs/2106.09685
- **PEFT Library:** https://github.com/huggingface/peft
- **Training Guide:** `/scripts/QWEN_TRAINING_README.md`

---

## ⏰ Estimated Completion Time

**Current Phase:** Creating training prompts  
**Next Milestone:** Dataset preparation  
**Expected Completion:** 4-8 hours from start

---

**Status will be updated as training progresses...**
