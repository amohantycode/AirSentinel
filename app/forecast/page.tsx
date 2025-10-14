"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AQIChart } from "@/components/aqi-chart"
import { AQIBadge } from "@/components/aqi-badge"
import { HealthRecommendations } from "@/components/health-recommendations"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, TrendingUp, Cloud, WindIcon, Droplets } from "lucide-react"

// Mock forecast data - will be replaced with real API calls
const mockForecastData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  aqi: 75 + Math.sin(i / 3) * 20 + Math.random() * 10,
}))

const mockLocations = [
  "Los Angeles, CA",
  "San Francisco, CA",
  "New York, NY",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Seattle, WA",
  "Denver, CO",
]

export default function ForecastPage() {
  const [selectedLocation, setSelectedLocation] = useState("Los Angeles, CA")
  const [searchQuery, setSearchQuery] = useState("")

  const currentAQI = Math.round(mockForecastData[new Date().getHours()]?.aqi || 75)
  const avgAQI = Math.round(mockForecastData.reduce((sum, d) => sum + d.aqi, 0) / mockForecastData.length)
  const maxAQI = Math.round(Math.max(...mockForecastData.map((d) => d.aqi)))

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Air Quality Forecast</h1>
        <p className="text-muted-foreground">24-hour predictions to plan your outdoor activities</p>
      </div>

      {/* Location Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Select Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search city or zip code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Forecast Chart */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                24-Hour AQI Forecast
              </CardTitle>
              <CardDescription>Predicted air quality index for {selectedLocation}</CardDescription>
            </CardHeader>
            <CardContent>
              <AQIChart data={mockForecastData} height={400} />
            </CardContent>
          </Card>

          {/* Hourly Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Hourly Breakdown
              </CardTitle>
              <CardDescription>Detailed forecast for the next 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {mockForecastData.slice(0, 12).map((data, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-lg border">
                    <div className="text-sm font-medium">{data.time}</div>
                    <AQIBadge aqi={Math.round(data.aqi)} size="sm" showLabel={false} />
                    <div className="text-xs text-muted-foreground">{Math.round(data.aqi)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Conditions</CardTitle>
              <CardDescription>Right now in {selectedLocation}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <AQIBadge aqi={currentAQI} size="xl" />
              <div className="w-full space-y-3 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average (24h)</span>
                  <span className="font-semibold">{avgAQI}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Peak (24h)</span>
                  <span className="font-semibold">{maxAQI}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weather Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Weather Factors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Temperature</span>
                </div>
                <span className="font-semibold">72°F</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Humidity</span>
                </div>
                <span className="font-semibold">45%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <WindIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Wind Speed</span>
                </div>
                <span className="font-semibold">8 mph</span>
              </div>
            </CardContent>
          </Card>

          {/* Health Recommendations */}
          <HealthRecommendations aqi={currentAQI} />
        </div>
      </div>
    </div>
  )
}
