import { type NextRequest, NextResponse } from "next/server"

// GET /api/reports - Fetch community reports
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") || "approved"
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // Mock data - replace with actual Supabase query
    const mockReports = [
      {
        id: "1",
        location_name: "Downtown LA",
        lat: 34.0407,
        lon: -118.2468,
        category: "smoke",
        severity: "moderate",
        description: "Visible smoke from nearby wildfires affecting visibility",
        status: "approved",
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ]

    return NextResponse.json({
      success: true,
      data: mockReports.slice(0, limit),
      count: mockReports.length,
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
    if (!location_name || !lat || !lon || !category || !severity) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Validate category and severity
    const validCategories = ["smoke", "dust", "odor", "haze", "other"]
    const validSeverities = ["mild", "moderate", "severe"]

    if (!validCategories.includes(category) || !validSeverities.includes(severity)) {
      return NextResponse.json({ success: false, error: "Invalid category or severity" }, { status: 400 })
    }

    // Mock response - replace with actual Supabase insert
    const newReport = {
      id: Date.now().toString(),
      ...body,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newReport,
    })
  } catch (error) {
    console.error("[v0] Error creating report:", error)
    return NextResponse.json({ success: false, error: "Failed to create report" }, { status: 500 })
  }
}
