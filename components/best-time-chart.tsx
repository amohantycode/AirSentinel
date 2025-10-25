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
    <Card className="mt-4">
      <CardHeader>
  <CardTitle>Best Time on {date}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-sm text-muted-foreground">Loading hourly forecast…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {data && (
          <div className="space-y-3">
            <div className="text-sm">
              <p className="font-medium">{data.recommendation.label}</p>
              <p className="text-muted-foreground">≈{data.recommendation.reductionPct}% lower exposure vs worst window · Mean {data.recommendation.meanConc} µg/m³</p>
            </div>
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

            <div>
              <p className="text-sm font-medium">Top options</p>
              <ul className="text-sm text-muted-foreground list-disc pl-5">
                {data.windows.map((w: any) => (
                  <li key={w.startTime}>
                    {w.startTime} → {w.endTime}: mean {w.mean} µg/m³ · −{w.reductionPct}% vs worst
                  </li>
                ))}
              </ul>
              {data.note && <p className="text-xs text-muted-foreground mt-2">{data.note}</p>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
