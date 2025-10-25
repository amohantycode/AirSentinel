"use client"

import { getAQILevel } from "@/lib/aqi-utils"
import { cn } from "@/lib/utils"

interface AQIBadgeProps {
  aqi: number
  size?: "sm" | "md" | "lg" | "xl"
  showLabel?: boolean
  className?: string
}

export function AQIBadge({ aqi, size = "md", className, showLabel = true }: AQIBadgeProps) {
  const aqiLevel = getAQILevel(aqi)
  const { color, level } = aqiLevel

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
    xl: "text-lg px-5 py-2",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center font-semibold rounded-md border-0 text-white",
        sizeClasses[size],
        className,
      )}
      style={{ backgroundColor: color }}
      role="status"
      aria-label={`Air Quality Index: ${aqi}, ${level}`}
    >
      {showLabel ? `${aqi} - ${level}` : aqi}
    </div>
  )
}
