// Supabase client utilities for server and client-side usage

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Note: When Supabase integration is connected, use these utilities:
// import { createBrowserClient } from '@supabase/ssr'
// import { createServerClient } from '@supabase/ssr'

// For now, we'll use fetch API to interact with Supabase REST API
export async function fetchFromSupabase(endpoint: string, options: RequestInit = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.statusText}`)
  }

  return response.json()
}
