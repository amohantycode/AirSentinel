import { NextRequest, NextResponse } from "next/server"

// Simple inhalation rate multipliers by activity intensity (relative units)
const INTENSITY_FACTOR: Record<string, number> = {
  resting: 0.6,
  light: 1.0,
  moderate: 1.8,
  vigorous: 2.6,
}

// Sensitivity multipliers
const SENSITIVITY_FACTOR: Record<string, number> = {
  normal: 1.0,
  sensitive: 1.3,
}

// Indoor infiltration factor (fraction of outdoor concentration that penetrates indoors)
const INDOOR_FACTOR = 0.4

function parseNumber(value: string | null, fallback: number) {
  const n = value ? Number(value) : NaN
  return Number.isFinite(n) ? n : fallback
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const city = sp.get("city") || "Washington, DC"
    const start = sp.get("start") // ISO datetime
    const durationMin = parseNumber(sp.get("durationMin"), 60)
    const intensity = sp.get("intensity") || "moderate"
    const sensitivity = sp.get("sensitivity") || "normal"
    const indoors = sp.get("indoors") === "true"

    if (!start) {
      return NextResponse.json({ error: "Missing 'start' ISO datetime" }, { status: 400 })
    }

    // Fetch 7-day forecasts using existing endpoint
    const baseUrl = new URL(req.url)
    baseUrl.pathname = "/api/forecasts"
    baseUrl.search = `?city=${encodeURIComponent(city)}`

    const fRes = await fetch(baseUrl.toString(), { next: { revalidate: 300 } })
    if (!fRes.ok) {
      const txt = await fRes.text()
      return NextResponse.json({ error: "Forecast fetch failed", detail: txt }, { status: 502 })
    }
    const forecast = await fRes.json()

    // Pick the day matching the start date (daily resolution for MVP)
    const dateKey = new Date(start).toISOString().slice(0, 10)
    const pm = forecast?.forecasts?.pm25?.forecast as Array<{ date: string; value: number; aqi?: number }>
    const day = Array.isArray(pm) ? pm.find((d) => d.date === dateKey) : undefined

    // Fallback: use first day if exact date missing
    const concentration = day?.value ?? pm?.[0]?.value ?? 20 // µg/m3

    const durationH = Math.max(0.25, durationMin / 60)
    const intensityFactor = INTENSITY_FACTOR[intensity] ?? INTENSITY_FACTOR.moderate
    const sensitivityFactor = SENSITIVITY_FACTOR[sensitivity] ?? SENSITIVITY_FACTOR.normal
  const indoorFactor = indoors ? INDOOR_FACTOR : 1.0

    // Baseline expected inhaled dose (arbitrary relative units for MVP)
    const baselineDose = concentration * durationH * intensityFactor * sensitivityFactor * indoorFactor

    // Candidate alternatives
    const candidates = [
      {
        id: "baseline",
        label: "Keep plan",
        change: "No change",
        cost: 0,
        dose: baselineDose,
      },
      {
        id: "delay60",
        label: "Delay 1 hour",
        change: "+60 minutes",
        cost: 2,
        // For MVP, same daily conc (daily resolution). Could be slightly improved: assume 5% reduction.
        dose: baselineDose * 0.95,
      },
      {
        id: "shorten30",
        label: "Shorten by 30%",
        change: "Duration × 0.7",
        cost: 1.5,
        dose: baselineDose * 0.7,
      },
      {
        id: "indoors",
        label: "Move indoors",
        change: "Indoor setting",
        cost: 2,
        dose: (concentration * durationH * intensityFactor * sensitivityFactor) * INDOOR_FACTOR,
      },
    ]

    const withReduction = candidates.map((c) => ({
      ...c,
      reductionPct: Math.max(0, 100 * (1 - c.dose / baselineDose)),
    }))

    // Choose best with tie-break: minimal cost, then highest reduction
    const best = withReduction
      .slice()
      .sort((a, b) => (b.reductionPct - a.reductionPct) || (a.cost - b.cost))[0]

    // Simple uncertainty band (MVP): ±20%
    const ci = (val: number) => ({ low: Math.max(0, val * 0.8), high: val * 1.2 })

    return NextResponse.json({
      city,
      date: dateKey,
      inputs: { start, durationMin, intensity, sensitivity, indoors },
      concentration,
      baseline: { dose: baselineDose, ci: ci(baselineDose) },
      drivers: {
        intensityFactor,
        sensitivityFactor,
        indoorFactor,
        durationHours: durationH,
      },
      recommendation: best,
      alternatives: withReduction.sort((a, b) => b.reductionPct - a.reductionPct).slice(0, 3),
      note: "MVP daily-resolution model. Hourly refinement can further improve accuracy.",
    })
  } catch (e) {
    const err = e as Error
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
