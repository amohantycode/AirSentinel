# AirSentinel 🌬️

**AI-powered air quality decision engine for safer outdoor activities.**

AirSentinel transforms air quality data into actionable recommendations. It calculates personalized exposure dose and suggests optimal times, durations, or indoor alternatives to help you breathe cleaner air.

## ✨ Features

- **Personalized Exposure Assessment** - Dose-based calculations using activity intensity, duration, and health sensitivity
- **Smart Recommendations** - Optimal timing suggestions and exposure reduction strategies
- **7-Day ML Forecasts** - CatBoost models predict PM2.5, Ozone, and NO2 (trained on 60,000+ EPA observations)
- **Best Time Finder** - Identifies the cleanest hours for outdoor activities
- **Interactive Maps** - Real-time and historical air quality visualization
- **Impact Dashboard** - Historical data trends and health metrics

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (download from [nodejs.org](https://nodejs.org/))
- pnpm package manager (recommended) or npm
  ```bash
  npm install -g pnpm
  ```

### Installation

```bash
# Clone the repository
git clone https://github.com/ShauryaMallampati/AirSentinal.git
cd AirSentinal

# Install dependencies
pnpm install
```

## ⚙️ Configuration & Setup

### Step 1: Get Your API Keys

**WeatherAPI (Required)**
- Visit [weatherapi.com](https://www.weatherapi.com/)
- Click "Sign Up" (free tier available)
- Copy your API key from the dashboard
- This provides air quality data for your location

**Google Maps (Required for map features)**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Click "Create Project" and name it
- Search for "Maps JavaScript API" and enable it
- Go to "Credentials" → "Create Credentials" → "API Key"
- Copy your API key
- (Optional) Restrict key to your domain in Settings

**Supabase (Optional, for database features)**
- Visit [supabase.com](https://supabase.com/auth/sign-up)
- Create a free account and project
- From project dashboard, go to Settings → API
- Copy your Project URL and anon key

### Step 2: Configure Environment Variables

```bash
# Create configuration file
cp .env.example .env.local

# Edit .env.local and add your keys:
WEATHER_API_KEY=your_weatherapi_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here  # Optional
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key_here  # Optional
```

**⚠️ Important**: Never commit `.env.local` to git. It's in `.gitignore` by default.

### Step 3: Run the Application

```bash
# Start development server
pnpm dev

# Or with npm
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## 📖 Using the App

### Homepage (`/`)
- Search for your city
- Quick air quality assessment
- Get personalized recommendations for outdoor activities

### Forecast (`/forecast`)
- 7-day air quality predictions
- PM2.5, Ozone, and NO2 forecasts
- Find the best days for outdoor activities

### Impact Dashboard (`/impact`)
- Historical air quality trends
- Good/unhealthy days statistics
- Average AQI over time

### Interactive Map (`/map`)
- View air quality by location
- Real-time data visualization
- Explore regional patterns

### Resources (`/resources`)
- Health recommendations
- Activity guidelines by AQI level
- Sensitive group information

### About (`/about`)
- Project information
- Technology stack
- Data sources

## 📊 How It Works

### Dose-Based Assessment

Unlike standard AQI viewers, AirSentinel calculates your actual exposure:

```
dose = concentration × duration × intensity_factor × sensitivity_factor × indoor_factor
```

This gives a personalized risk assessment based on:
- **Pollutant concentration** (from WeatherAPI)
- **Activity duration** (user input)
- **Activity intensity** (running, walking, sitting)
- **Health sensitivity** (general population, children, elderly)
- **Location type** (outdoor, partially sheltered, indoors)

### Recommendation Engine

Evaluates four options:
1. **Keep your plan** - If exposure is acceptable
2. **Delay 1 hour** - Wait for cleaner air conditions
3. **Shorten duration** - Reduce exposure time
4. **Move indoors** - Avoid outdoor exposure entirely

## 🔌 API Endpoints

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|-----------|
| `/api/forecasts` | GET | 7-day PM2.5/Ozone/NO2 predictions | `city` |
| `/api/assess` | POST | Activity exposure assessment | `pollutant`, `concentration`, `duration`, `intensity`, `sensitivity` |
| `/api/assess/best-hours` | GET | Optimal time windows | `city`, `pollutant` |
| `/api/current-aq` | GET | Real-time air quality | `city` |
| `/api/historical-aq` | GET | Historical AQI data | `city`, `state` |

## 📁 Project Structure

```
AirSentinal/
├── app/                              # Next.js app router
│   ├── api/
│   │   ├── forecasts/               # 7-day forecast generation
│   │   ├── assess/                  # Exposure assessment
│   │   ├── assess/best-hours/       # Best time finder
│   │   ├── current-aq/              # Real-time data
│   │   └── historical-aq/           # Historical data
│   ├── page.tsx                     # Homepage
│   ├── forecast/page.tsx            # Forecast page
│   ├── impact/page.tsx              # Impact dashboard
│   ├── map/page.tsx                 # Map page
│   ├── report/page.tsx              # Reports
│   ├── resources/page.tsx           # Resources
│   ├── about/page.tsx               # About page
│   └── layout.tsx                   # Root layout
├── components/                       # Reusable React components
│   ├── aqi-card.tsx                 # AQI display component
│   ├── aqi-chart.tsx                # Chart visualization
│   ├── forecast-component.tsx       # Forecast view
│   ├── assess-quick.tsx             # Quick assessment form
│   ├── best-time-chart.tsx          # Best hours chart
│   └── ui/                          # shadcn/ui components
├── lib/
│   ├── config.ts                    # API configuration
│   ├── types.ts                     # TypeScript types
│   ├── aqi-utils.ts                 # AQI calculations
│   ├── utils.ts                     # Helper functions
│   └── supabase.ts                  # Supabase client
├── scripts/
│   ├── forecast_api_hybrid.py       # ML forecast generation (Python)
│   ├── train_daily_7d_models.py     # Model training
│   └── requirements-ml.txt          # Python dependencies
├── models/                           # Pre-trained CatBoost models
│   └── daily_7d/
│       ├── pm25_7d.joblib
│       ├── ozone_7d.joblib
│       └── no2_7d.joblib
├── data/                             # Historical EPA air quality data
│   └── combined-historical-2020-2025.csv
├── public/                           # Static assets
├── .env.example                      # Environment template
├── .env.local                        # Local secrets (not in git)
└── package.json                      # Dependencies
```

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Components** | shadcn/ui, Lucide Icons, Chart.js |
| **Backend** | Node.js API Routes, Python scripts |
| **ML Models** | CatBoost (trained on EPA observations) |
| **APIs** | WeatherAPI, Google Maps |
| **Database** | Supabase (PostgreSQL) |
| **Styling** | Tailwind CSS, Material Design system |

## 🚀 Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Then add environment variables in Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add `WEATHER_API_KEY` and `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. Redeploy

### Option 2: Other Platforms

The app works on any Node.js host (Netlify, Railway, Heroku, AWS, etc.). Key requirements:
- Node.js 18+
- Environment variables configured
- Python installed (for ML forecast script)

## 📦 Building for Production

```bash
# Create production build
pnpm build

# Start production server
pnpm start
```

## 🛠️ Development

### Python ML Scripts

Forecast generation uses Python CatBoost models:

```bash
# Install Python dependencies
pip install -r scripts/requirements-ml.txt

# Test forecast script
python3 scripts/forecast_api_hybrid.py "Washington, DC" "your_weatherapi_key"
```

## 📚 Data Sources

- **Current Air Quality**: WeatherAPI
- **Historical Data**: EPA air quality observations (2020-2025)
- **Maps**: Google Maps API
- **Forecasts**: CatBoost ML models trained on EPA data

## 🔒 Security & Privacy

✅ **API keys stored in `.env.local`** (never committed to git)
✅ **Google Maps key restricted** (prevents misuse)
✅ **Supabase RLS enabled** (database protection)
✅ **No personal data collection** (IP-based location only)
✅ **No AirNow API dependency** (uses historical data + CatBoost models)

## 🤝 Contributing

Found a bug or want to improve AirSentinel?

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🆘 Troubleshooting

### "API key not found" error
- Check `.env.local` exists
- Verify all required keys are added
- Restart dev server (`pnpm dev`)

### Map not loading
- Verify Google Maps API is enabled
- Check API key restrictions (should allow Maps JavaScript API)
- Ensure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set

### Forecast showing "No data"
- Verify WeatherAPI key is valid
- Check internet connection
- Ensure city name is spelled correctly

### Build fails
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install && pnpm build
```

## 📞 Support

- 📧 Report issues on [GitHub Issues](https://github.com/ShauryaMallampati/AirSentinal/issues)
- 🐛 Debug with `DEBUG=* pnpm dev`

## 🎯 Roadmap

- [ ] Real-time notifications for air quality alerts
- [ ] Health metric integration (FitBit, Apple Health)
- [ ] Community data sharing via Supabase
- [ ] Mobile app (React Native)
- [ ] Advanced ML with more pollutants
- [ ] Workplace air quality monitoring

---

**Made with ❤️ for cleaner air**

[GitHub](https://github.com/ShauryaMallampati/AirSentinal) • [Issues](https://github.com/ShauryaMallampati/AirSentinal/issues)
