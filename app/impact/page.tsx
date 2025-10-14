"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AQIChart } from "@/components/aqi-chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingDown, TrendingUp, Users, AlertTriangle, Calendar } from "lucide-react"
import { useState } from "react"

// Mock data - will be replaced with real API calls
const mockHistoricalData = Array.from({ length: 30 }, (_, i) => ({
  time: `Day ${i + 1}`,
  aqi: 70 + Math.sin(i / 5) * 25 + Math.random() * 15,
}))

const mockLocations = ["Los Angeles, CA", "San Francisco, CA", "New York, NY", "Chicago, IL"]

export default function ImpactPage() {
  const [selectedLocation, setSelectedLocation] = useState("Los Angeles, CA")
  const [timeRange, setTimeRange] = useState("30")

  const avgAQI = Math.round(mockHistoricalData.reduce((sum, d) => sum + d.aqi, 0) / mockHistoricalData.length)
  const goodDays = mockHistoricalData.filter((d) => d.aqi <= 50).length
  const unhealthyDays = mockHistoricalData.filter((d) => d.aqi > 100).length
  const trend = avgAQI > 75 ? "up" : "down"

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Community Impact Dashboard</h1>
        <p className="text-muted-foreground">Track air quality trends and community health metrics</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
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
            <div className="w-full sm:w-[200px]">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="365">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average AQI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{avgAQI}</div>
              {trend === "up" ? (
                <TrendingUp className="h-6 w-6 text-destructive" />
              ) : (
                <TrendingDown className="h-6 w-6 text-green-600" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Last {timeRange} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Good Air Days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{goodDays}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round((goodDays / mockHistoricalData.length) * 100)}% of days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Unhealthy Days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{unhealthyDays}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round((unhealthyDays / mockHistoricalData.length) * 100)}% of days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Community Reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">127</div>
            <p className="text-xs text-muted-foreground mt-2">Total submissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Historical Trend */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Historical Trend
          </CardTitle>
          <CardDescription>
            Air quality over the last {timeRange} days in {selectedLocation}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AQIChart data={mockHistoricalData} height={400} />
        </CardContent>
      </Card>

      {/* Impact Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Population Impact
            </CardTitle>
            <CardDescription>Estimated people affected by poor air quality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm font-medium">Total Population</span>
              <span className="text-lg font-bold">3.9M</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm font-medium">Sensitive Groups</span>
              <span className="text-lg font-bold">890K</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10">
              <span className="text-sm font-medium">Exposed to Unhealthy Air</span>
              <span className="text-lg font-bold text-destructive">1.2M</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Health Alerts Sent
            </CardTitle>
            <CardDescription>Notifications delivered to protect community health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm font-medium">Total Alerts</span>
              <span className="text-lg font-bold">2,847</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm font-medium">Active Subscribers</span>
              <span className="text-lg font-bold">15,392</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
              <span className="text-sm font-medium">Avg Response Time</span>
              <span className="text-lg font-bold text-primary">2.3 min</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Breakdown
          </CardTitle>
          <CardDescription>Air quality distribution by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Good (0-50)</span>
                <span className="font-semibold">{goodDays} days</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(goodDays / mockHistoricalData.length) * 100}%`,
                    backgroundColor: "oklch(0.7 0.15 145)",
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Moderate (51-100)</span>
                <span className="font-semibold">{mockHistoricalData.length - goodDays - unhealthyDays} days</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${((mockHistoricalData.length - goodDays - unhealthyDays) / mockHistoricalData.length) * 100}%`,
                    backgroundColor: "oklch(0.75 0.15 85)",
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Unhealthy (101+)</span>
                <span className="font-semibold">{unhealthyDays} days</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(unhealthyDays / mockHistoricalData.length) * 100}%`,
                    backgroundColor: "oklch(0.6 0.22 25)",
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
