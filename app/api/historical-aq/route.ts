import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const dynamic = "force-dynamic"

const WEATHER_API_KEY = process.env.WEATHER_API_KEY || ""

// EPA AQI Breakpoints for PM2.5 (µg/m³)
const PM25_BREAKPOINTS = [
  { cLow: 0, cHigh: 12.0, iLow: 0, iHigh: 50 },
  { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
  { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
  { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500 },
]

interface Breakpoint {
  cLow: number
  cHigh: number
  iLow: number
  iHigh: number
}

function calculateAQI(concentration: number, breakpoints: Breakpoint[]): number {
  for (const bp of breakpoints) {
    if (concentration >= bp.cLow && concentration <= bp.cHigh) {
      const aqi = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (concentration - bp.cLow) + bp.iLow
      return Math.round(aqi)
    }
  }
  // If above highest breakpoint, return max AQI
  return breakpoints[breakpoints.length - 1].iHigh
}

function calculatePM25AQI(pm25: number): number {
  return calculateAQI(pm25, PM25_BREAKPOINTS)
}

function getAQICategory(aqi: number): string {
  if (aqi <= 50) return "Good"
  if (aqi <= 100) return "Moderate"
  if (aqi <= 150) return "Unhealthy for Sensitive Groups"
  if (aqi <= 200) return "Unhealthy"
  if (aqi <= 300) return "Very Unhealthy"
  return "Hazardous"
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city") || "Washington, DC"
    const days = parseInt(searchParams.get("days") || "7")

    if (![7, 30, 90, 365].includes(days)) {
      return NextResponse.json(
        { success: false, error: "Days must be 7, 30, 90, or 365" },
        { status: 400 }
      )
    }

    interface PollutantData {
      value: number
      unit: string
    }

    interface HistoricalDataPoint {
      date: string
      aqi: number
      pm25: number | PollutantData
      o3?: PollutantData
      no2?: PollutantData
      category: string
      dominantPollutant?: string
    }

    const historicalData: HistoricalDataPoint[] = []
    const today = new Date()

    // 1) Try LOCAL EPA historical CSV first (authoritative for DMV)
    const csvPath = path.join(process.cwd(), "data", "combined-historical-2020-2025.csv")
    try {
      if (fs.existsSync(csvPath)) {
        const raw = fs.readFileSync(csvPath, "utf-8")
        const lines = raw.split(/\r?\n/)
        const header = lines.shift() || ""
        const cols = header.split(",").map((h) => h.trim().toLowerCase())
        const idxDate = cols.indexOf("date")
        const idxPollutant = cols.indexOf("pollutant")
        const idxConc = cols.indexOf("concentration")
        const idxLocation = cols.indexOf("location")
        const idxState = cols.indexOf("state")

        const cityLower = city.toLowerCase()
        const cutoff = new Date(today)
        cutoff.setDate(cutoff.getDate() - (isNaN(days) ? 7 : days) + 1)

        // Group by date: collect PM2.5 concentrations
        const byDate: Record<string, number[]> = {}

        for (const line of lines) {
          if (!line) continue
          const parts = line.split(",")
          if (parts.length < Math.max(idxDate, idxPollutant, idxConc, idxLocation, idxState) + 1) continue
          const dstr = parts[idxDate]
          const pol = parts[idxPollutant]
          const concStr = parts[idxConc]
          const loc = (parts[idxLocation] || "").toLowerCase()
          const st = (parts[idxState] || "").toLowerCase()

          if (pol !== "PM2.5") continue
          // loose match: either location or state appears in the query string
          if (!(cityLower.includes(loc) || cityLower.includes(st) || loc.includes(cityLower) || st.includes(cityLower))) continue

          const d = new Date(dstr)
          if (isNaN(d.getTime())) continue
          if (d < cutoff || d > today) continue

          const conc = parseFloat(concStr)
          if (!Number.isFinite(conc)) continue

          const key = d.toISOString().slice(0, 10)
          byDate[key] = byDate[key] || []
          byDate[key].push(conc)
        }

        // Build daily points sorted ascending
        const keys = Object.keys(byDate).sort()
        for (const k of keys) {
          const vals = byDate[k]
          if (!vals?.length) continue
          const mean = vals.reduce((a, b) => a + b, 0) / vals.length
          const aqiValue = calculatePM25AQI(mean)
          historicalData.push({
            date: k,
            pm25: { value: Math.round(mean * 10) / 10, unit: "µg/m³" },
            aqi: aqiValue,
            category: getAQICategory(aqiValue),
            dominantPollutant: "PM2.5",
          })
        }
      }
    } catch (err) {
      console.error("Error reading local CSV:", err)
    }

    // 2) If local CSV produced no results, fall back to provider (limited) to avoid blanks
    if (historicalData.length === 0 && WEATHER_API_KEY) {
      const forecastUrl = `http://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(city)}&days=7&aqi=yes`
      try {
        const forecastResponse = await fetch(forecastUrl)
        if (forecastResponse.ok) {
          const forecastData = await forecastResponse.json()
          if (forecastData?.forecast?.forecastday) {
            for (const dayForecast of forecastData.forecast.forecastday) {
              const dayData = dayForecast.day
              const pm25 = dayData?.air_quality?.pm2_5
              if (!Number.isFinite(pm25)) continue
              const aqiValue = calculatePM25AQI(pm25)
              historicalData.push({
                date: dayForecast.date,
                pm25: { value: Math.round(pm25 * 10) / 10, unit: "µg/m³" },
                aqi: aqiValue,
                category: getAQICategory(aqiValue),
                dominantPollutant: "PM2.5",
              })
            }
          }
        }
      } catch (err) {
        console.error("Provider fallback failed:", err)
      }
    }

    // 3) Do NOT synthesize artificial history; if less than requested days, just return what we have

    // Sort by date ascending (oldest first)
    historicalData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Trim to requested days (oldest first)
  const data = historicalData.slice(-days)

    // Calculate summary statistics
    const avgAQI = data.length > 0
      ? Math.round(data.reduce((sum, d) => sum + d.aqi, 0) / data.length)
      : 0

    const goodDays = data.filter((d) => d.aqi <= 50).length
    const moderateDays = data.filter((d) => d.aqi > 50 && d.aqi <= 100).length
    const unhealthyDays = data.filter((d) => d.aqi > 100).length

    return NextResponse.json({
      success: true,
      city,
      days,
      timestamp: new Date().toISOString(),
      data,
      summary: {
        avgAQI,
        goodDays,
        moderateDays,
        unhealthyDays,
        totalDays: data.length,
      },
    })
  } catch (error) {
    console.error("Error fetching historical data:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch historical air quality data",
      },
      { status: 500 }
    )
  }
}
