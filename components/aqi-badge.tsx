"use client"

import { getAQILevel } from "@/lib/aqi-utils"
import { cn } from "@/lib/utils"

interface AQIBadgeProps {
  aqi: number
  size?: "sm" | "md" | "lg" | "xl"
  showLabel?: boolean
  className?: string
}

export function AQIBadge({ aqi, size = "md", showLabel = true, className }: AQIBadgeProps) {
  const level = getAQILevel(aqi)

  const sizeClasses = {
    sm: "w-12 h-12 text-sm",
    md: "w-16 h-16 text-lg",
    lg: "w-24 h-24 text-2xl",
    xl: "w-32 h-32 text-4xl",
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className={cn("rounded-full flex items-center justify-center font-bold shadow-lg", sizeClasses[size])}
        style={{
          backgroundColor: level.color,
          color: level.textColor,
        }}
      >
        {Math.round(aqi)}
      </div>
      {showLabel && (
        <div className="text-center">
          <div className="font-semibold text-sm">{level.level}</div>
        </div>
      )}
    </div>
  )
}
