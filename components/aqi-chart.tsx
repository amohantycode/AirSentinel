"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart, Dot } from "recharts"
import { getAQIColor } from "@/lib/aqi-utils"

interface AQIChartProps {
  data: Array<{
    time: string
    aqi: number
  }>
  height?: number
}

// Custom tooltip for better interactivity
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const aqi = data.aqi

    let category = "Unknown"
    let categoryColor = "#808080"

    if (aqi <= 50) {
      category = "Good"
      categoryColor = "#22c55e"
    } else if (aqi <= 100) {
      category = "Moderate"
      categoryColor = "#eab308"
    } else if (aqi <= 150) {
      category = "Unhealthy for Sensitive Groups"
      categoryColor = "#f97316"
    } else if (aqi <= 200) {
      category = "Unhealthy"
      categoryColor = "#ef4444"
    } else if (aqi <= 300) {
      category = "Very Unhealthy"
      categoryColor = "#a855f7"
    } else {
      category = "Hazardous"
      categoryColor = "#7f1d1d"
    }

    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold text-popover-foreground">{data.time}</p>
        <p className="text-2xl font-bold mt-1" style={{ color: categoryColor }}>
          {aqi}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{category}</p>
      </div>
    )
  }
  return null
}

// Custom dot for hover effect
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props
  const aqi = payload.aqi

  let color = "#808080"
  if (aqi <= 50) color = "#22c55e"
  else if (aqi <= 100) color = "#eab308"
  else if (aqi <= 150) color = "#f97316"
  else if (aqi <= 200) color = "#ef4444"
  else if (aqi <= 300) color = "#a855f7"
  else color = "#7f1d1d"

  return (
    <g>
      <circle cx={cx} cy={cy} r={4} fill={color} opacity={0.8} />
      <circle cx={cx} cy={cy} r={8} fill={color} opacity={0.2} />
    </g>
  )
}

export function AQIChart({ data, height = 400 }: AQIChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full text-muted-foreground">
        No data available
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
        >
          <defs>
            <linearGradient id="colorAQI" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" />
          <XAxis
            dataKey="time"
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            stroke="hsl(var(--border))"
          />
          <YAxis
            domain={[0, 200]}
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            stroke="hsl(var(--border))"
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Reference lines with labels */}
          <ReferenceLine
            y={50}
            stroke="#22c55e"
            strokeDasharray="5 5"
            opacity={0.5}
            label={{
              value: "Good (50)",
              position: "right",
              fill: "#22c55e",
              fontSize: 11,
              offset: 10,
            }}
          />
          <ReferenceLine
            y={100}
            stroke="#eab308"
            strokeDasharray="5 5"
            opacity={0.5}
            label={{
              value: "Moderate (100)",
              position: "right",
              fill: "#eab308",
              fontSize: 11,
              offset: 10,
            }}
          />
          <ReferenceLine
            y={150}
            stroke="#f97316"
            strokeDasharray="5 5"
            opacity={0.5}
            label={{
              value: "Unhealthy (150)",
              position: "right",
              fill: "#f97316",
              fontSize: 11,
              offset: 10,
            }}
          />

          {/* Main area and line */}
          <Area
            type="monotone"
            dataKey="aqi"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            fill="url(#colorAQI)"
            isAnimationActive={true}
            animationDuration={800}
            dot={<CustomDot />}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
