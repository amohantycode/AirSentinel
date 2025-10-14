"use client"

import { useState } from "react"
import { MapWrapper } from "@/components/map-wrapper"
import { AQICard } from "@/components/aqi-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin } from "lucide-react"

// Mock data - will be replaced with real API calls
const mockLocations = [
  { lat: 34.0522, lon: -118.2437, name: "Los Angeles, CA", aqi: 87 },
  { lat: 37.7749, lon: -122.4194, name: "San Francisco, CA", aqi: 42 },
  { lat: 40.7128, lon: -74.006, name: "New York, NY", aqi: 55 },
  { lat: 41.8781, lon: -87.6298, name: "Chicago, IL", aqi: 68 },
  { lat: 29.7604, lon: -95.3698, name: "Houston, TX", aqi: 72 },
  { lat: 33.4484, lon: -112.074, name: "Phoenix, AZ", aqi: 95 },
  { lat: 47.6062, lon: -122.3321, name: "Seattle, WA", aqi: 38 },
  { lat: 39.7392, lon: -104.9903, name: "Denver, CO", aqi: 61 },
]

export default function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState<(typeof mockLocations)[0] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Live Air Quality Map</h1>
        <p className="text-muted-foreground">Explore real-time AQI readings across the country</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Map</CardTitle>
              <CardDescription>Click on any marker to view detailed air quality information</CardDescription>
            </CardHeader>
            <CardContent>
              <MapWrapper
                locations={mockLocations}
                height="600px"
                onLocationClick={(location) => setSelectedLocation(location)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter city or zip code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button size="icon">
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
            <CardHeader>
              <CardTitle className="text-lg">All Locations</CardTitle>
              <CardDescription>Current AQI readings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockLocations.map((location) => (
                  <button
                    key={location.name}
                    onClick={() => setSelectedLocation(location)}
                    className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{location.name}</span>
                    </div>
                    <div className="text-lg font-bold">{location.aqi}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
