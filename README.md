# SafeSteps Congressional App

Air quality monitoring and forecasting application built with Next.js, featuring real-time AQI data visualization and interactive maps.

## Features

- 🗺️ Interactive Google Maps with AQI markers
- 📊 Real-time air quality monitoring
- 📈 AQI forecasts and trends
- 🚨 Air quality alerts
- 📱 Responsive design
- 🌓 Dark mode support

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Google Maps API key ([Get one here](https://console.cloud.google.com/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd congressional
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Google Maps API key:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Configuration

See [SETUP.md](./SETUP.md) for detailed environment setup instructions.

### Required Environment Variables

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key

### Optional Environment Variables

- `NEXT_PUBLIC_API_BASE` - Backend API URL (default: `http://localhost:3000`)
- `NEXT_PUBLIC_MAPS_PROVIDER` - Maps provider (default: `google`)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Project Structure

```
congressional/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page
│   ├── map/               # Interactive map page
│   ├── alerts/            # Air quality alerts
│   ├── forecast/          # AQI forecasts
│   └── api/               # API routes
├── components/            # React components
│   ├── google-map-wrapper.tsx  # Google Maps integration
│   ├── map-wrapper.tsx         # Map wrapper with fallback
│   ├── aqi-card.tsx       # AQI display card
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility functions
│   ├── config.ts          # Environment configuration
│   ├── aqi-utils.ts       # AQI calculations
│   └── supabase.ts        # Database client
└── public/                # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Technology Stack

- **Framework:** Next.js 14
- **UI Components:** shadcn/ui + Radix UI
- **Styling:** Tailwind CSS
- **Maps:** Google Maps JavaScript API
- **Icons:** Lucide React
- **Database:** Supabase (optional)
- **Charts:** Recharts

## Pages

- `/` - Home page with overview
- `/map` - Interactive air quality map
- `/alerts` - Current air quality alerts
- `/forecast` - AQI forecasts
- `/report` - Detailed reports
- `/impact` - Health impact information
- `/resources` - Additional resources
- `/about` - About the application

## API Routes

- `/api/alerts` - Air quality alerts data
- `/api/forecasts` - Forecast data
- `/api/observations` - Real-time observations
- `/api/reports` - Report data

## Configuration

### Google Maps Setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Maps JavaScript API"
3. Create an API key
4. (Optional) Restrict the API key to your domain
5. Add the key to `.env.local`

### Supabase Setup (Optional)

1. Create a project at [Supabase](https://supabase.com/)
2. Run the SQL scripts in `scripts/` to set up tables
3. Add Supabase credentials to `.env.local`

## Development

### Adding a New Page

1. Create a new folder in `app/`
2. Add a `page.tsx` file
3. (Optional) Add a `loading.tsx` for loading states

### Using Environment Variables

```typescript
import { config } from '@/lib/config'

// Access configuration
const apiKey = config.googleMapsApiKey
const apiBase = config.apiBase
```

## Troubleshooting

### Map not loading?

1. Check that `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in `.env.local`
2. Verify the API key in Google Cloud Console
3. Ensure "Maps JavaScript API" is enabled
4. Restart the dev server after changing `.env.local`

### Type errors?

```bash
npm install @types/google.maps
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Add your license here]

## Support

For detailed setup instructions, see [SETUP.md](./SETUP.md)

For issues or questions, please open an issue on GitHub.
