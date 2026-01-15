import { NextRequest, NextResponse } from "next/server"
import { spawnSync } from "child_process"
import path from "path"

/**
 * GET /api/current-aq
 * 
 * Fetches REAL-TIME current air quality for a location using WeatherAPI
 * 
 * Query params:
 *   - city: Location name (e.g., "Washington, DC")
 * 
 * Returns:
 *   {
 *     "city": "Washington, DC",
 *     "timestamp": "2025-10-21T...",
 *     "current": {
 *       "pm25": { "value": 9.15, "unit": "µg/m³", "aqi": 38, "category": "Good" },
 *       "o3": { "value": 0.033, "unit": "ppm", "aqi": 30, "category": "Good" },
 *       "no2": { "value": 8.86, "unit": "ppb", "aqi": 8, "category": "Good" }
 *     }
 *   }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get("city") || "Washington, DC"
    const WEATHER_API_KEY = process.env.WEATHER_API_KEY

    if (!WEATHER_API_KEY) {
        return NextResponse.json({ error: "Missing WEATHER_API_KEY in environment variables" }, { status: 500 })
    }

    const scriptPath = path.join(process.cwd(), "scripts", "fetch_current_aq.py")

    const result = spawnSync("python3", [scriptPath, WEATHER_API_KEY, city], {
      encoding: "utf-8",
      timeout: 15000,
    })

    if (result.error) {
        throw result.error
    }

    if (result.status !== 0) {
        throw new Error(result.stderr || `Process exited with code ${result.status}`)
    }

    const output = JSON.parse(result.stdout)
    if (output.error) {
        throw new Error(output.error)
    }

    return NextResponse.json(output, {
      headers: {
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    })
  } catch (error) {
    const err = error as Error
    console.error("[Current AQ API] Error:", err.message)
    return NextResponse.json(
      {
        error: "Failed to fetch current air quality",
        details: err.message,
      },
      { status: 500 }
    )
  }
}
