"""
Test the fine-tuned Qwen2.5-1.5B model for air quality predictions
"""

import os
import json

try:
    from transformers import AutoModelForCausalLM, AutoTokenizer
    import torch
    from peft import PeftModel
except ImportError:
    print("❌ Required packages not installed!")
    print("\nPlease run:")
    print("pip install transformers torch peft")
    exit(1)


def load_finetuned_model():
    """Load the fine-tuned Qwen model"""
    model_dir = os.path.join(os.path.dirname(__file__), '..', 'models', 'qwen-aqi-dmv')
    
    if not os.path.exists(model_dir):
        print(f"❌ Model not found at {model_dir}")
        print("\nPlease train the model first:")
        print("python scripts/train-with-qwen.py")
        exit(1)
    
    print("Loading fine-tuned model...")
    
    # Load base model
    base_model_name = "Qwen/Qwen2.5-1.5B-Instruct"
    tokenizer = AutoTokenizer.from_pretrained(
        model_dir,
        trust_remote_code=True
    )
    
    model = AutoModelForCausalLM.from_pretrained(
        base_model_name,
        trust_remote_code=True,
        device_map="auto",
        torch_dtype=torch.float16
    )
    
    # Load LoRA weights
    model = PeftModel.from_pretrained(model, model_dir)
    
    # Load metadata
    with open(os.path.join(model_dir, 'metadata.json'), 'r') as f:
        metadata = json.load(f)
    
    return model, tokenizer, metadata


def generate_prediction(model, tokenizer, instruction, input_text):
    """Generate prediction from the model"""
    prompt = f"""<|im_start|>system
You are an air quality expert assistant specializing in DMV region (DC, Maryland, Virginia) air quality analysis and predictions.<|im_end|>
<|im_start|>user
{instruction}
{input_text}<|im_end|>
<|im_start|>assistant
"""
    
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=200,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )
    
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Extract only the assistant's response
    if "<|im_start|>assistant" in response:
        response = response.split("<|im_start|>assistant")[-1].strip()
    
    return response


def run_test_cases():
    """Run test cases on the fine-tuned model"""
    print("=" * 60)
    print("Testing Fine-Tuned Qwen Model")
    print("=" * 60)
    
    model, tokenizer, metadata = load_finetuned_model()
    
    print(f"\n📊 Model Info:")
    print(f"   Training Date: {metadata['training_date']}")
    print(f"   Dataset Size: {metadata['dataset_size']} observations")
    print(f"   Locations: {metadata['locations']}")
    print(f"   Date Range: {metadata['date_range']['start']} to {metadata['date_range']['end']}")
    print(f"   Pollutants: {', '.join(metadata['pollutants'])}")
    
    # Test cases
    test_cases = [
        {
            "instruction": "Given the following air quality measurement, predict the AQI value and category.",
            "input": "Location: River Terrace, DC\nDate: 2025-10-19\nPollutant: PM2.5\nConcentration: 25.5"
        },
        {
            "instruction": "Explain the air quality conditions and provide health recommendations.",
            "input": "Location: Baltimore, Maryland\nCurrent AQI: 85\nPrimary Pollutant: Ozone"
        },
        {
            "instruction": "Compare air quality between DMV locations.",
            "input": "Date: 2025-10-15\nProvide comparison of air quality conditions."
        },
        {
            "instruction": "What is the typical air quality in Alexandria, Virginia during summer months?",
            "input": "Analyze based on historical DMV data patterns."
        }
    ]
    
    print("\n" + "=" * 60)
    print("Running Test Cases")
    print("=" * 60)
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n{'=' * 60}")
        print(f"Test Case {i}")
        print(f"{'=' * 60}")
        print(f"\n📝 Instruction: {test['instruction']}")
        print(f"\n📥 Input:\n{test['input']}")
        
        print(f"\n🤖 Model Response:")
        response = generate_prediction(model, tokenizer, test['instruction'], test['input'])
        print(response)
    
    print("\n" + "=" * 60)
    print("✅ Testing Complete!")
    print("=" * 60)


if __name__ == "__main__":
    run_test_cases()
