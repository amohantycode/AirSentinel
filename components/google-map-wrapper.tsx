"use client"

import { useEffect, useRef, useState } from "react"
import { getAQIColor } from "@/lib/aqi-utils"

// Import the web components side-effects to register custom elements
import "@googlemaps/extended-component-library/api_loader.js"
import "@googlemaps/extended-component-library/place_picker.js"

interface MapLocation {
  lat: number
  lon: number
  name: string
  aqi: number
}

interface GoogleMapWrapperProps {
  locations: MapLocation[]
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
  onLocationClick?: (location: MapLocation) => void
}

export function GoogleMapWrapper({
  locations,
  center = { lat: 38.9072, lng: -77.0369 }, // Center of DMV
  zoom = 9,
  height = "600px",
  onLocationClick,
}: GoogleMapWrapperProps) {
  const pickerRef = useRef<any>(null)
  const mapRef = useRef<any>(null)
  const [searchedLocation, setSearchedLocation] = useState<{ lat: number; lng: number; name: string } | null>(null)

  useEffect(() => {
    const picker = pickerRef.current
    if (!picker) return

    const handlePlaceChange = () => {
      const place = picker.value

      // If no place selected
      if (!place || !place.location) {
        setSearchedLocation(null)
        return
      }

      // Handle map view update
      const map = mapRef.current
      if (map && map.innerMap) {
        if (place.viewport) {
          map.innerMap.fitBounds(place.viewport)
        } else {
          map.center = place.location
          map.zoom = 15
        }
      }

      setSearchedLocation({
        lat: place.location.lat(),
        lng: place.location.lng(),
        name: place.displayName || place.formattedAddress || "Selected Location"
      })
    }

    picker.addEventListener("gmpx-placechange", handlePlaceChange)
    return () => {
      picker.removeEventListener("gmpx-placechange", handlePlaceChange)
    }
  }, [])

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const loaderRef = useRef<any>(null)

  useEffect(() => {
    if (loaderRef.current && apiKey) {
      loaderRef.current.key = apiKey
    }
  }, [apiKey])

  if (!apiKey) {
    return (
      <div className="flex h-full items-center justify-center bg-muted p-4 text-center">
        <p className="text-destructive">
          Map Error: Missing Google Maps API Key.<br />
          Please check .env.local
        </p>
      </div>
    )
  }

  return (
    <div style={{ height, position: "relative" }} className="rounded-xl overflow-hidden shadow-sm border border-border">
      {/* API Loader - Loads the specific libraries we need */}
      <gmpx-api-loader
        ref={loaderRef}
        solution-channel="GMP_GE_mapsandplacesautocomplete_v2"
      />

      <gmp-map
        ref={mapRef}
        center={`${center.lat},${center.lng}`}
        zoom={zoom}
        map-id="DEMO_MAP_ID"
        style={{ height: "100%", width: "100%", display: "block" }}
      >
        {/* Place Picker UI Control */}
        <div slot="control-block-start-inline-start" className="p-4">
          <gmpx-place-picker
            ref={pickerRef}
            placeholder="Search for a place..."
            className="w-full max-w-sm shadow-lg"
          />
        </div>

        {/* Marker for Searched Location */}
        {searchedLocation && (
          <gmp-advanced-marker
            position={`${searchedLocation.lat},${searchedLocation.lng}`}
            title={searchedLocation.name}
          />
        )}

        {/* AQI Location Markers (Using Advanced Markers with Custom HTML Content) */}
        {locations.map((loc, idx) => {
          const color = getAQIColor(loc.aqi)
          return (
            <gmp-advanced-marker
              key={`${loc.name}-${idx}`}
              position={`${loc.lat},${loc.lon}`}
              title={`${loc.name} (AQI: ${loc.aqi})`}
            // Note: Handling clicks on custom elements can sometimes require the inner element
            >
              <div
                className="group relative flex items-center justify-center cursor-pointer"
                onClick={() => onLocationClick?.(loc)}
              >
                <div
                  className="h-8 w-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[10px] font-bold text-white transition-transform hover:scale-110"
                  style={{ backgroundColor: color }}
                >
                  {loc.aqi}
                </div>
                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none z-10">
                  {loc.name}
                </div>
              </div>
            </gmp-advanced-marker>
          )
        })}
      </gmp-map>
    </div>
  )
}
