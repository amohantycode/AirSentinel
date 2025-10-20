"""
Train Qwen2.5-1.5B-Instruct model on DMV air quality data
Fine-tune for AQI prediction and air quality analysis
"""

import os
import json
import pandas as pd
import numpy as np
from datetime import datetime
import glob

# Install required packages
print("Installing required packages...")
print("Run: pip install transformers torch datasets accelerate peft bitsandbytes")

try:
    from transformers import (
        AutoModelForCausalLM,
        AutoTokenizer,
        TrainingArguments,
        Trainer,
        DataCollatorForLanguageModeling
    )
    from datasets import Dataset
    import torch
    from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
except ImportError:
    print("\n❌ Required packages not installed!")
    print("\nPlease run:")
    print("pip install transformers torch datasets accelerate peft bitsandbytes")
    exit(1)


def load_all_data():
    """Load combined historical data (2020-2025) or fall back to 2025 only"""
    # Try to load combined historical data first
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    combined_csv = os.path.join(data_dir, 'combined-historical-2020-2025.csv')
    
    if os.path.exists(combined_csv):
        print(f"📂 Loading combined historical data (2020-2025)")
        df = pd.read_csv(combined_csv)
        return df
    
    # Fallback to 2025 data only
    print("⚠️  Combined data not found, loading 2025 data only...")
    print("💡 Run 'python scripts/load-historical-data.py' first to combine all historical data")
    
    data_2025_dir = os.path.join(data_dir, '2025')
    csv_files = glob.glob(os.path.join(data_2025_dir, '*'))
    
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
                conc_col = 'Daily Mean NO2 Concentration'
            else:
                continue
            
            # Process each row
            for _, row in df.iterrows():
                try:
                    date_str = row.get('Date', '')
                    location = row.get('Local Site Name', row.get('Site Name', 'Unknown'))
                    state = row.get('State', '')
                    county = row.get('County', '')
                    concentration = float(row.get(conc_col, 0))
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
                        'pollutant': pollutant,
                        'concentration': concentration,
                        'aqi': aqi,
                        'category': category
                    })
                except Exception as e:
                    continue
        
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    return pd.DataFrame(all_data)


def create_training_prompts(df):
    """
    Create training prompts in instruction format for Qwen model
    """
    prompts = []
    
    for _, row in df.iterrows():
        # Format 1: Predict AQI from pollutant data
        prompt1 = {
            "instruction": f"Given the following air quality measurement, predict the AQI value and category.",
            "input": f"Location: {row['location']}, {row['state']}\nDate: {row['date']}\nPollutant: {row['pollutant']}\nConcentration: {row['concentration']:.2f}",
            "output": f"AQI: {row['aqi']}\nCategory: {row['category']}\nThis indicates {row['category'].lower()} air quality conditions."
        }
        prompts.append(prompt1)
        
        # Format 2: Explain air quality conditions
        health_advice = {
            'Good': 'Air quality is satisfactory. Ideal for all outdoor activities.',
            'Moderate': 'Air quality is acceptable. Unusually sensitive people should consider limiting prolonged outdoor exertion.',
            'Unhealthy for Sensitive Groups': 'Sensitive groups should reduce prolonged or heavy outdoor exertion.',
            'Unhealthy': 'Everyone should reduce prolonged or heavy outdoor exertion.',
            'Very Unhealthy': 'Everyone should avoid prolonged or heavy outdoor exertion.',
            'Hazardous': 'Everyone should avoid all outdoor physical activities.'
        }
        
        prompt2 = {
            "instruction": f"Explain the air quality conditions and provide health recommendations.",
            "input": f"Location: {row['location']}, {row['state']}\nCurrent AQI: {row['aqi']}\nPrimary Pollutant: {row['pollutant']}",
            "output": f"The current air quality in {row['location']} is {row['category']} with an AQI of {row['aqi']}. The primary pollutant is {row['pollutant']} at {row['concentration']:.2f}. Health Advice: {health_advice[row['category']]}"
        }
        prompts.append(prompt2)
        
        # Format 3: Compare locations
        if len(df[df['date'] == row['date']]) > 1:
            other_locations = df[(df['date'] == row['date']) & (df['location'] != row['location'])].head(2)
            if len(other_locations) > 0:
                comparison = f"{row['location']} (AQI: {row['aqi']}, {row['category']})"
                for _, other in other_locations.iterrows():
                    comparison += f" vs {other['location']} (AQI: {other['aqi']}, {other['category']})"
                
                prompt3 = {
                    "instruction": "Compare air quality between DMV locations.",
                    "input": f"Date: {row['date']}\nProvide comparison of air quality conditions.",
                    "output": comparison
                }
                prompts.append(prompt3)
    
    return prompts


def format_prompt_for_training(example):
    """Format prompt using Qwen's chat template"""
    return f"""<|im_start|>system
You are an air quality expert assistant specializing in DMV region (DC, Maryland, Virginia) air quality analysis and predictions.<|im_end|>
<|im_start|>user
{example['instruction']}
{example['input']}<|im_end|>
<|im_start|>assistant
{example['output']}<|im_end|>"""


def prepare_dataset(prompts):
    """Prepare dataset for training"""
    formatted_prompts = []
    
    for prompt in prompts:
        formatted_text = format_prompt_for_training(prompt)
        formatted_prompts.append({"text": formatted_text})
    
    return Dataset.from_list(formatted_prompts)


def train_qwen_model():
    """
    Fine-tune Qwen2.5-1.5B-Instruct on DMV air quality data
    """
    print("=" * 60)
    print("Qwen2.5-1.5B Air Quality Training")
    print("=" * 60)
    
    # Load data
    print("\n📊 Loading DMV air quality data...")
    df = load_all_data()
    print(f"✅ Loaded {len(df)} observations")
    print(f"   Locations: {df['location'].nunique()}")
    print(f"   Date range: {df['date'].min()} to {df['date'].max()}")
    print(f"   Pollutants: {', '.join(df['pollutant'].unique())}")
    
    # Create training prompts
    print("\n🔨 Creating training prompts...")
    prompts = create_training_prompts(df)
    print(f"✅ Generated {len(prompts)} training examples")
    
    # Prepare dataset
    print("\n📦 Preparing dataset...")
    dataset = prepare_dataset(prompts)
    
    # Split into train/val
    dataset = dataset.train_test_split(test_size=0.1, seed=42)
    print(f"✅ Train: {len(dataset['train'])} examples")
    print(f"✅ Val: {len(dataset['test'])} examples")
    
    # Load model and tokenizer
    print("\n🤖 Loading Qwen2.5-1.5B-Instruct model...")
    model_name = "Qwen/Qwen2.5-1.5B-Instruct"
    
    tokenizer = AutoTokenizer.from_pretrained(
        model_name,
        trust_remote_code=True,
        padding_side="right"
    )
    
    # Set pad token
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    
    # Load model in 4-bit for efficient training
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        trust_remote_code=True,
        device_map="auto",
        torch_dtype=torch.float16,
        load_in_4bit=True
    )
    
    # Prepare model for training
    model = prepare_model_for_kbit_training(model)
    
    # Configure LoRA
    print("\n⚙️  Configuring LoRA for efficient fine-tuning...")
    lora_config = LoraConfig(
        r=16,
        lora_alpha=32,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM"
    )
    
    model = get_peft_model(model, lora_config)
    print(f"✅ Trainable parameters: {model.print_trainable_parameters()}")
    
    # Tokenize dataset
    def tokenize_function(examples):
        return tokenizer(
            examples["text"],
            padding="max_length",
            truncation=True,
            max_length=512
        )
    
    print("\n🔤 Tokenizing dataset...")
    tokenized_dataset = dataset.map(
        tokenize_function,
        remove_columns=["text"],
        batched=True
    )
    
    # Training arguments
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'models', 'qwen-aqi-dmv')
    os.makedirs(output_dir, exist_ok=True)
    
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=3,
        per_device_train_batch_size=4,
        per_device_eval_batch_size=4,
        gradient_accumulation_steps=4,
        learning_rate=2e-4,
        warmup_steps=100,
        logging_steps=10,
        eval_strategy="steps",
        eval_steps=50,
        save_steps=100,
        save_total_limit=3,
        fp16=True,
        report_to="none",
        load_best_model_at_end=True,
    )
    
    # Data collator
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False
    )
    
    # Create trainer
    print("\n🏋️  Starting training...")
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset["train"],
        eval_dataset=tokenized_dataset["test"],
        data_collator=data_collator,
    )
    
    # Train
    trainer.train()
    
    # Save model
    print(f"\n💾 Saving fine-tuned model to {output_dir}...")
    trainer.save_model()
    tokenizer.save_pretrained(output_dir)
    
    # Save metadata
    metadata = {
        "model": model_name,
        "training_date": datetime.now().isoformat(),
        "dataset_size": len(df),
        "training_examples": len(prompts),
        "locations": df['location'].nunique(),
        "date_range": {
            "start": df['date'].min(),
            "end": df['date'].max()
        },
        "pollutants": list(df['pollutant'].unique()),
        "lora_config": {
            "r": lora_config.r,
            "lora_alpha": lora_config.lora_alpha,
            "target_modules": lora_config.target_modules
        }
    }
    
    with open(os.path.join(output_dir, 'metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print("\n" + "=" * 60)
    print("✅ Training Complete!")
    print("=" * 60)
    print(f"\n📁 Model saved to: {output_dir}")
    print(f"📊 Dataset: {len(df)} observations")
    print(f"🎯 Training examples: {len(prompts)}")
    print(f"\n🚀 Next steps:")
    print(f"   1. Test the model: python scripts/test-qwen-model.py")
    print(f"   2. Deploy to API: Update forecast endpoint")
    print(f"   3. Integrate with app")


if __name__ == "__main__":
    train_qwen_model()
