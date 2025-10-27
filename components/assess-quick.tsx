"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import LocationInput from "./location-input"
import BestTimeChart from "./best-time-chart"

export default function AssessQuick() {
  const [city, setCity] = useState("Washington, DC")
  const [location, setLocation] = useState<{ label: string; lat: number; lon: number } | null>(null)
  const [start, setStart] = useState<string>(new Date().toISOString().slice(0, 16)) // yyyy-MM-ddTHH:mm
  const [duration, setDuration] = useState(60)
  const [intensity, setIntensity] = useState("moderate")
  const [sensitivity, setSensitivity] = useState("normal")
  const [indoors, setIndoors] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAssess() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const params = new URLSearchParams({
        city: location ? `${location.lat},${location.lon}` : city,
        start: new Date(start).toISOString(),
        durationMin: String(duration),
        intensity,
        sensitivity,
        indoors: String(indoors),
      })
      const res = await fetch(`/api/assess?${params.toString()}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Assessment failed")
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border border-black/5 shadow-xl">
      <CardHeader>
        <CardTitle>Assess My Activity</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Location</Label>
            <LocationInput value={location} onChange={setLocation} placeholder="e.g., Richmond, VA or Virginia" />
            <p className="text-xs text-muted-foreground">Tip: You can also type coordinates like 38.9072,-77.0369</p>
          </div>
          <div className="space-y-2">
            <Label>Start Time</Label>
            <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input type="number" value={duration} min={15} max={240} onChange={(e) => setDuration(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Activity Intensity</Label>
            <Select value={intensity} onValueChange={setIntensity}>
              <SelectTrigger>
                <SelectValue placeholder="Choose intensity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resting">Resting</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="vigorous">Vigorous</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Sensitivity</Label>
            <Select value={sensitivity} onValueChange={setSensitivity}>
              <SelectTrigger>
                <SelectValue placeholder="Choose sensitivity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="sensitive">Sensitive (asthma, elderly, kids)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 pt-6 md:ml-4">
            <Switch checked={indoors} onCheckedChange={setIndoors} id="indoors" />
            <Label htmlFor="indoors">Indoors</Label>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleAssess} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Assess
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-800 text-sm font-medium">⚠️ Assessment Failed</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <p className="text-red-600 text-xs mt-2">Tip: Check your location and date, or try again in a moment.</p>
          </div>
        )}

        {result && (
          <div className="rounded-lg border p-4 bg-white/80 space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-lg">✨ Recommendation</h4>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="text-sm font-medium text-emerald-900 mb-1">{result.recommendation?.label || "Keep your plan"}</p>
                <p className="text-emerald-700 text-sm">Reduces exposure by ~{result.recommendation?.reductionPct?.toFixed?.(0) ?? 0}%</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <h5 className="font-medium mb-2 text-sm">📊 Your Baseline Exposure</h5>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{result.baseline?.dose?.toFixed?.(1) ?? "N/A"}</span>
                <span className="text-sm text-gray-600">relative units</span>
              </div>
              {result.baseline?.ci && (
                <p className="text-xs text-gray-600 mt-1">
                  Confidence interval: {result.baseline.ci.low?.toFixed?.(1)} – {result.baseline.ci.high?.toFixed?.(1)}
                  <span className="ml-1 text-gray-500">(±20% uncertainty)</span>
                </p>
              )}
            </div>

            <div>
              <h5 className="font-medium mb-2 text-sm">🔍 Calculation Factors</h5>
              <ul className="text-sm list-disc pl-5 text-gray-700 space-y-1">
                <li>Forecasted PM2.5: ~{result.concentration?.toFixed?.(1) ?? result.concentration ?? "N/A"} µg/m³</li>
                <li>Activity intensity: ×{result.drivers?.intensityFactor?.toFixed?.(1) ?? "1.0"}</li>
                <li>Sensitivity: ×{result.drivers?.sensitivityFactor?.toFixed?.(1) ?? "1.0"}</li>
                {result.inputs?.indoors ? (
                  <li>Indoor infiltration: ×{result.drivers?.indoorFactor?.toFixed?.(1) ?? "0.4"}</li>
                ) : (
                  <li>Outdoor exposure (no infiltration reduction)</li>
                )}
                <li>Duration: {result.drivers?.durationHours?.toFixed?.(2) ?? "N/A"} hours</li>
              </ul>
            </div>

            {result.alternatives && result.alternatives.length > 0 && (
              <div>
                <h5 className="font-medium mb-2 text-sm">📋 Other Options</h5>
                <ul className="text-sm space-y-1">
                  {result.alternatives.map((a: any) => (
                    <li key={a.id} className="flex justify-between items-center py-1">
                      <span>{a.label}</span>
                      <span className="text-emerald-600 font-medium">−{a.reductionPct?.toFixed?.(0) ?? 0}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Best time of day visualization for the selected date/location using ML daily forecast */}
            {result.date && (
              <BestTimeChart
                city={location?.label || city}
                date={result.date}
                durationMin={duration}
                intensity={intensity}
                sensitivity={sensitivity}
                indoors={indoors}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
