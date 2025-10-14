"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { getAQIColor } from "@/lib/aqi-utils"

interface AQIChartProps {
  data: Array<{
    time: string
    aqi: number
  }>
  height?: number
}

export function AQIChart({ data, height = 300 }: AQIChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="time" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
        <YAxis domain={[0, 200]} className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "hsl(var(--popover-foreground))" }}
        />
        <ReferenceLine
          y={50}
          stroke={getAQIColor(50)}
          strokeDasharray="3 3"
          label={{ value: "Good", position: "right" }}
        />
        <ReferenceLine
          y={100}
          stroke={getAQIColor(100)}
          strokeDasharray="3 3"
          label={{ value: "Moderate", position: "right" }}
        />
        <ReferenceLine
          y={150}
          stroke={getAQIColor(150)}
          strokeDasharray="3 3"
          label={{ value: "Unhealthy", position: "right" }}
        />
        <Line
          type="monotone"
          dataKey="aqi"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: "hsl(var(--primary))" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
