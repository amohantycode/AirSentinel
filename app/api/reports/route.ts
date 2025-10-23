import { type NextRequest, NextResponse } from "next/server"

// GET /api/reports - Fetch community reports
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") || "approved"
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ success: false, error: "Supabase configuration missing" }, { status: 500 })
    }

    // Fetch from Supabase
    const url = `${supabaseUrl}/rest/v1/reports?status=eq.${status}&order=created_at.desc&limit=${limit}`
    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Supabase request failed: ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    })
  } catch (error) {
    console.error("[v0] Error fetching reports:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch reports" }, { status: 500 })
  }
}

// POST /api/reports - Create new community report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { location_name, lat, lon, category, severity } = body
    if (!location_name || lat === undefined || lat === null || lon === undefined || lon === null || !category || !severity) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Validate category and severity
    const validCategories = ["smoke", "dust", "odor", "haze", "other"]
    const validSeverities = ["mild", "moderate", "severe"]

    if (!validCategories.includes(category) || !validSeverities.includes(severity)) {
      return NextResponse.json({ success: false, error: "Invalid category or severity" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ success: false, error: "Supabase configuration missing" }, { status: 500 })
    }

    // Insert into Supabase
    const url = `${supabaseUrl}/rest/v1/reports`
    const response = await fetch(url, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        ...body,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`Supabase request failed: ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data: data[0] || data,
    })
  } catch (error) {
    console.error("[v0] Error creating report:", error)
    return NextResponse.json({ success: false, error: "Failed to create report" }, { status: 500 })
  }
}
