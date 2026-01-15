# AirSentinel 🌬️

AI-powered air quality forecasts

AirSentinel uses air quality data to estimate your exposure based on what you are doing, for how long, and your sensitivity, then suggests safer times, shorter durations, or indoor alternatives.

## What you can do with AirSentinel

- **Check current air quality** for any city
- **Get personalized activity guidance** using a dose-based exposure model
- **View 7-day pollutant forecasts** (PM2.5, Ozone, NO2)
- **Find the best hours to go outside** with a cleanest-time window finder
- **Explore an interactive map** with real-time and historical layers
- **Track trends** in an impact dashboard



## Quick start

### Prerequisites

- Node.js 18+ (download from https://nodejs.org)
- pnpm (recommended) or npm

```bash
npm install -g pnpm
```

### Install

```bash
# Clone
git clone https://github.com/ShauryaMallampati/AirSentinal.git
cd AirSentinal

# Install dependencies
pnpm install
```

### Configure environment variables

```bash
# Create local env file
cp .env.example .env.local
```

Edit `.env.local` and add your keys:

```bash
WEATHER_API_KEY=your_weatherapi_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here  # Optional
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key_here  # Optional
```

### Run locally

```bash
pnpm dev
# or
npm run dev
```

Open http://localhost:3000

## Getting API keys

### WeatherAPI (required)

1. Create an account at https://www.weatherapi.com/
2. Copy your API key from the dashboard
3. Add it as `WEATHER_API_KEY`

### Google Maps (required for map features)

1. Create a project in Google Cloud Console: https://console.cloud.google.com/
2. Enable **Maps JavaScript API**
3. Create an API key (Credentials → Create Credentials → API key)
4. Add it as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
5. Optional but recommended: restrict the key to your domain

### Supabase (optional)

1. Create a project at https://supabase.com/
2. Go to Settings → API
3. Copy the Project URL and anon key
4. Add them as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## App routes

- `/` Home: city search + quick assessment
- `/forecast` 7-day forecasts for PM2.5, Ozone, NO2
- `/impact` trends, averages, and unhealthy-day stats
- `/map` interactive map view
- `/resources` health and activity guidance
- `/about` project overview and data sources

## How it works

### Dose-based exposure model

Most apps show AQI. AirSentinel also estimates your exposure dose:

```text
dose = concentration × duration × intensity_factor × sensitivity_factor × indoor_factor
```

Inputs include pollutant concentration, your activity duration and intensity (walking vs running), sensitivity group, and whether you are indoors or outdoors.

### Recommendation engine

AirSentinel evaluates common decision options:

1. Keep your plan
2. Delay 1 hour
3. Shorten duration
4. Move indoors

## API endpoints

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/forecasts` | GET | 7-day PM2.5/Ozone/NO2 predictions | `city` |
| `/api/assess` | POST | Activity exposure assessment | `pollutant`, `concentration`, `duration`, `intensity`, `sensitivity` |
| `/api/assess/best-hours` | GET | Optimal time windows | `city`, `pollutant` |
| `/api/current-aq` | GET | Real-time air quality | `city` |
| `/api/historical-aq` | GET | Historical AQI data | `city`, `state` |




## ML scripts

```bash
pip install -r scripts/requirements-ml.txt
python3 scripts/forecast_api_hybrid.py "Washington, DC" "your_weatherapi_key"
```

## Data sources

- Current air quality: WeatherAPI
- Historical observations: EPA air quality data (2020 to 2025)
- Forecasts: CatBoost models trained on EPA data

## Contributing

Pull requests are welcome.

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-change`
3. Commit: `git commit -m "Describe your change"`
4. Push: `git push origin feature/my-change`
5. Open a PR

## License

MIT

## Troubleshooting

### API key not found

- Confirm `.env.local` exists
- Confirm the required keys are set
- Restart the dev server

### Map not loading

- Ensure **Maps JavaScript API** is enabled
- Check key restrictions
- Confirm `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set

### Forecast shows “No data”

- Verify your WeatherAPI key is valid
- Check your internet connection
- Try an alternate city spelling

### Build fails

```bash
rm -rf node_modules .next
pnpm install
pnpm build
```