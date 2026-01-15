# AirSentinel 🌬️

**AI-powered air quality decision engine for safer outdoor activities.**

AirSentinel transforms air quality data into actionable recommendations. Instead of just showing AQI numbers, it calculates your personalized exposure dose and tells you exactly when and how to adjust your plans to breathe cleaner air.

## ✨ Key Features

- **Personalized Exposure Assessment** - Calculates pollution dose based on activity intensity, duration, and health sensitivity
- **Smart Recommendations** - Suggests optimal times, shorter durations, or indoor alternatives to reduce exposure
- **7-Day ML Forecasts** - CatBoost models trained on 60,000+ EPA observations predict PM2.5, Ozone, and NO2
- **Best Time Finder** - Identifies the cleanest hours for your planned outdoor activities
- **Interactive Maps** - Visualize real-time and historical air quality across your region

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+ (for ML forecasts)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/shauryamallampati/congressionalapp.git
cd congressionalapp

# Install dependencies
npm install

# Set up Python environment (for ML models)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements-ml.txt
```

### Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Get your API keys:
   - **WeatherAPI** (required): [weatherapi.com](https://www.weatherapi.com/) - Free tier available
   - **Google Maps** (required for maps): [Google Cloud Console](https://console.cloud.google.com/)

3. Fill in your `.env.local`:
   ```bash
   WEATHER_API_KEY=your_key_here
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
   ```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📊 How It Works

### Dose-Based Assessment

Unlike standard AQI viewers, AirSentinel calculates your actual exposure:

```
dose = concentration × duration × intensity_factor × sensitivity_factor × indoor_factor
```

| Factor | Multiplier |
|--------|------------|
| Resting | 0.6x |
| Light activity | 1.0x |
| Moderate activity | 1.8x |
| Vigorous activity | 2.6x |
| Sensitive groups | 1.3x |
| Indoors | 0.4x |

### Recommendation Engine

Evaluates 4 alternatives and picks the best:
1. **Keep plan** - No changes needed
2. **Delay 1 hour** - Shift to cleaner time
3. **Shorten by 30%** - Reduce duration
4. **Move indoors** - 60% exposure reduction

## 🔌 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/forecasts` | 7-day PM2.5/Ozone/NO2 forecasts |
| `GET /api/assess` | Activity exposure assessment |
| `GET /api/assess/best-hours` | Optimal time windows |
| `GET /api/current-aq` | Real-time air quality |
| `GET /api/historical-aq` | Historical AQI data |

### Example: Get Forecast

```bash
curl "http://localhost:3000/api/forecasts?city=Washington,DC"
```

### Example: Assess Activity

```bash
curl "http://localhost:3000/api/assess?city=Washington,DC&start=2025-01-11T14:00:00&durationMin=60&intensity=moderate"
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Recharts
- **ML Models**: CatBoost (Python), trained on EPA AirNow data
- **Maps**: Google Maps / Mapbox
- **Data**: WeatherAPI, EPA AirNow

## 📁 Project Structure

```
congressionalapp/
├── app/                  # Next.js app router pages & API routes
│   ├── api/              # Backend API endpoints
│   └── ...               # Frontend pages
├── components/           # React components
├── lib/                  # Utilities and configuration
├── scripts/              # Python ML scripts & ETL
├── models/               # Trained ML models (.joblib)
├── data/                 # Historical EPA data (CSV)
└── public/               # Static assets
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Set these in your deployment platform:
- `WEATHER_API_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_MAPS_PROVIDER` (optional, defaults to "google")

## 📝 License

MIT License - see LICENSE file for details.

---

**Built for the Congressional App Challenge 2024** 🏆
