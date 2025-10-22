"use client"

import { useState, useEffect } from "react"
import { MapWrapper } from "@/components/map-wrapper"
import { AQICard } from "@/components/aqi-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Fallback mock data if API is not configured - DMV region
const fallbackLocations = [
  { lat: 38.9072, lon: -77.0369, name: "Washington, DC", aqi: 45 },
  { lat: 39.2904, lon: -76.6122, name: "Baltimore, MD", aqi: 52 },
  { lat: 38.8816, lon: -77.0910, name: "Arlington, VA", aqi: 38 },
  { lat: 38.8048, lon: -77.0469, name: "Alexandria, VA", aqi: 42 },
  { lat: 38.9907, lon: -77.0261, name: "Silver Spring, MD", aqi: 48 },
  { lat: 39.0840, lon: -77.1528, name: "Rockville, MD", aqi: 41 },
  { lat: 38.9807, lon: -77.1006, name: "Bethesda, MD", aqi: 39 },
  { lat: 38.8462, lon: -77.3064, name: "Fairfax, VA", aqi: 44 },
]

interface Location {
  lat: number
  lon: number
  name: string
  aqi: number
}

interface ApiObservation {
  latitude?: number
  lat?: number
  longitude?: number
  lon?: number
  location_name?: string
  name?: string
  aqi?: number
  aqi_value?: number
}

export default function MapPage() {
  const [locations, setLocations] = useState<Location[]>(fallbackLocations)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isUsingMockData, setIsUsingMockData] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch real data from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/observations?limit=50")
        
        if (!response.ok) {
          throw new Error("Failed to fetch observations")
        }

        const result = await response.json()

        if (result.success && result.data && result.data.length > 0) {
          // Transform API data to location format
          const transformedLocations: Location[] = result.data.map((obs: ApiObservation) => ({
            lat: obs.latitude || obs.lat || 0,
            lon: obs.longitude || obs.lon || 0,
            name: obs.location_name || obs.name || "Unknown Location",
            aqi: obs.aqi || obs.aqi_value || 0,
          }))

          setLocations(transformedLocations)
          setIsUsingMockData(false)
        } else {
          // No data available, use mock data
          setLocations(fallbackLocations)
          setIsUsingMockData(true)
        }
      } catch (err) {
        console.error("Error fetching air quality data:", err)
        setError("Could not load real-time data. Showing sample data.")
        setLocations(fallbackLocations)
        setIsUsingMockData(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLocations()
  }, [])

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">DMV Air Quality Map</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isUsingMockData 
              ? "Showing sample DMV data - Configure Supabase to see real-time AQI readings" 
              : "Explore real-time AQI readings across DC, Maryland, and Virginia"}
          </p>
        </div>

        {/* Warning Alert for Mock Data */}
        {isUsingMockData && (
          <Alert className="mb-4 sm:mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Sample Data:</strong> Currently displaying mock data. To see real air quality data, please configure 
              your Supabase database and run the ETL scripts in the <code className="text-xs sm:text-sm px-1 py-0.5 bg-muted rounded">scripts/</code> folder.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && !isUsingMockData && (
          <Alert className="mb-4 sm:mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Interactive Map</CardTitle>
                <CardDescription className="text-sm">Click on any marker to view detailed air quality information</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <MapWrapper
                  locations={locations}
                  height="500px"
                  onLocationClick={(location) => setSelectedLocation(location)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Search */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg">Search Location</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter city or zip code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-sm"
                  />
                  <Button size="icon" className="flex-shrink-0">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

          {/* Selected Location Details */}
          {selectedLocation && (
            <AQICard
              location={selectedLocation.name}
              aqi={selectedLocation.aqi}
              timestamp={new Date().toISOString()}
              lat={selectedLocation.lat}
              lon={selectedLocation.lon}
            />
          )}

          {/* Location List */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg">All Locations</CardTitle>
              <CardDescription className="text-sm">
                {isLoading 
                  ? "Loading locations..." 
                  : `Current AQI readings (${locations.length} locations)`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto pr-2">
                  {locations.map((location, index) => (
                    <button
                      key={`${location.name}-${index}`}
                      onClick={() => setSelectedLocation(location)}
                      className="w-full flex items-center justify-between p-2 sm:p-3 rounded-lg border hover:bg-muted transition-colors text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-xs sm:text-sm truncate">{location.name}</span>
                      </div>
                      <div className="text-base sm:text-lg font-bold flex-shrink-0 ml-2">{location.aqi}</div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  )
}
