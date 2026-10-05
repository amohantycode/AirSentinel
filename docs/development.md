# Development

## Runtime and installation

Use Node.js 22 (`nvm use` reads `.nvmrc`) and the committed npm lockfile:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

npm is the maintained package manager for this repository. Leave unused environment values blank. The core web build and bundled observation API do not need credentials.

## Python environment

Python 3.10+ is recommended for the optional data pipeline. Create the environment in `venv/`, which the current-condition and forecast routes recognize:

```bash
python3 -m venv venv
source venv/bin/activate
python -m pip install -r requirements-ml.txt
```

Keep this environment active when starting the app or invoking Python scripts. The Node.js server must have permission to start Python and read the local data and model files. On Windows, use WSL for the documented commands and `venv/bin/python3` layout.

## Data and model setup

The following forecast assets are **not committed**:

- `data/combined-historical-2020-2025.csv`
- `models/daily_7d/pm25_7d.joblib`
- `models/daily_7d/ozone_7d.joblib`
- `models/daily_7d/no2_7d.joblib`

The inference loader expects CSV columns including `date`, `location`, `state`, `pollutant`, and `concentration`. Pollutant labels are `PM2.5`, `Ozone`, and `NO2`; inference expects PM2.5 in µg/m³, ozone in ppm, and NO₂ in ppb. Restore the original prepared dataset with verified units and provenance before training.

The training entry point is:

```bash
python scripts/train_daily_7d_models.py
```

It also scans raw data exports, trains per-pollutant multi-output CatBoost regressors, and saves bundles into `models/daily_7d/`. Training can be expensive and is not part of CI. The two bundled 2025 raw files contain PM2.5 data; they do not provide a complete three-pollutant dataset. Historical ingestion scripts contain assumptions about source files and should be reviewed before running.

The repository marks CSV and joblib files for Git LFS. If restoring these assets to version control, use Git LFS and confirm that downloaded files contain actual data rather than pointer text. Never load untrusted pickle or joblib artifacts.

## Optional integrations

### WeatherAPI

Set `WEATHER_API_KEY` in `.env.local`. It is read on the server. Provider access and available forecast horizons depend on the account. No API key is needed in browser requests to the current-condition or GET forecast endpoint.

### Google Maps

Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and enable the Maps JavaScript API. Restrict this browser-visible key to the intended origins and required APIs. Without it, the map uses an SVG fallback. The existing Mapbox configuration fields do not provide a complete Mapbox renderer.

### Supabase

For local database features, review and apply the SQL files in order:

1. `scripts/01-create-tables.sql`
2. `scripts/02-enable-rls.sql`
3. `scripts/03-seed-sample-data.sql` (optional sample records)

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Review row-level policies before using a shared project. A server-only `SUPABASE_SERVICE_ROLE_KEY` is referenced by observation ingestion, but the current write route has no caller authentication. Leave it unset for public demos until authorization is implemented.

## Checks and tests

```bash
npm run check
npm run build
npm test
```

The smoke suite starts a temporary production server on a free local port, exercises selected HTTP contracts, and shuts it down. Run `npm run build` first. Tests clear integration variables for their server process and make no WeatherAPI or Supabase requests.

GitHub Actions performs a clean npm install, lint, TypeScript checks, a production build, smoke tests, and Python syntax compilation. Passing CI verifies those checks; it does not certify the forecasting pipeline, database configuration, or external providers.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Map shows a simple SVG | Expected without a Google Maps key |
| No current conditions | Confirm WeatherAPI configuration and install Python dependencies in `venv/` |
| No forecasts generated | Check the combined CSV and all required model bundles; metadata alone is insufficient |
| Community features fail | Confirm Supabase configuration, tables, and policies |
| Smoke tests cannot start | Build first and ensure local listening ports are permitted |
| Changes to environment variables have no effect | Restart the development server; rebuild for browser-visible production settings |

## Deployment considerations

Use a Node.js host that also supports Python, dependencies, model files, and filesystem access. Review subprocess timeouts and hosting request limits. The current synchronous inference path is suitable for local exploration; an asynchronous service is a better next step for concurrent usage. Complete the follow-up work in [architecture notes](architecture.md#limitations-and-next-steps) before treating the app as production-ready.
