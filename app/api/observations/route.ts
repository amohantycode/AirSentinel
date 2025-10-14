import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const location = searchParams.get("location")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ success: false, error: "Supabase configuration missing" }, { status: 500 })
    }

    let url = `${supabaseUrl}/rest/v1/observations?select=*&order=created_at.desc&limit=${limit}`

    if (location) {
      url += `&location_name=ilike.%${location}%`
    }

    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Supabase request failed: ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    })
  } catch (error) {
    console.error("[v0] Error fetching observations:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch observations" }, { status: 500 })
  }
}

// POST /api/observations - Create new observation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { location_name, lat, lon, aqi, source } = body
    if (!location_name || !lat || !lon || aqi === undefined || !source) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ success: false, error: "Supabase configuration missing" }, { status: 500 })
    }

    const observation = {
      ...body,
      observed_at: body.observed_at || new Date().toISOString(),
      created_at: new Date().toISOString(),
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/observations`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(observation),
    })

    if (!response.ok) {
      throw new Error(`Supabase request failed: ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data: data[0],
    })
  } catch (error) {
    console.error("[v0] Error creating observation:", error)
    return NextResponse.json({ success: false, error: "Failed to create observation" }, { status: 500 })
  }
}
