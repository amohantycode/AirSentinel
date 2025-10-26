"use client"

import { useEffect, useMemo, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type Props = {
  city: string
  date: string
  durationMin: number
  intensity: string
  sensitivity: string
  indoors: boolean
}

export default function BestTimeChart({ city, date, durationMin, intensity, sensitivity, indoors }: Props) {
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let aborted = false
    async function run() {
      setLoading(true)
      setError(null)
      setData(null)
      try {
  const params = new URLSearchParams({ city, date, durationMin: String(durationMin), intensity, sensitivity, indoors: String(indoors) })
        const res = await fetch(`/api/assess/best-hours?${params.toString()}`)
        const j = await res.json()
        if (!res.ok) throw new Error(j?.error || "Failed to load best hours")
        if (!aborted) setData(j)
      } catch (e: any) {
        if (!aborted) setError(e.message)
      } finally {
        if (!aborted) setLoading(false)
      }
    }
    run()
    return () => {
      aborted = true
    }
  }, [city, date, durationMin, intensity, sensitivity, indoors])

  const bestWindow = useMemo(() => {
    if (!data?.windows?.length) return null
    return data.windows[0]
  }, [data])

  return (
    <Card className="mt-4 border-t-2 border-t-primary/20">
      <CardHeader>
        <CardTitle className="text-base">⏰ Best Time on {date}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading hourly forecast…</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800 font-medium">⚠️ Could not load hourly data</p>
            <p className="text-sm text-amber-700 mt-1">{error}</p>
            <p className="text-xs text-amber-600 mt-2">Using daily forecast average instead.</p>
          </div>
        )}
        
        {data && data.hours && data.hours.length > 0 && (
          <div className="space-y-3">
            {data.recommendation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="font-medium text-sm text-blue-900">{data.recommendation.label}</p>
                <p className="text-blue-700 text-sm mt-1">
                  ≈{data.recommendation.reductionPct}% lower exposure vs worst window
                </p>
                <p className="text-blue-600 text-xs mt-1">
                  Mean concentration: {data.recommendation.meanConc} µg/m³
                </p>
              </div>
            )}
            
            <ChartContainer
              config={{ pm25: { label: "PM2.5 (µg/m³)", color: "hsl(var(--primary))" } }}
              className="w-full h-64"
            >
              <ResponsiveContainer>
                <LineChart data={data.hours} margin={{ left: 12, right: 12, top: 12, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} minTickGap={24} />
                  <YAxis tick={{ fontSize: 10 }} width={40} />
                  <ChartTooltip cursor={{ stroke: "hsl(var(--border))" }} content={<ChartTooltipContent labelKey="time" nameKey="pm25" />} />
                  {/* Shade best window */}
                  {bestWindow && (
                    <ReferenceArea x1={bestWindow.startTime} x2={bestWindow.endTime} fill="hsl(var(--accent))" fillOpacity={0.12} />
                  )}
                  <Line type="monotone" dataKey="pm25" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>

            {data.windows && data.windows.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">🏆 Top Time Windows</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {data.windows.map((w: any, idx: number) => (
                    <li key={w.startTime} className="flex justify-between items-center py-1">
                      <span>
                        {idx === 0 && "🥇 "}
                        {idx === 1 && "🥈 "}
                        {idx === 2 && "🥉 "}
                        {w.startTime} → {w.endTime}
                      </span>
                      <span className="text-emerald-600 font-medium">−{w.reductionPct}%</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 mt-2">
                  Mean: {data.windows[0]?.mean} µg/m³
                </p>
              </div>
            )}

            {data.note && (
              <p className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded">
                ℹ️ {data.note}
              </p>
            )}
          </div>
        )}

        {!loading && !error && data && (!data.hours || data.hours.length === 0) && (
          <div className="bg-gray-50 border rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">No hourly data available for this date.</p>
            <p className="text-xs text-gray-500 mt-1">Try a date within the next 3 days.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
