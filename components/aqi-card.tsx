import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AQIBadge } from "@/components/aqi-badge"
import { getAQILevel } from "@/lib/aqi-utils"
import { MapPin, Clock } from "lucide-react"

interface AQICardProps {
  location: string
  aqi: number
  timestamp?: string
  lat?: number
  lon?: number
  pollutants?: {
    pm25?: number
    pm10?: number
    o3?: number
  }
}

export function AQICard({ location, aqi, timestamp, lat, lon, pollutants }: AQICardProps) {
  const level = getAQILevel(aqi)

  return (
    <Card className="w-full glass-card border-border/40 hover:border-primary/50 transition-all group">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-balance">{location}</span>
        </CardTitle>
        {timestamp && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <Clock className="w-3.5 h-3.5" />
            {new Date(timestamp).toLocaleString()}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-6">
          <AQIBadge aqi={aqi} size="lg" showLabel={false} />
          <div className="flex-1 min-w-0">
            <div className="text-xl font-bold text-balance">{level.level}</div>
            <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{level.healthMessage}</div>
          </div>
        </div>

        {pollutants &&
          (pollutants.pm25 !== undefined || pollutants.pm10 !== undefined || pollutants.o3 !== undefined) && (
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/40">
              {pollutants.pm25 !== undefined && (
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">PM2.5</div>
                  <div className="text-base font-semibold">{pollutants.pm25.toFixed(1)}</div>
                </div>
              )}
              {pollutants.pm10 !== undefined && (
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">PM10</div>
                  <div className="text-base font-semibold">{pollutants.pm10.toFixed(1)}</div>
                </div>
              )}
              {pollutants.o3 !== undefined && (
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">O₃</div>
                  <div className="text-base font-semibold">{(pollutants.o3 * 1000).toFixed(1)}</div>
                </div>
              )}
            </div>
          )}

        <div className="text-xs text-muted-foreground pt-3 border-t border-border/40 leading-relaxed">
          {level.cautionaryStatement}
        </div>
      </CardContent>
    </Card>
  )
}
