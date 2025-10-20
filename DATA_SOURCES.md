# Air Quality Data Sources

## Current Data Status

### Map Page Data

**Currently:** The map is showing **MOCK/SAMPLE DATA** 🔴

The application is designed to fetch real air quality data from your Supabase database, but it falls back to sample data if:
- Supabase is not configured
- The database tables don't exist
- No data has been imported yet

### Sample Data Locations

The mock data includes 8 US cities with fake AQI values:
- Los Angeles, CA - AQI: 87
- San Francisco, CA - AQI: 42
- New York, NY - AQI: 55
- Chicago, IL - AQI: 68
- Houston, TX - AQI: 72
- Phoenix, AZ - AQI: 95
- Seattle, WA - AQI: 38
- Denver, CO - AQI: 61

## Setting Up Real Data

To display **REAL air quality data**, follow these steps:

### Step 1: Configure Supabase

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project
3. Get your project credentials from Project Settings > API
4. Add to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 2: Create Database Tables

Run the SQL scripts in order:

1. **Create Tables** (`scripts/01-create-tables.sql`):
   ```sql
   -- Creates: observations, forecasts, alerts, reports tables
   ```

2. **Enable RLS** (`scripts/02-enable-rls.sql`):
   ```sql
   -- Sets up Row Level Security policies
   ```

3. **Seed Sample Data** (Optional - `scripts/03-seed-sample-data.sql`):
   ```sql
   -- Inserts sample data for testing
   ```

**How to run:**
- Go to Supabase Dashboard > SQL Editor
- Copy and paste each script
- Run them in order

### Step 3: Import Real Air Quality Data

The project includes Python ETL scripts to fetch real data from AirNow API:

#### **AirNow API Setup**

1. Sign up for a free AirNow API key at: [https://docs.airnowapi.org/account/request/](https://docs.airnowapi.org/account/request/)
2. You'll receive an API key via email (usually within a few hours)

#### **Run ETL Scripts**

**Prerequisites:**
```bash
pip install requests python-dotenv
```

**Environment Variables** (create `scripts/.env`):
```env
AIRNOW_API_KEY=your_airnow_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key
```

**Import Current Observations:**
```bash
cd scripts
python upsert-observations.py
```

**Import Forecasts:**
```bash
python etl-forecast.py
```

**Import from AirNow:**
```bash
python etl-airnow.py
```

### Step 4: Verify Real Data is Loading

1. Restart your Next.js dev server:
   ```bash
   npm run dev
   ```

2. Navigate to `/map`

3. Check for the alert banner:
   - ✅ **No alert** = Real data is loading
   - ⚠️ **"Sample Data" alert** = Using mock data (Supabase not configured)

4. Open browser console to see fetch attempts:
   ```
   Success: "Fetched 50 observations from API"
   Error: "Could not load real-time data. Showing sample data."
   ```

## Data Flow Architecture

```
┌─────────────┐
│  AirNow API │ (Real-time air quality data)
└──────┬──────┘
       │
       ↓
┌──────────────┐
│ Python ETL   │ (Fetch & transform data)
│   Scripts    │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   Supabase   │ (PostgreSQL database)
│   Database   │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  Next.js API │ (/api/observations)
│    Routes    │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  Map Page    │ (Display on Google Maps)
│  Component   │
└──────────────┘
```

## Real Data Sources

### 1. **AirNow API**
- **Provider:** US EPA
- **Coverage:** United States
- **Data:** Current AQI, forecasts, alerts
- **Update Frequency:** Hourly
- **Cost:** FREE (with API key)
- **Documentation:** https://docs.airnowapi.org/

### 2. **PurpleAir** (Alternative)
- **Coverage:** Worldwide (crowdsourced sensors)
- **API:** https://api.purpleair.com/
- **Cost:** Free tier available

### 3. **OpenAQ** (Alternative)
- **Coverage:** Global
- **API:** https://docs.openaq.org/
- **Cost:** Free

## API Endpoints

### GET `/api/observations`

Fetches air quality observations from Supabase.

**Query Parameters:**
- `location` - Filter by location name (optional)
- `limit` - Number of results (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "location_name": "Los Angeles",
      "latitude": 34.0522,
      "longitude": -118.2437,
      "aqi": 87,
      "aqi_category": "Moderate",
      "pm25": 35.5,
      "pm10": 42.0,
      "created_at": "2025-10-20T12:00:00Z"
    }
  ],
  "count": 1
}
```

### GET `/api/forecasts`

Fetches AQI forecasts.

### GET `/api/alerts`

Fetches air quality alerts.

### GET `/api/reports`

Fetches detailed reports.

## Database Schema

### `observations` Table

| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| location_name | text | Location name |
| latitude | numeric | Latitude |
| longitude | numeric | Longitude |
| aqi | integer | Air Quality Index |
| aqi_category | text | AQI category |
| pm25 | numeric | PM2.5 level |
| pm10 | numeric | PM10 level |
| o3 | numeric | Ozone level |
| no2 | numeric | Nitrogen dioxide |
| so2 | numeric | Sulfur dioxide |
| co | numeric | Carbon monoxide |
| created_at | timestamp | Timestamp |

## Automation

### Set Up Cron Jobs

To keep data fresh, run ETL scripts automatically:

**Using cron (Linux/Mac):**
```bash
# Edit crontab
crontab -e

# Add this line to run every hour
0 * * * * cd /path/to/scripts && python upsert-observations.py
```

**Using GitHub Actions:**
```yaml
name: Update Air Quality Data
on:
  schedule:
    - cron: '0 * * * *'  # Every hour
jobs:
  update-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run ETL
        env:
          AIRNOW_API_KEY: ${{ secrets.AIRNOW_API_KEY }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
        run: |
          pip install requests python-dotenv
          cd scripts
          python upsert-observations.py
```

## Troubleshooting

### "Sample Data" Alert Showing?

**Check:**
1. ✅ Supabase URL and key in `.env.local`
2. ✅ Tables created in Supabase
3. ✅ Data imported (run ETL scripts)
4. ✅ Dev server restarted after .env changes

### API Returning Empty Data?

**Solutions:**
- Run seed script: `scripts/03-seed-sample-data.sql`
- Run ETL scripts to import real data
- Check Supabase table browser to verify data exists

### ETL Script Errors?

**Common Issues:**
- Missing AirNow API key
- Invalid Supabase credentials
- Network/firewall blocking API requests
- Rate limits exceeded (AirNow: 500 requests/hour)

## Next Steps

1. **✅ Set up Supabase** - Configure database
2. **✅ Run SQL scripts** - Create tables
3. **✅ Get AirNow API key** - Register for free
4. **✅ Run ETL scripts** - Import real data
5. **✅ Automate updates** - Set up cron jobs
6. **🎉 Real data live!** - Verify on map

## Resources

- [AirNow API Docs](https://docs.airnowapi.org/)
- [Supabase Documentation](https://supabase.com/docs)
- [EPA AQI Guide](https://www.airnow.gov/aqi/aqi-basics/)
- [Air Quality Data Sources](https://www.epa.gov/outdoor-air-quality-data)
