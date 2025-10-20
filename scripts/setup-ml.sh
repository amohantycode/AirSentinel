#!/bin/bash
# Setup script for ML model training

echo "🚀 Setting up AQI Model Training Environment"
echo "=============================================="

# Create directories
echo "📁 Creating directories..."
mkdir -p data/2025
mkdir -p models

# Move CSV files from Downloads to data/2025 directory
echo "📂 Organizing data files..."
echo ""
echo "Please move your CSV files to: data/2025/"
echo "Expected files:"
echo "  - Maryland2.5"
echo "  - MarylandOzone.csv"
echo "  - Marylandno2.csv"
echo "  - VirginiaNo2.csv"
echo "  - DC2.5"
echo "  - DistrictOfColumbiaOzone.csv"
echo "  - DistrictofcolumbiaNO2.csv"
echo ""

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r scripts/requirements-ml.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Move your CSV files to the data/2025/ directory"
echo "2. Run: python scripts/train-aqi-model.py"
