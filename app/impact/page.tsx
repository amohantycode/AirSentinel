"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AQIChart } from "@/components/aqi-chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingDown, TrendingUp, Users, Calendar } from "lucide-react"
import { useState, useEffect } from "react"
// import { Badge } from "@/components/ui/badge" // not used

// DMV Region locations
const DMV_LOCATIONS = ["Washington, DC", "Arlington, VA", "Baltimore, MD", "Silver Spring, MD"]

export default function ImpactPage() {
  const [selectedLocation, setSelectedLocation] = useState("Washington, DC")
  const [timeRange, setTimeRange] = useState("7")
  const [historicalData, setHistoricalData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Fetch historical AQ data based on time range
  useEffect(() => {
    const fetchHistoricalData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/historical-aq?city=${encodeURIComponent(selectedLocation)}&days=${timeRange}`)
        const data = await res.json()
        setHistoricalData(data)
      } catch (err) {
        console.error("Failed to fetch historical data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistoricalData()
  }, [selectedLocation, timeRange])

  // Compute metrics from historical data
  const dataPoints = historicalData?.data || []
  const avgAQI = historicalData?.summary?.avgAQI || 0
  const goodDays = historicalData?.summary?.goodDays || 0
  const moderateDays = historicalData?.summary?.moderateDays || 0
  const unhealthyDays = historicalData?.summary?.unhealthyDays || 0
  // Days with AQI > 100 (Unhealthy for Sensitive Groups or worse)
  const usgOrWorseDays = Array.isArray(dataPoints)
    ? dataPoints.filter((d: any) => typeof d?.aqi === "number" && d.aqi > 100).length
    : 0
  const trend = avgAQI > 75 ? "up" : "down"
  
  // Calculate real population impact
  const totalPopulation = 3900000 // DMV metro area
  const sensitiveGroups = 890000 // ~23% (children, elderly, respiratory conditions)
  // For impact, estimate exposure among sensitive groups on days AQI > 100 (USG+)
  const exposureRateSensitive = dataPoints.length > 0 ? usgOrWorseDays / dataPoints.length : 0
  const exposedSensitive = Math.round(sensitiveGroups * exposureRateSensitive)
  
  // Removed Health Alerts card; derived alert metrics not used anymore
  
  // Format for chart with real dates
  const chartData = dataPoints.map((d: { date: string; aqi: number }) => {
    const date = new Date(d.date)
    return {
      time: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      aqi: d.aqi
    }
  })

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
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
                  {DMV_LOCATIONS.map((location) => (
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
              {dataPoints.length > 0 ? Math.round((goodDays / dataPoints.length) * 100) : 0}% of historical days
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
              {dataPoints.length > 0 ? Math.round((unhealthyDays / dataPoints.length) * 100) : 0}% of historical days
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
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <p className="text-muted-foreground">Loading forecast data...</p>
            </div>
          ) : (
            <AQIChart data={chartData} height={400} />
          )}
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
              <span className="text-lg font-bold">{(totalPopulation / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm font-medium">Sensitive Groups</span>
              <span className="text-lg font-bold">{(sensitiveGroups / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10">
              <div className="text-sm font-medium">
                Sensitive Groups Exposed (USG+)
                <span className="ml-2 text-xs text-muted-foreground">AQI &gt; 100 days</span>
              </div>
              <span className="text-lg font-bold text-destructive">
                {exposedSensitive > 1000000
                  ? `${(exposedSensitive / 1000000).toFixed(1)}M`
                  : `${Math.max(0, Math.round(exposedSensitive / 1000))}K`}
              </span>
            </div>
          </CardContent>
        </Card>
        {/* Period Breakdown moved here to keep two-column layout on large screens */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Period Breakdown
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
                      width: `${dataPoints.length > 0 ? (goodDays / dataPoints.length) * 100 : 0}%`,
                      backgroundColor: "oklch(0.7 0.15 145)",
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Moderate (51-100)</span>
                  <span className="font-semibold">{moderateDays} days</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${dataPoints.length > 0 ? (moderateDays / dataPoints.length) * 100 : 0}%`,
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
                      width: `${dataPoints.length > 0 ? (unhealthyDays / dataPoints.length) * 100 : 0}%`,
                      backgroundColor: "oklch(0.6 0.22 25)",
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* End Impact Statistics */}
    </div>
  )
}
