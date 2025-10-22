"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface ForecastDay {
  date: string
  value: number
  aqi: number
  category: string
}

interface PollutantForecast {
  unit: string
  forecast: ForecastDay[]
}

interface ForecastData {
  city: string
  timestamp: string
  forecasts: {
    pm25?: PollutantForecast
    ozone?: PollutantForecast
    no2?: PollutantForecast
  }
}

const AQI_COLORS: Record<string, string> = {
  Good: "bg-green-100 text-green-800 border-green-300",
  Moderate: "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Unhealthy for Sensitive Groups": "bg-orange-100 text-orange-800 border-orange-300",
  Unhealthy: "bg-red-100 text-red-800 border-red-300",
  "Very Unhealthy": "bg-purple-100 text-purple-800 border-purple-300",
  Hazardous: "bg-gray-800 text-gray-100 border-gray-900",
  Unknown: "bg-gray-100 text-gray-800 border-gray-300",
}

const POLLUTANT_ICONS: Record<string, string> = {
  pm25: "🏭",
  ozone: "☁️",
  no2: "💨",
}

const POLLUTANT_NAMES: Record<string, string> = {
  pm25: "PM2.5 (Particulate Matter)",
  ozone: "Ozone (O₃)",
  no2: "Nitrogen Dioxide (NO₂)",
}

export function ForecastComponent() {
  const [city, setCity] = useState("Washington, DC")
  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleForecast = async () => {
    if (!city) {
      setError("Please enter a city name")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // API key is handled server-side for security
      const response = await fetch(
        `/api/forecasts?city=${encodeURIComponent(city)}`
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to fetch forecast")
      }

      const data = await response.json()
      setForecast(data)
    } catch (err: any) {
      setError(err.message || "An error occurred")
      setForecast(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Air Quality Forecast</CardTitle>
          <CardDescription>
            Predict PM2.5, Ozone, and NO₂ levels for the next week using trained ML models
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium">City Name or Coordinates</label>
              <Input
                placeholder="e.g., Washington, DC or 38.9072,-77.0369"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Try: Washington DC, Baltimore MD, Arlington VA</p>
            </div>
          </div>

          <Button onClick={handleForecast} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Generating Forecast..." : "Get 7-Day Forecast"}
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              <p className="text-sm">❌ {error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forecast Results */}
      {forecast && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{forecast.city}</h2>
            <p className="text-xs text-gray-500">
              Updated: {new Date(forecast.timestamp).toLocaleString()}
            </p>
          </div>

          {Object.entries(forecast.forecasts).map(([pollutant, data]) => (
            <Card key={pollutant}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{POLLUTANT_ICONS[pollutant]}</span>
                  {POLLUTANT_NAMES[pollutant]}
                </CardTitle>
                <CardDescription>Unit: {data.unit}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-7">
                  {data.forecast.map((day, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="text-xs font-medium text-gray-600">
                        {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>

                      <Badge
                        variant="outline"
                        className={`w-full justify-center text-center py-2 ${AQI_COLORS[day.category]}`}
                      >
                        AQI {day.aqi}
                      </Badge>

                      <div className="text-center">
                        <div className="text-lg font-bold">{day.value.toFixed(1)}</div>
                        <div className="text-xs text-gray-600">{data.unit}</div>
                      </div>

                      <div className="text-xs text-center text-gray-600">{day.category}</div>
                    </div>
                  ))}
                </div>

                {/* AQI Health Guidance */}
                <div className="mt-6 pt-4 border-t space-y-2 text-xs">
                  <div className="font-semibold">Health Guidance:</div>
                  <div className="grid gap-2">
                    {[
                      { aqi: "0-50", cat: "Good", advice: "Air quality is satisfactory" },
                      { aqi: "51-100", cat: "Moderate", advice: "Acceptable; sensitive groups should limit prolonged outdoor exertion" },
                      {
                        aqi: "101-150",
                        cat: "Unhealthy for Sensitive Groups",
                        advice: "Sensitive groups should reduce prolonged outdoor exertion",
                      },
                      { aqi: "151-200", cat: "Unhealthy", advice: "General public should limit outdoor exertion" },
                      { aqi: "201-300", cat: "Very Unhealthy", advice: "Avoid outdoor activities" },
                      { aqi: "301-500", cat: "Hazardous", advice: "Everyone should avoid outdoor activities" },
                    ].map((row) => (
                      <div key={row.aqi} className="flex gap-2">
                        <span className="font-medium">{row.aqi}:</span>
                        <span>{row.advice}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Model Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base">Model Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>Training Data:</strong> 71,299 EPA air quality records (2020-2025)
              </p>
              <p>
                <strong>Regions:</strong> DC, Maryland, Virginia (42 monitoring sites)
              </p>
              <p>
                <strong>Features:</strong> Historical lags, rolling averages, calendar features
              </p>
              <p>
                <strong>Algorithm:</strong> CatBoost MultiOutput Regression (7-day direct forecast)
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
