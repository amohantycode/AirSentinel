import { NextRequest, NextResponse } from "next/server"

// Reuse the same factors as /api/assess
const INTENSITY_FACTOR: Record<string, number> = {
  resting: 0.6,
  light: 1.0,
  moderate: 1.8,
  vigorous: 2.6,
}

const SENSITIVITY_FACTOR: Record<string, number> = {
  normal: 1.0,
  sensitive: 1.3,
}

const INDOOR_FACTOR = 0.4

// Lightweight diurnal profile (relative multipliers that average ~1.0)
const DIURNAL_PM25 = [
  1.2, 1.18, 1.15, 1.1, 1.05, 0.95, 0.9, 0.85, 0.8, 0.78, 0.8, 0.85,
  0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2, 1.22, 1.25, 1.22, 1.18, 1.15,
]

const WEATHER_API_BASE = "https://api.weatherapi.com/v1"
// Note: For production, prefer process.env instead of hardcoding.
const WEATHER_API_KEY = "3d5656d3a8e3463da0f220049252110"

function parseNumber(value: string | null, fallback: number) {
  const n = value ? Number(value) : NaN
  return Number.isFinite(n) ? n : fallback
}

type HourPoint = {
  time: string
  epoch: number
  pm25: number
  aqi?: number
}

// Simple AQI conversion for PM2.5 (µg/m³)
function aqiFromPM25(pm: number) {
  const bp = [
    [0.0, 12.0, 0, 50],
    [12.1, 35.4, 51, 100],
    [35.5, 55.4, 101, 150],
    [55.5, 150.4, 151, 200],
    [150.5, 250.4, 201, 300],
    [250.5, 350.4, 301, 400],
    [350.5, 500.4, 401, 500],
  ] as const
  for (const [Cl, Ch, Il, Ih] of bp) {
    if (pm >= Cl && pm <= Ch) {
      return Math.round(((Ih - Il) / (Ch - Cl)) * (pm - Cl) + Il)
    }
  }
  return undefined
}

async function fetchHourlyWeatherAPI(city: string) {
  const url = `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(city)}&days=1&aqi=yes`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`WeatherAPI forecast failed: ${res.status}`)
  const data = await res.json()
  const hours = data?.forecast?.forecastday?.[0]?.hour
  if (!Array.isArray(hours) || hours.length === 0) return [] as HourPoint[]
  // Try to extract pm2_5 from each hour's air_quality, fallback to undefined
  const points: HourPoint[] = hours.map((h: any) => {
    const pm25 = h?.air_quality?.pm2_5 ?? h?.air_quality?.pm2_5 ?? undefined
    const val = typeof pm25 === "number" ? pm25 : undefined
    return {
      time: h.time, // local time string e.g. "2025-10-25 13:00"
      epoch: h.time_epoch,
      pm25: val as number,
      aqi: typeof val === "number" ? aqiFromPM25(val) : undefined,
    } as HourPoint
  })
  return points
}

async function fetchDailyFallback(req: NextRequest, city: string) {
  // Use our own /api/forecasts for a daily mean fallback
  const url = new URL(req.url)
  url.pathname = "/api/forecasts"
  url.search = `?city=${encodeURIComponent(city)}`
  const r = await fetch(url.toString(), { next: { revalidate: 300 } })
  if (!r.ok) return 20
  const j = await r.json()
  const first = j?.forecasts?.pm25?.forecast?.[0]?.value
  return typeof first === "number" ? first : 20
}

function fillWithDiurnal(base: number, startEpoch?: number): HourPoint[] {
  const avg = DIURNAL_PM25.reduce((a, b) => a + b, 0) / DIURNAL_PM25.length
  const scale = base / avg
  const start = startEpoch ? startEpoch : Math.floor(Date.now() / 1000)
  const startDate = new Date(start * 1000)
  const yyyy = startDate.getFullYear()
  const mm = String(startDate.getMonth() + 1).padStart(2, "0")
  const dd = String(startDate.getDate()).padStart(2, "0")
  return DIURNAL_PM25.map((m, i) => {
    const epoch = start + i * 3600
    const dt = new Date(epoch * 1000)
    const hh = String(dt.getHours()).padStart(2, "0")
    return {
      time: `${yyyy}-${mm}-${dd} ${hh}:00`,
      epoch,
      pm25: Math.max(0, m * scale),
      aqi: aqiFromPM25(Math.max(0, m * scale)),
    }
  })
}

function computeBestWindows(points: HourPoint[], durationMin: number, intensity: string, sensitivity: string, indoors: boolean) {
  const durationH = Math.max(0.25, durationMin / 60)
  const stepH = 1 // slide in 1-hour steps
  const intensityFactor = INTENSITY_FACTOR[intensity] ?? INTENSITY_FACTOR.moderate
  const sensitivityFactor = SENSITIVITY_FACTOR[sensitivity] ?? SENSITIVITY_FACTOR.normal
  const infil = indoors ? INDOOR_FACTOR : 1.0

  const windows: Array<{ startIdx: number; endIdx: number; startTime: string; endTime: string; mean: number; dose: number }> = []

  for (let i = 0; i < points.length; i += stepH) {
    const startIdx = i
    const endIdx = Math.min(points.length - 1, i + Math.ceil(durationH) - 1)
    if (endIdx < startIdx) continue
    const slice = points.slice(startIdx, endIdx + 1)
    // Approximate mean over the window (ignore partial hour precision for MVP)
    const mean = slice.reduce((s, p) => s + (typeof p.pm25 === "number" ? p.pm25 : 0), 0) / slice.length
    const dose = mean * durationH * intensityFactor * sensitivityFactor * infil
    windows.push({ startIdx, endIdx, startTime: points[startIdx].time, endTime: points[endIdx].time, mean, dose })
  }

  // Find best (min dose) and worst (max dose) to compute reductions
  const sorted = windows.slice().sort((a, b) => a.dose - b.dose)
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]
  const top3 = sorted.slice(0, 3).map((w) => ({
    startTime: w.startTime,
    endTime: w.endTime,
    mean: Number(w.mean.toFixed(1)),
    dose: Number(w.dose.toFixed(1)),
    reductionPct: Math.max(0, Math.round(100 * (1 - w.dose / worst.dose))),
  }))

  return { best, worst, top3 }
}

async function getMLDailyBase(req: NextRequest, city: string, date: string) {
  try {
    const url = new URL(req.url)
    url.pathname = "/api/forecasts"
    url.search = `?city=${encodeURIComponent(city)}`
    const r = await fetch(url.toString(), { next: { revalidate: 300 } })
    if (!r.ok) return undefined
    const j = await r.json()
    const arr = j?.forecasts?.pm25?.forecast as Array<{ date: string; value: number }>
    const day = Array.isArray(arr) ? arr.find((d) => d.date === date) : undefined
    return typeof day?.value === "number" ? day.value : undefined
  } catch {
    return undefined
  }
}

function gen24hForDate(date: string, values: number[]): HourPoint[] {
  const yyyy = date.slice(0, 4)
  const mm = date.slice(5, 7)
  const dd = date.slice(8, 10)
  return values.slice(0, 24).map((v, h) => {
    const hh = String(h).padStart(2, "0")
    const pm = Math.max(0, v)
    return {
      time: `${yyyy}-${mm}-${dd} ${hh}:00`,
      epoch: 0,
      pm25: pm,
      aqi: aqiFromPM25(pm),
    }
  })
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const city = sp.get("city") || "Washington, DC"
    const durationMin = parseNumber(sp.get("durationMin"), 60)
    const intensity = sp.get("intensity") || "moderate"
    const sensitivity = sp.get("sensitivity") || "normal"
    const indoors = sp.get("indoors") === "true"
    const date = (sp.get("date") || new Date().toISOString().slice(0, 10)).slice(0, 10)

    // 1) Get ML daily base concentration for the requested date
    const mlBase = await getMLDailyBase(req, city, date)

    // 2) Try WeatherAPI hourly for shape on the requested date (up to 3 days supported); if available, scale to ML base
    let points: HourPoint[] = []
    try {
      const url = `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(city)}&days=3&aqi=yes`
      const res = await fetch(url, { next: { revalidate: 300 } })
      if (res.ok) {
        const data = await res.json()
        const dayArr = data?.forecast?.forecastday ?? []
        const day = dayArr.find((d: any) => d?.date === date)
        const hours = day?.hour ?? []
        if (Array.isArray(hours) && hours.length) {
          const rawVals: number[] = hours.map((h: any) => (typeof h?.air_quality?.pm2_5 === "number" ? h.air_quality.pm2_5 : NaN))
          const nums = rawVals.filter((x) => Number.isFinite(x))
          if (nums.length >= 6) {
            const providerMean = nums.reduce((a, b) => a + b, 0) / nums.length
            const targetMean = typeof mlBase === "number" ? mlBase : providerMean
            const scale = providerMean > 0 ? targetMean / providerMean : 1
            const scaled = hours.map((h: any, hIdx: number) => {
              const base = typeof h?.air_quality?.pm2_5 === "number" ? h.air_quality.pm2_5 : providerMean
              const val = Math.max(0, base * scale)
              const hh = String(hIdx).padStart(2, "0")
              const time = `${date} ${hh}:00`
              return { time, epoch: h.time_epoch ?? 0, pm25: val, aqi: aqiFromPM25(val) } as HourPoint
            })
            points = scaled
          }
        }
      }
    } catch {
      // ignore provider errors
    }

    // 3) If hourly shape not available, or insufficient quality, use diurnal scaled to ML base or daily fallback
    const hasNumeric = points.filter((p) => typeof p.pm25 === "number" && !isNaN(p.pm25)).length
    if (points.length === 0 || hasNumeric < 6) {
      const base = typeof mlBase === "number" ? mlBase : await fetchDailyFallback(req, city)
      const avg = DIURNAL_PM25.reduce((a, b) => a + b, 0) / DIURNAL_PM25.length
      const scale = base / avg
      points = gen24hForDate(date, DIURNAL_PM25.map((m) => Math.max(0, m * scale)))
    }

    // 4) Compute windows
    const { best, worst, top3 } = computeBestWindows(points, durationMin, intensity, sensitivity, indoors)

    // 5) Response for charting and advice
    return NextResponse.json({
      city,
      date,
      inputs: { durationMin, intensity, sensitivity, indoors },
      hours: points.map((p) => ({ time: p.time, epoch: p.epoch, pm25: Number(p.pm25.toFixed?.(1) ?? p.pm25), aqi: p.aqi })),
      recommendation: {
        label: `Best window: ${best.startTime} → ${best.endTime}`,
        reductionPct: Math.max(0, Math.round(100 * (1 - best.dose / worst.dose))),
        meanConc: Number(best.mean.toFixed(1)),
      },
      windows: top3,
      note: hasNumeric < 6
        ? "Used diurnal profile scaled to ML daily forecast."
        : "Hourly shape scaled to ML daily forecast.",
    })
  } catch (e) {
    const err = e as Error
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
