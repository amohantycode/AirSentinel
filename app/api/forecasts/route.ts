import { NextRequest, NextResponse } from "next/server"
import { execSync } from "child_process"
import path from "path"

/**
 * GET /api/forecasts
 *
 * 7-DAY AIR QUALITY FORECAST ENDPOINT
 * ════════════════════════════════════════════════════════════════════
 *
 * QUERY PARAMETERS:
 *   city (required):  Location name or coordinates
 *                     Examples: "Washington, DC", "Baltimore, MD", "Arlington, VA"
 *   key (required):   WeatherAPI key (get free at https://www.weatherapi.com/)
 *
 * RETURNS:
 *   {
 *     "city": "Washington, DC",
 *     "timestamp": "2025-10-21T15:30:45Z",
 *     "forecasts": {
 *       "pm25": {
 *         "unit": "µg/m³",
 *         "forecast": [
 *           {
 *             "date": "2025-10-22",
 *             "value": 18.5,        ← concentration in µg/m³
 *             "aqi": 65,            ← EPA AQI (0-500)
 *             "category": "Moderate" ← health category
 *           },
 *           ... (7 days)
 *         ]
 *       },
 *       "ozone": { ... },          ← if NO₂ model trained
 *       "no2": { ... }             ← if Ozone model trained
 *     }
 *   }
 *
 * EXAMPLE REQUESTS:
 *
 * 1. Basic forecast:
 *    GET /api/forecasts?city=Washington,DC&key=YOUR_API_KEY
 *
 * 2. Using coordinates:
 *    GET /api/forecasts?city=38.9072,-77.0369&key=YOUR_API_KEY
 *
 * 3. Using fetch():
 *    const res = await fetch(
 *      '/api/forecasts?city=Washington,DC&key=YOUR_API_KEY'
 *    )
 *    const data = await res.json()
 *
 * 4. Using cURL:
 *    curl -s "http://localhost:3000/api/forecasts?city=Washington,DC&key=YOUR_KEY"
 *
 * FORECAST DATA BREAKDOWN:
 *   ┌─────────────────────────────────────────────────────────┐
 *   │ Field       │ Meaning                                     │
 *   ├─────────────────────────────────────────────────────────┤
 *   │ date        │ YYYY-MM-DD format (7 future days)          │
 *   │ value       │ Predicted pollutant concentration          │
 *   │ aqi         │ EPA Air Quality Index (0-500)              │
 *   │ category    │ Health advisory (Good/Moderate/Unhealthy) │
 *   └─────────────────────────────────────────────────────────┘
 *
 * AQI CATEGORIES:
 *   0-50:     Good                              ✅
 *   51-100:   Moderate                          ⚠️
 *   101-150:  Unhealthy for Sensitive Groups   ⚠️⚠️
 *   151-200:  Unhealthy                        ⛔
 *   201-300:  Very Unhealthy                   ⛔⛔
 *   301-500:  Hazardous                        ⛔⛔⛔
 *
 * MODELS:
 *   - PM2.5:  Trained on 71,299 EPA records (2020-2025)
 *   - Ozone:  Trained on 71,299 EPA records (2020-2025)
 *   - NO₂:    Trained on 71,299 EPA records (2020-2025)
 *   Location: DMV Region (DC, Maryland, Virginia)
 *
 * CACHING:
 *   Results cached for 1 hour per city
 *   Use timestamp to detect stale forecasts
 */
// WeatherAPI key hardcoded server-side (NEVER expose in client code)
const WEATHER_API_KEY = "3d5656d3a8e3463da0f220049252110"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get("city")

    if (!city) {
      return NextResponse.json(
        {
          error: "Missing required parameter: city",
          required: {
            city: "Location name or coordinates (e.g., 'Washington, DC')"
          },
          example: "/api/forecasts?city=Washington,DC",
          note: "API key is handled server-side for security"
        },
        { status: 400 }
      )
    }

    // Call Python HYBRID forecast script (real WeatherAPI current + local EPA history)
    const scriptPath = path.join(process.cwd(), "scripts", "forecast_api_hybrid.py")
    const pythonPath = path.join(process.cwd(), "venv", "bin", "python3")

    let output
    try {
      output = execSync(`${pythonPath} ${scriptPath} "${city}" "${WEATHER_API_KEY}"`, {
        encoding: "utf-8",
        timeout: 120000, // 2 minutes max wait
        stdio: ["pipe", "pipe", "pipe"],
      })
    } catch (execError) {
      const error = execError as { message: string; stderr?: Buffer }
      console.error("[Forecast API] Python execution failed:", error.message)
      return NextResponse.json(
        {
          error: "Forecast generation failed",
          city,
          reason: error.stderr?.toString() || error.message,
          hint: "Check WeatherAPI key and city name validity"
        },
        { status: 500 }
      )
    }

    const result = JSON.parse(output)

    // Check if we got any forecasts
    if (!result.forecasts || Object.keys(result.forecasts).length === 0) {
      return NextResponse.json(
        {
          error: "No forecasts generated",
          city,
          details: {
            pm25: "Not available" in result ? "Check model file" : "OK",
            ozone: "Check WeatherAPI data availability",
            no2: "Check WeatherAPI data availability"
          }
        },
        { status: 500 }
      )
    }

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Content-Type": "application/json",
      }
    })
  } catch (error) {
    const err = error as Error
    console.error("[Forecast API] Error:", err)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: err.message
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/forecasts
 * Alternative: Send city and key in request body instead of query params
 *
 * EXAMPLE:
 *   POST /api/forecasts
 *   Content-Type: application/json
 *   {
 *     "city": "Washington, DC",
 *     "key": "YOUR_WEATHERAPI_KEY"
 *   }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { city, key } = body

    if (!city || !key) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["city", "key"]
        },
        { status: 400 }
      )
    }

    // Reuse GET by creating request with query params
    const url = new URL(request.url)
    url.pathname = "/api/forecasts"
    url.searchParams.set("city", city)
    url.searchParams.set("key", key)

    return GET(new NextRequest(url))
  } catch (error) {
    const err = error as Error
    return NextResponse.json(
      {
        error: "Invalid request body",
        message: err.message
      },
      { status: 400 }
    )
  }
}
