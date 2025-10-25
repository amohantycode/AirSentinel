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
          <div className="flex items-center gap-3 pt-6">
            <Switch checked={indoors} onCheckedChange={setIndoors} id="indoors" />
            <Label htmlFor="indoors">Indoors</Label>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleAssess} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Assess
          </Button>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {result && (
          <div className="rounded-lg border p-4 bg-white/80">
            <h4 className="font-semibold mb-2">Recommendation</h4>
            <p className="text-sm mb-2">{result.recommendation.label} — reduces exposure by ~{result.recommendation.reductionPct.toFixed(0)}%</p>
            <p className="text-xs text-gray-600">Baseline dose: {result.baseline.dose.toFixed(1)} (CI {result.baseline.ci.low.toFixed(1)}–{result.baseline.ci.high.toFixed(1)})</p>

            <div className="mt-3">
              <h5 className="font-medium mb-1">Why this?</h5>
              <ul className="text-sm list-disc pl-5 text-gray-700">
                <li>Forecasted PM2.5 for the day: ~{result.concentration?.toFixed?.(1) ?? result.concentration} µg/m³</li>
                <li>Activity intensity factor: ×{result.drivers?.intensityFactor?.toFixed?.(1)}</li>
                <li>Sensitivity factor: ×{result.drivers?.sensitivityFactor?.toFixed?.(1)}</li>
                {result.inputs?.indoors ? (
                  <li>Indoors infiltration factor applied: ×{result.drivers?.indoorFactor}</li>
                ) : (
                  <li>Outdoors: no infiltration reduction applied</li>
                )}
                <li>Duration considered: {result.drivers?.durationHours?.toFixed?.(2)} hours</li>
              </ul>
            </div>

            <div className="mt-3">
              <h5 className="font-medium mb-1">Alternatives</h5>
              <ul className="text-sm list-disc pl-5">
                {result.alternatives.map((a: any) => (
                  <li key={a.id}>{a.label}: −{a.reductionPct.toFixed(0)}% (cost {a.cost})</li>
                ))}
              </ul>
            </div>

            {/* Best time of day visualization for the selected date/location using ML daily forecast */}
            <BestTimeChart
              city={city}
              date={new Date(start).toISOString().slice(0,10)}
              durationMin={duration}
              intensity={intensity}
              sensitivity={sensitivity}
              indoors={indoors}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
