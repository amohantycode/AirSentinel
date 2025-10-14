import { type NextRequest, NextResponse } from "next/server"

// GET /api/forecasts - Fetch air quality forecasts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const location = searchParams.get("location")
    const hours = Number.parseInt(searchParams.get("hours") || "24")

    // Mock forecast data - replace with actual Supabase query
    const mockForecasts = Array.from({ length: hours }, (_, i) => ({
      id: `forecast-${i}`,
      location_name: location || "Los Angeles, CA",
      lat: 34.0522,
      lon: -118.2437,
      forecast_date: new Date().toISOString().split("T")[0],
      forecast_hour: i,
      aqi_predicted: Math.round(75 + Math.sin(i / 3) * 20 + Math.random() * 10),
      confidence: 0.85,
      weather_temp: 72.5 + (i % 12) * 1.5,
      weather_humidity: 45.0 - (i % 12) * 2,
      weather_wind_speed: 8.5 + (i % 12) * 0.5,
      created_at: new Date().toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data: mockForecasts,
      count: mockForecasts.length,
    })
  } catch (error) {
    console.error("[v0] Error fetching forecasts:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch forecasts" }, { status: 500 })
  }
}
