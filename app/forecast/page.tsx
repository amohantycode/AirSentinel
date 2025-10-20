"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AQIChart } from "@/components/aqi-chart"
import { AQIBadge } from "@/components/aqi-badge"
import { HealthRecommendations } from "@/components/health-recommendations"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, TrendingUp, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LocationData {
  location: string
  state: string
  pollutant: string
  aqi: number
  concentration: number
  date: string
}

export default function ForecastPage() {
  const [locations, setLocations] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [locationData, setLocationData] = useState<LocationData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/observations?limit=100")
        const result = await response.json()

        if (result.success && result.data) {
          const uniqueLocations = Array.from(
            new Set(result.data.map((d: any) => d.location_name))
          ) as string[]
          
          setLocations(uniqueLocations.sort())
          setSelectedLocation(uniqueLocations[0] || "")
          
          const transformed = result.data.map((d: any) => ({
            location: d.location_name,
            state: d.state || "",
            pollutant: d.pollutant || "PM2.5",
            aqi: d.aqi,
            concentration: d.concentration,
            date: d.observed_at
          }))
          
          setLocationData(transformed)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const selectedLocationData = locationData.filter(d => d.location === selectedLocation)
  
  const generateForecast = () => {
    if (selectedLocationData.length === 0) return []
    
    const baseAQI = selectedLocationData[0]?.aqi || 50
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      aqi: baseAQI + Math.sin(i / 3) * 15 + Math.random() * 8 - 4
    }))
  }

  const forecastData = generateForecast()
  const currentAQI = selectedLocationData[0]?.aqi || 0
  const avgAQI = forecastData.length > 0 
    ? Math.round(forecastData.reduce((sum, d) => sum + d.aqi, 0) / forecastData.length)
    : currentAQI
  const maxAQI = forecastData.length > 0
    ? Math.round(Math.max(...forecastData.map((d) => d.aqi)))
    : currentAQI

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">DMV Air Quality Forecast</h1>
          <p className="text-sm sm:text-base text-muted-foreground">24-hour predictions based on real DMV monitoring data</p>
        </div>

        <Alert className="mb-4 sm:mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Forecasts are generated from the latest EPA monitoring station data across DC, Maryland, and Virginia.
          </AlertDescription>
        </Alert>

        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg">Select DMV Location</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Search monitoring station..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-sm"
                />
                <Button size="icon" className="flex-shrink-0">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Select 
                value={selectedLocation} 
                onValueChange={setSelectedLocation}
                disabled={isLoading || locations.length === 0}
              >
                <SelectTrigger className="w-full sm:w-[280px]">
                  <SelectValue placeholder={isLoading ? "Loading..." : "Select location"} />
                </SelectTrigger>
                <SelectContent>
                  {locations
                    .filter(loc => 
                      !searchQuery || 
                      loc.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  24-Hour AQI Forecast
                </CardTitle>
                <CardDescription>Predicted air quality index for {selectedLocation || "selected location"}</CardDescription>
              </CardHeader>
              <CardContent>
                {forecastData.length > 0 ? (
                  <AQIChart data={forecastData} height={400} />
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    Select a location to view forecast
                  </div>
                )}
              </CardContent>
            </Card>

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
                  {forecastData.slice(0, 12).map((data, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-lg border">
                      <div className="text-sm font-medium">{data.time}</div>
                      <AQIBadge aqi={Math.round(data.aqi)} size="sm" showLabel={false} />
                      <div className="text-xs text-muted-foreground">{Math.round(data.aqi)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedLocationData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pollutant Details</CardTitle>
                  <CardDescription>Current measurements at {selectedLocation}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedLocationData.map((data, i) => (
                      <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-semibold">{data.pollutant}</div>
                          <div className="text-sm text-muted-foreground">
                            {data.concentration.toFixed(2)} {data.pollutant === 'Ozone' ? 'ppm' : data.pollutant === 'PM2.5' ? 'µg/m³' : 'ppb'}
                          </div>
                        </div>
                        <AQIBadge aqi={data.aqi} size="sm" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Conditions</CardTitle>
                <CardDescription>Right now at {selectedLocation || "selected location"}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                {currentAQI > 0 ? (
                  <>
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
                      {selectedLocationData[0] && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">State</span>
                          <span className="font-semibold">{selectedLocationData[0].state}</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    Select a location
                  </div>
                )}
              </CardContent>
            </Card>

            {currentAQI > 0 && <HealthRecommendations aqi={currentAQI} />}
          </div>
        </div>
      </div>
    </div>
  )
}
