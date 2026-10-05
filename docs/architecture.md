# Architecture and engineering tradeoffs

## Application boundaries

The application uses the Next.js App Router. React pages and components render maps, charts, activity forms, and community features. Route handlers under `app/api/` serve JSON, query Supabase through REST, read local datasets, or invoke Python scripts.

The forecast path requires a Node.js server with Python and a local filesystem. A static export or Edge-only deployment cannot execute this pipeline.

## Request flows

### Observations and map

`GET /api/observations` first reads `public/data-2025-latest.json`, filters location names, and limits results. If that file cannot be read, the handler falls back to Supabase. The map renders through Google Maps when configured, otherwise through an SVG overview. If the observation request fails or returns no results, the page uses sample locations.

Bundled observations retain their original dates and source labels. They are historical snapshots. Repeated requests do not make them live data.

### Current conditions and forecasts

`GET /api/current-aq` invokes `scripts/fetch_current_aq.py`. The script calls WeatherAPI and converts the pollutant values into the application's display units.

`GET /api/forecasts` invokes `scripts/forecast_api_hybrid.py`, which:

1. Fetches current pollutant concentrations from WeatherAPI.
2. Reads historical observations from `data/combined-historical-2020-2025.csv`.
3. Builds lag, rolling-mean, calendar, and location features.
4. Loads each available `models/daily_7d/*_7d.joblib` bundle.
5. Returns up to seven daily predictions per available pollutant.

The route uses an argument array when starting Python, avoiding shell interpolation of city input. Subprocess execution is synchronous and has a timeout. Responses carry cache-control headers; there is no persistent inference cache or background job queue.

The historical-data loader can fall back to older records or other DC/Maryland locations when exact recent data is unavailable. Short sequences may be padded. These choices should be part of model evaluation before interpreting forecasts as location-specific predictions.

### Activity assessments

`GET /api/assess` reads daily PM2.5 predictions and computes:

```text
relative exposure = concentration × duration in hours
                  × intensity factor × sensitivity factor × indoor factor
```

The handler compares keeping the plan, delaying one hour, shortening by 30%, and moving indoors. Candidates are ranked by exposure reduction, with a cost tie-break. The indoor multiplier is fixed at `0.4`, the assumed delay benefit is `5%`, and the displayed band is a fixed `±20%`. These are prototype assumptions, not fitted uncertainty estimates.

`GET /api/assess/best-hours` uses provider hourly concentrations when available. Otherwise, it constructs a daily profile scaled to an available daily estimate or fallback value. The implementation approximates activity windows at hourly resolution.

### Optional persistence

Supabase stores observations, community reports, and alert subscriptions. SQL definitions, row-level policies, and seed records live in `scripts/01-create-tables.sql` through `03-seed-sample-data.sql`. The frontend uses a public anonymous key; some observation operations also support a server-only service-role key.

Subscription storage does not include an email sender, scheduler, or delivery monitoring.

## Why these choices fit a prototype

| Decision | Benefit | Cost |
| --- | --- | --- |
| Next.js pages and APIs in one project | Small local setup and shared TypeScript types | UI and request execution share deployment resources |
| Python for forecasting | Reuses pandas, scikit-learn, and CatBoost | Requires a Python runtime alongside Node.js |
| Bundled observation snapshots | Reviewers can explore data without credentials | Snapshots do not update automatically |
| Supabase REST integration | Optional persistence without a custom database server | Authorization depends on correctly configured policies |
| Relative exposure calculation | Factors are visible and easy to inspect | Fixed assumptions cannot establish health outcomes |

## Limitations and next steps

- **Forecast reproducibility:** daily model metadata is committed, but the required model bundles and combined historical CSV are absent. Restore versioned artifacts and publish training instructions and evaluation outputs together.
- **Evaluation:** no reproducible held-out results for the daily forecast pipeline are published here. Verify the temporal split, overlapping target windows, location handling, unit conversions, and persistence baseline before reporting accuracy.
- **Request execution:** `spawnSync` blocks the Node.js event loop. Move inference to a worker or service, with timeouts, request limits, caching, and structured failure responses.
- **Input validation:** numeric ranges, dates, and malformed provider responses need more consistent validation across routes. Smoke tests cover selected contracts, not all edge cases.
- **Data provenance:** the historical endpoint can fall back to provider forecasts, and best-hour profiles may be synthetic. Separate observed, forecast, and constructed values explicitly throughout the interface.
- **AQI consistency:** conversion tables are duplicated across Python and TypeScript. Consolidate and verify breakpoints, precision rules, and pollutant averaging periods against current standards before operational use.
- **Database authorization:** review the supplied policies before deployment. The observation write handler can use a service-role key and does not implement caller authentication; do not enable it on a public deployment without adding authorization.
- **Deployment readiness:** this cleanup is not a production or security audit. Authentication, rate limiting, dependency maintenance, monitoring, and external-service integration tests remain follow-up work.
