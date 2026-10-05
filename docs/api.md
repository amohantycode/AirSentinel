# API reference

All paths are relative to the running Next.js application. JSON responses come from the route handlers in `app/api/`. External integrations require the corresponding setup in [development notes](development.md).

## Main endpoints

| Method | Path | Inputs | Behavior |
| --- | --- | --- | --- |
| GET | `/api/observations` | Optional `location`, `limit` (default `50`) | Bundled observations first, then Supabase fallback |
| GET | `/api/current-aq` | Optional `city` (default `Washington, DC`) | Current pollutant concentrations via Python and WeatherAPI |
| GET | `/api/forecasts` | Required `city` | Seven-day output for available pollutant model bundles |
| GET | `/api/assess` | Required `start`; optional `city`, `durationMin`, `intensity`, `sensitivity`, `indoors` | Relative exposure comparison based on daily PM2.5 |
| GET | `/api/assess/best-hours` | Optional `city`, `date`, `durationMin`, `intensity`, `sensitivity`, `indoors` | Hourly activity windows using provider data or a constructed profile |
| GET | `/api/historical-aq` | Optional `city`, `days` (`7`, `30`, `90`, `365`) | Local history, with a provider forecast fallback when history is absent |
| GET | `/api/geocode` | `q` | Location lookup |
| GET / POST | `/api/reports` | Filters or report JSON | Optional Supabase-backed community reports |
| GET / POST | `/api/alerts` | Subscription JSON for POST | Optional Supabase-backed subscription storage |

The legacy `POST /api/forecasts` handler requires `city` and `key` in its body, but inference still uses the server environment key. Prefer `GET /api/forecasts`; never put credentials in shared URLs or examples. `/api/assess` supports **GET**, not POST.

## Explore included observations without credentials

```bash
curl --get 'http://localhost:3000/api/observations' \
  --data-urlencode 'limit=3'
```

The response includes `success`, `data`, `count`, and a historical source label. Observation entries include `location_name`, `lat`, `lon`, `aqi`, `pollutant`, `concentration`, and `observed_at`.

Filter by a monitoring-location name returned by the first request:

```bash
curl --get 'http://localhost:3000/api/observations' \
  --data-urlencode 'location=Essex' \
  --data-urlencode 'limit=10'
```

## Current conditions

Requires `WEATHER_API_KEY` and the Python environment:

```bash
curl --get 'http://localhost:3000/api/current-aq' \
  --data-urlencode 'city=Washington, DC'
```

The `current` object uses `pm25`, `o3`, and `no2`. Each includes concentration, unit, AQI, and category. Forecast responses instead use `ozone` as the ozone key.

## Forecast and assessment

Requires the historical CSV and forecast bundles in addition to current-condition setup:

```bash
curl --get 'http://localhost:3000/api/forecasts' \
  --data-urlencode 'city=Washington, DC'
```

Use a date returned in `forecasts.pm25.forecast` as the assessment start. The following timestamp is an **example**, not a currently available forecast:

```bash
curl --get 'http://localhost:3000/api/assess' \
  --data-urlencode 'city=Washington, DC' \
  --data-urlencode 'start=2026-10-05T14:00:00Z' \
  --data-urlencode 'durationMin=60' \
  --data-urlencode 'intensity=moderate' \
  --data-urlencode 'sensitivity=normal' \
  --data-urlencode 'indoors=false'
```

Intensity options are `resting`, `light`, `moderate`, and `vigorous`. Sensitivity options are `normal` and `sensitive`. Results include `inputs`, `concentration`, `baseline`, `drivers`, `recommendation`, and `alternatives`.

## Errors and contract limits

Missing assessment start times and unsupported historical windows return `400`. Missing integration configuration generally returns `500`. A failed forecast request inside an assessment returns `502`.

Validation is not yet uniform across endpoints. Clients should check HTTP status before rendering a response and treat missing pollutant series as unavailable. A successful response does not establish freshness, prediction accuracy, or health suitability; inspect dates and source information.
