import { NextRequest, NextResponse } from "next/server"

type GeoItem = {
  label: string
  lat: number
  lon: number
}

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim()
    if (!q) return NextResponse.json({ results: [] })

    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(q)}`
    const res = await fetch(url, {
      headers: { "User-Agent": "airsentinel/1.0 (contact@airsentinel.app)" },
      next: { revalidate: 600 },
    })
    if (!res.ok) throw new Error(`Geocode failed: ${res.status}`)
    const arr = await res.json()

    // Map to clean labels
    const results: GeoItem[] = (Array.isArray(arr) ? arr : []).map((r: any) => {
      const a = r?.address || {}
      const parts = [a.city || a.town || a.village || a.county || a.state, a.state && a.city ? a.state : undefined, a.country]
        .filter(Boolean)
        .join(", ")
      return {
        label: parts || r?.display_name || q,
        lat: Number(r.lat),
        lon: Number(r.lon),
      }
    })
      .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lon))

    return NextResponse.json({ results })
  } catch (e) {
    const err = e as Error
    return NextResponse.json({ error: err.message, results: [] }, { status: 500 })
  }
}
