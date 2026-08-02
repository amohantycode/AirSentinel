# AirSentinel

Air-quality forecasts and activity-specific exposure guidance.

AirSentinel uses air-quality data to estimate exposure from activity type, duration, and individual sensitivity. It then compares options such as delaying an activity, shortening it, or moving indoors.

## Features

- Check current air quality for a city
- Generate activity guidance with a dose-based exposure model
- View seven-day PM2.5, ozone, and NO2 forecasts
- Find lower-exposure outdoor time windows
- Explore real-time and historical map layers
- Review trends in an impact dashboard

## Quick start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

```bash
npm install -g pnpm
```

### Installation

```bash
git clone https://github.com/ShauryaMallampati/AirSentinal.git
cd AirSentinal
pnpm install
```

### Environment variables

```bash
cp .env.example .env.local
```

Add the required values to `.env.local`:

```bash
WEATHER_API_KEY=your_weatherapi_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key_here
```

The Supabase variables are optional.

### Run locally

```bash
pnpm dev
# or
npm run dev
```

Open <http://localhost:3000>.

## API keys

### WeatherAPI (required)

1. Create an account at [WeatherAPI](https://www.weatherapi.com/).
2. Copy the API key from the dashboard.
3. Set `WEATHER_API_KEY`.

### Google Maps (required for map features)

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the Maps JavaScript API.
3. Create an API key.
4. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
5. Restrict the key to the intended domain.

### Supabase (optional)

1. Create a project at [Supabase](https://supabase.com/).
2. Open **Settings → API**.
3. Copy the project URL and anonymous key.
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Application routes

- `/` — city search and quick assessment
- `/forecast` — seven-day PM2.5, ozone, and NO2 forecasts
- `/impact` — trends, averages, and unhealthy-day statistics
- `/map` — interactive map
- `/resources` — health and activity guidance
- `/about` — project overview and data sources

## Exposure model

AirSentinel estimates an activity-specific exposure dose:

```text
dose = concentration × duration × intensity_factor × sensitivity_factor × indoor_factor
```

Inputs include pollutant concentration, activity duration and intensity, sensitivity group, and indoor or outdoor location.

The recommendation engine compares four options:

1. Keep the current plan
2. Delay by one hour
3. Shorten the duration
4. Move indoors

## API endpoints

| Endpoint | Method | Description | Parameters |
|---|---|---|---|
| `/api/forecasts` | GET | Seven-day pollutant predictions | `city` |
| `/api/assess` | POST | Activity exposure assessment | `pollutant`, `concentration`, `duration`, `intensity`, `sensitivity` |
| `/api/assess/best-hours` | GET | Lower-exposure time windows | `city`, `pollutant` |
| `/api/current-aq` | GET | Current air quality | `city` |
| `/api/historical-aq` | GET | Historical AQI data | `city`, `state` |

## Forecasting scripts

```bash
pip install -r requirements-ml.txt
python3 scripts/forecast_api_hybrid.py "Washington, DC" "your_weatherapi_key"
```

## Data sources

- Current air quality: WeatherAPI
- Historical observations: EPA air-quality data from 2020–2025
- Forecasts: CatBoost models trained on EPA data

## Contributing

Pull requests are welcome.

1. Fork the repository.
2. Create a branch: `git checkout -b feature/my-change`.
3. Commit the change: `git commit -m "Describe your change"`.
4. Push the branch: `git push origin feature/my-change`.
5. Open a pull request.

## Troubleshooting

### API key not found

- Confirm that `.env.local` exists.
- Confirm that the required keys are set.
- Restart the development server.

### Map not loading

- Ensure the Maps JavaScript API is enabled.
- Check the API key restrictions.
- Confirm that `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set.

### Forecast shows “No data”

- Verify that the WeatherAPI key is valid.
- Check the network connection.
- Try an alternate city spelling.

### Build fails

Remove generated dependencies and build output, then reinstall:

```bash
rm -rf node_modules .next
pnpm install
pnpm build
```

## License

MIT
