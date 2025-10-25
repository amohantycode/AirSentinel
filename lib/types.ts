// TypeScript types for AirSentinel application

export interface Observation {
  id: string
  location_name: string
  lat: number
  lon: number
  aqi: number
  pm25?: number
  pm10?: number
  o3?: number
  no2?: number
  so2?: number
  co?: number
  source: "airnow" | "purpleair" | "manual"
  observed_at: string
  created_at: string
}

export interface Forecast {
  id: string
  location_name: string
  lat: number
  lon: number
  forecast_date: string
  forecast_hour: number
  aqi_predicted: number
  confidence: number
  weather_temp?: number
  weather_humidity?: number
  weather_wind_speed?: number
  created_at: string
}

export interface Report {
  id: string
  user_id?: string
  location_name: string
  lat: number
  lon: number
  category: "smoke" | "dust" | "odor" | "haze" | "other"
  severity: "mild" | "moderate" | "severe"
  description?: string
  photo_url?: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
}

export interface Alert {
  id: string
  user_id: string
  email: string
  location_name: string
  lat: number
  lon: number
  threshold: number
  is_active: boolean
  last_triggered_at?: string
  created_at: string
}

export interface UserProfile {
  id: string
  display_name?: string
  preferred_location?: string
  preferred_lat?: number
  preferred_lon?: number
  notification_preferences: {
    email: boolean
    threshold: number
  }
  created_at: string
  updated_at: string
}

export interface Metric {
  id: string
  metric_date: string
  location_name: string
  avg_aqi: number
  max_aqi: number
  min_aqi: number
  hours_unhealthy: number
  total_reports: number
  created_at: string
}
