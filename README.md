# AirSentinel 🌬️

**AI-powered air quality decision engine for safer outdoor activities.**

AirSentinel transforms air quality data into actionable recommendations. It calculates personalized exposure dose and suggests optimal times, durations, or indoor alternatives to help you breathe cleaner air.

## ✨ Features

- **Personalized Exposure Assessment** - Dose-based calculations using activity intensity, duration, and health sensitivity
- **Smart Recommendations** - Optimal timing suggestions and exposure reduction strategies
- **7-Day ML Forecasts** - CatBoost models predict PM2.5, Ozone, and NO2 (trained on 60,000+ EPA observations)
- **Best Time Finder** - Identifies the cleanest hours for outdoor activities
- **Interactive Maps** - Real-time and historical air quality visualization

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (or npm)

### Installation

```bash
# Clone the repository
git clone https://github.com/ShauryaMallampati/AirSentinal.git
cd AirSentinal

# Install dependencies
pnpm install
```

### Configuration

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your API keys to `.env.local`:
   - **WeatherAPI**: Get free key at [weatherapi.com](https://www.weatherapi.com/)
   - **Google Maps**: Get key from [Google Cloud Console](https://console.cloud.google.com/)

3. Example `.env.local`:
   ```bash
   WEATHER_API_KEY=your_weatherapi_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

### Run

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📊 How It Works

### Dose-Based Assessment

Unlike standard AQI viewers, AirSentinel calculates your actual exposure:

```
dose = concentration × duration × intensity_factor × sensitivity_factor × indoor_factor
**Dose-Based Assessment**: Calculates actual pollution exposure using concentration, duration, activity intensity, health sensitivity, and location factors.

**Recommendation Engine**: Evaluates alternatives (keep plan, delay 1 hour, shorten duration, move indoors) and suggests the best option.

## 🔌 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/forecasts` | 7-day PM2.5/Ozone/NO2 predictions |
| `/api/assess` | Activity exposure assessment |
| `/api/assess/best-hours` | Optimal time windows |
| `/api/current-aq` | Real-time air quality |
| `/api/historical-aq` | Historical AQI data |*ML Models**: CatBoost (Python), trained on EPA AirNow data
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

MINext.js 14, React, TypeScript, Tailwind CSS
- CatBoost ML models (trained on EPA data)
- Google Maps API
- WeatherAPI for current conditions

## 📁 Project Structure

```
├── app/              # Next.js pages & API routes
├── components/       # React components
├── lib/              # Utilities & config
├── models/           # Trained ML models
├── data/             # Historical EPA data
└── scripts/          # Python ML training scripts
```

## 🚀 Deployment

Deploy to [Vercel](https://vercel.com):
1. Import GitHub repository
2. Add environment variables (`WEATHER_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`)
3. Deploy

## 📝 License

MIT License

---

**Congressional App Challenge 2024**