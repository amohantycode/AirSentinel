import { type NextRequest, NextResponse } from "next/server"
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const location = searchParams.get("location")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    // Try to load from 2025 static JSON data first
    try {
      const jsonPath = path.join(process.cwd(), 'public', 'data-2025-latest.json');
      
      if (fs.existsSync(jsonPath)) {
        const fileContent = fs.readFileSync(jsonPath, 'utf-8');
        const data2025 = JSON.parse(fileContent);

        // Filter by location if requested
        let filteredData = data2025;
        if (location) {
          filteredData = data2025.filter((obs: any) => 
            obs.location.toLowerCase().includes(location.toLowerCase())
          );
        }

        // Limit results
        filteredData = filteredData.slice(0, limit);

        // Transform to match expected format
        const transformedData = filteredData.map((obs: any) => ({
          location_name: obs.location,
          lat: obs.latitude,
          lon: obs.longitude,
          aqi: obs.aqi,
          category: obs.category,
          pollutant: obs.pollutant,
          concentration: obs.concentration,
          observed_at: obs.date,
          source: '2025 DMV Data',
          state: obs.state,
          county: obs.county
        }));

        return NextResponse.json({
          success: true,
          data: transformedData,
          count: transformedData.length,
          source: '2025 Historical Data'
        });
      }
    } catch (jsonError) {
      console.log('2025 JSON data not available, falling back to Supabase');
    }

    // Fallback to Supabase if 2025 data fails
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
