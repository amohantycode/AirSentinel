# Environment Setup Guide

This guide will help you configure the environment variables for the SafeSteps Congressional App.

## Quick Start

1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local` with your actual values**

3. **Restart the development server**

## Required Configuration

### Google Maps API Key

The application uses Google Maps to display air quality monitoring locations.

#### Getting Your API Key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API (optional, for location search)
4. Go to "Credentials" and create an API key
5. Restrict your API key (recommended):
   - Set HTTP referrer restrictions for your domain
   - Restrict to only the APIs you need

#### Add to `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### Maps Provider

Choose between Google Maps or the fallback SVG map:

```env
NEXT_PUBLIC_MAPS_PROVIDER=google
```

Options:
- `google` - Use Google Maps (requires API key)
- `mapbox` - Use Mapbox (requires token, not yet implemented)

### API Base URL

Set the base URL for your backend API:

```env
NEXT_PUBLIC_API_BASE=http://localhost:3000
```

For production, update to your deployed API URL.

### Supabase (Optional)

If using Supabase for database:

1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Get your credentials from Project Settings > API

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_BASE` | Backend API base URL | No | `http://localhost:3000` |
| `NEXT_PUBLIC_MAPS_PROVIDER` | Maps provider (google/mapbox) | No | `google` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key | Yes* | - |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox access token | No | - |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | No | - |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | No | - |
| `NODE_ENV` | Environment mode | No | `development` |

\* Required if using Google Maps provider

## Important Notes

### Security

- **Never commit `.env.local` to version control** - It's already in `.gitignore`
- **Restrict your API keys** - Use domain restrictions and API restrictions
- **Use different keys for development and production**

### Next.js Environment Variables

- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Server-only variables should NOT use the `NEXT_PUBLIC_` prefix
- Changes to `.env.local` require restarting the dev server

### Troubleshooting

**Map not loading?**
1. Check that `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in `.env.local`
2. Verify the API key is valid in Google Cloud Console
3. Ensure Maps JavaScript API is enabled
4. Check browser console for error messages
5. Restart the dev server after changing `.env.local`

**API key restrictions blocking local development?**
- Add `http://localhost:3000` to allowed referrers in Google Cloud Console
- Add `http://127.0.0.1:3000` as well

## Example .env.local

```env
# Backend API
NEXT_PUBLIC_API_BASE=http://localhost:3000

# Maps Provider
NEXT_PUBLIC_MAPS_PROVIDER=google

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAso8orI4spYSUPjqqLv9TIoqMjihI3KfE

# Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Environment
NODE_ENV=development
```

## Testing Your Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the Map page: `http://localhost:3000/map`

3. You should see:
   - Google Maps loaded with markers
   - Clickable location markers showing AQI data
   - Info windows when clicking markers

If you see errors, check the browser console and verify your configuration.

## Need Help?

- Check the [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- Review [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- Open an issue on the repository
