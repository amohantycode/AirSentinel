"use client"

import { useEffect, useRef, useState } from "react"
import { getAQIColor } from "@/lib/aqi-utils"

// Declare global for Google Maps loader
declare global {
  interface Window {
    google: typeof google
  }
}

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
  center = { lat: 38.9072, lng: -77.0369 }, // Center of DMV (Washington DC)
  zoom = 9, // Zoom level to show DMV region
  height = "500px",
  onLocationClick,
}: GoogleMapWrapperProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize Google Maps
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      setError("Google Maps API key is not configured")
      setIsLoading(false)
      return
    }

    const initMap = async () => {
      try {
        // Check if Google Maps is already loaded
        if (!window.google) {
          // Load Google Maps script
          const script = document.createElement("script")
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
          script.async = true
          script.defer = true
          
          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve()
            script.onerror = () => reject(new Error("Failed to load Google Maps"))
            document.head.appendChild(script)
          })
        }

        if (!mapRef.current) return

        // DMV region bounds
        const dmvBounds = {
          north: 39.8, // Northern Maryland
          south: 37.9, // Southern Virginia
          west: -78.2, // Western Virginia
          east: -76.0, // Eastern Maryland
        }

        const mapInstance = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          restriction: {
            latLngBounds: dmvBounds,
            strictBounds: false, // Allow some panning outside
          },
          minZoom: 8, // Prevent zooming out too far
          maxZoom: 15, // Prevent zooming in too close
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        })

        setMap(mapInstance)
        setIsLoading(false)
      } catch (err: unknown) {
        console.error("Error loading Google Maps:", err)
        setError("Failed to load Google Maps")
        setIsLoading(false)
      }
    }

    initMap()
  }, [center, zoom])

  // Update markers when locations change
  useEffect(() => {
    if (!map || !window.google) return

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null))

    // Create new markers
    const newMarkers = locations.map((location) => {
      const color = getAQIColor(location.aqi)

      // Create custom marker with AQI color
      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lon },
        map,
        title: `${location.name} - AQI: ${location.aqi}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 0.9,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 10,
        },
        animation: google.maps.Animation.DROP,
      })

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 150px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${location.name}</h3>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="
                width: 40px; 
                height: 40px; 
                border-radius: 8px; 
                background-color: ${color}; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 16px;
              ">
                ${location.aqi}
              </div>
              <div style="font-size: 12px; color: #666;">
                Air Quality Index
              </div>
            </div>
          </div>
        `,
      })

      // Add click listener
      marker.addListener("click", () => {
        infoWindow.open(map, marker)
        onLocationClick?.(location)
      })

      return marker
    })

    setMarkers(newMarkers)

    // Fit bounds to show all markers within DMV region
    if (locations.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      locations.forEach((location) => {
        bounds.extend({ lat: location.lat, lng: location.lon })
      })
      
      // Add padding to bounds for better view
      const padding = { top: 50, right: 50, bottom: 50, left: 50 }
      map.fitBounds(bounds, padding)

      // Ensure we stay within a reasonable zoom range for DMV
      const listener = google.maps.event.addListener(map, "idle", () => {
        const currentZoom = map.getZoom()
        if (currentZoom && currentZoom > 12) {
          map.setZoom(12) // Max zoom for DMV overview
        } else if (currentZoom && currentZoom < 8) {
          map.setZoom(8) // Min zoom to keep DMV in view
        }
        google.maps.event.removeListener(listener)
      })
    }
  }, [map, locations, onLocationClick])

  if (error) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center bg-muted rounded-lg border"
      >
        <div className="text-center p-6">
          <p className="text-destructive font-semibold mb-2">Error Loading Map</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Please check your Google Maps API key in .env.local
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative" style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} className="rounded-lg" />
    </div>
  )
}
