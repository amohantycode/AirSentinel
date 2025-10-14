"use client"

import { useState } from "react"
import { getAQIColor, getAQILevelName } from "@/lib/aqi-utils"
import { Card } from "@/components/ui/card"

interface MapLocation {
  lat: number
  lon: number
  name: string
  aqi: number
}

interface MapWrapperProps {
  locations: MapLocation[]
  center?: [number, number]
  zoom?: number
  height?: string
  onLocationClick?: (location: MapLocation) => void
}

export function MapWrapper({
  locations,
  center = [39.8283, -98.5795], // Center of USA
  zoom = 4,
  height = "500px",
  onLocationClick,
}: MapWrapperProps) {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [hoveredLocation, setHoveredLocation] = useState<MapLocation | null>(null)

  // Convert lat/lon to SVG coordinates (simplified projection for USA)
  const latLonToXY = (lat: number, lon: number) => {
    // Simple mercator-like projection for USA (lat: 24-50, lon: -125 to -65)
    const x = ((lon + 125) / 60) * 100
    const y = ((50 - lat) / 26) * 100
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
  }

  const handleLocationClick = (location: MapLocation) => {
    setSelectedLocation(location)
    onLocationClick?.(location)
  }

  return (
    <div className="relative" style={{ height }}>
      {/* Map Container */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-slate-900 rounded-lg border overflow-hidden">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{ background: "linear-gradient(to bottom right, hsl(var(--muted)), hsl(var(--muted)/0.5))" }}
        >
          {/* Grid lines for reference */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="hsl(var(--border))" strokeWidth="0.1" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Location markers */}
          {locations.map((location, index) => {
            const { x, y } = latLonToXY(location.lat, location.lon)
            const color = getAQIColor(location.aqi)
            const isHovered = hoveredLocation?.name === location.name
            const isSelected = selectedLocation?.name === location.name
            const radius = isHovered || isSelected ? 3 : 2

            return (
              <g key={index}>
                {/* Marker shadow */}
                <circle cx={x} cy={y} r={radius + 0.5} fill="black" opacity="0.2" />

                {/* Marker */}
                <circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={color}
                  stroke="white"
                  strokeWidth="0.5"
                  className="cursor-pointer transition-all"
                  style={{ filter: isHovered || isSelected ? "brightness(1.2)" : "none" }}
                  onMouseEnter={() => setHoveredLocation(location)}
                  onMouseLeave={() => setHoveredLocation(null)}
                  onClick={() => handleLocationClick(location)}
                />

                {/* Pulse animation for selected */}
                {isSelected && (
                  <circle cx={x} cy={y} r={radius} fill={color} opacity="0.5">
                    <animate attributeName="r" from={radius} to={radius + 2} dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            )
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredLocation && (
          <div className="absolute top-4 left-4 pointer-events-none">
            <Card className="p-3 shadow-lg">
              <div className="text-sm font-semibold">{hoveredLocation.name}</div>
              <div className="text-2xl font-bold" style={{ color: getAQIColor(hoveredLocation.aqi) }}>
                AQI {hoveredLocation.aqi}
              </div>
              <div className="text-xs text-muted-foreground">{getAQILevelName(hoveredLocation.aqi)}</div>
            </Card>
          </div>
        )}

        {/* Selected location details */}
        {selectedLocation && (
          <div className="absolute bottom-4 left-4 right-4">
            <Card className="p-4 shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedLocation.name}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-bold" style={{ color: getAQIColor(selectedLocation.aqi) }}>
                      {selectedLocation.aqi}
                    </span>
                    <span className="text-sm text-muted-foreground">{getAQILevelName(selectedLocation.aqi)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Lat: {selectedLocation.lat.toFixed(4)}, Lon: {selectedLocation.lon.toFixed(4)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4">
        <Card className="p-3 text-xs space-y-1">
          <div className="font-semibold mb-2">AQI Levels</div>
          {[
            { label: "Good", color: "#10b981", range: "0-50" },
            { label: "Moderate", color: "#fbbf24", range: "51-100" },
            { label: "Unhealthy (SG)", color: "#f97316", range: "101-150" },
            { label: "Unhealthy", color: "#ef4444", range: "151-200" },
            { label: "Very Unhealthy", color: "#a855f7", range: "201-300" },
            { label: "Hazardous", color: "#7f1d1d", range: "301+" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="flex-1">{item.label}</span>
              <span className="text-muted-foreground">{item.range}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
