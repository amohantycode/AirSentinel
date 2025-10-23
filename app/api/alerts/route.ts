import { type NextRequest, NextResponse } from "next/server"

// GET /api/alerts - Fetch user's alert subscriptions
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ success: false, error: "Supabase configuration missing" }, { status: 500 })
    }

    const url = `${supabaseUrl}/rest/v1/alerts?order=created_at.desc`
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
    console.error("[v0] Error fetching alerts:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch alerts" }, { status: 500 })
  }
}

// POST /api/alerts - Create new alert subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { location_name, lat, lon, email, threshold } = body
    if (!location_name || !lat || !lon || !email || threshold === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    // Validate threshold
    if (threshold < 0 || threshold > 500) {
      return NextResponse.json({ success: false, error: "Threshold must be between 0 and 500" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ success: false, error: "Supabase configuration missing" }, { status: 500 })
    }

    const url = `${supabaseUrl}/rest/v1/alerts`
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
        is_active: true,
        created_at: new Date().toISOString(),
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
    console.error("[v0] Error creating alert:", error)
    return NextResponse.json({ success: false, error: "Failed to create alert" }, { status: 500 })
  }
}

// PATCH /api/alerts/[id] - Update alert subscription
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, is_active } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "Alert ID required" }, { status: 400 })
    }

    // Mock response - replace with actual Supabase update
    const updatedAlert = {
      id,
      is_active: is_active !== undefined ? is_active : true,
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: updatedAlert,
    })
  } catch (error) {
    console.error("[v0] Error updating alert:", error)
    return NextResponse.json({ success: false, error: "Failed to update alert" }, { status: 500 })
  }
}

// DELETE /api/alerts/[id] - Delete alert subscription
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Alert ID required" }, { status: 400 })
    }

    // Mock response - replace with actual Supabase delete
    return NextResponse.json({
      success: true,
      message: "Alert deleted successfully",
    })
  } catch (error) {
    console.error("[v0] Error deleting alert:", error)
    return NextResponse.json({ success: false, error: "Failed to delete alert" }, { status: 500 })
  }
}
