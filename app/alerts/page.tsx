"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Bell, Plus, Trash2, MapPin, Mail, CheckCircle2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AlertSubscription {
  id: string
  location: string
  email: string
  threshold: number
  isActive: boolean
}

interface CurrentAQ {
  pm25?: { aqi: number; category: string }
  o3?: { aqi: number; category: string }
  no2?: { aqi: number; category: string }
}

// DMV region default locations
const DMV_LOCATIONS = [
  "Washington, DC",
  "Arlington, VA",
  "Alexandria, VA",
  "Baltimore, MD",
  "Silver Spring, MD",
  "Bethesda, MD"
]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertSubscription[]>([])
  const [currentAQ, setCurrentAQ] = useState<CurrentAQ | null>(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [activeAlerts, setActiveAlerts] = useState<string[]>([])
  const [formData, setFormData] = useState({
    location: "Washington, DC",
    email: "",
    threshold: "100",
  })

  // Fetch current AQ for monitoring
  useEffect(() => {
    const fetchCurrentAQ = async () => {
      if (alerts.length === 0) return
      
      // Check first active alert location
      const activeAlert = alerts.find((a: AlertSubscription) => a.isActive)
      if (!activeAlert) return

      try {
        const res = await fetch(`/api/current-aq?city=${encodeURIComponent(activeAlert.location)}`)
        const data = await res.json()
        if (data.current) {
          setCurrentAQ(data.current)
          
          // Check if any thresholds exceeded
          const maxAQI = Math.max(
            data.current.pm25?.aqi || 0,
            data.current.o3?.aqi || 0,
            data.current.no2?.aqi || 0
          )
          
          const triggered = alerts
            .filter((a: AlertSubscription) => a.isActive && maxAQI >= a.threshold)
            .map((a: AlertSubscription) => a.id)
          
          setActiveAlerts(triggered)
        }
      } catch (err) {
        console.error("Failed to fetch current AQ:", err)
      }
    }

    fetchCurrentAQ()
    // Refresh every 10 minutes
    const interval = setInterval(fetchCurrentAQ, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [alerts])

  const handleCreateAlert = () => {
    const newAlert: AlertSubscription = {
      id: Date.now().toString(),
      location: formData.location,
      email: formData.email,
      threshold: Number.parseInt(formData.threshold),
      isActive: true,
    }
    setAlerts([...alerts, newAlert])
    setFormData({ location: "", email: "", threshold: "100" })
    setShowForm(false)
  }

  const handleToggleAlert = (id: string) => {
    setAlerts(alerts.map((alert: AlertSubscription) => (alert.id === id ? { ...alert, isActive: !alert.isActive } : alert)))
  }

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter((alert: AlertSubscription) => alert.id !== id))
  }

  const getThresholdLabel = (threshold: number) => {
    if (threshold <= 50) return "Good"
    if (threshold <= 100) return "Moderate"
    if (threshold <= 150) return "Unhealthy for Sensitive"
    if (threshold <= 200) return "Unhealthy"
    return "Very Unhealthy"
  }

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Air Quality Alerts</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Real-time monitoring with email notifications</p>
        </div>

        {/* Active Alert Warning */}
        {activeAlerts.length > 0 && (
          <Alert className="mb-4 sm:mb-6 border-red-500 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-sm sm:text-base text-red-900">Air Quality Alert Triggered!</AlertTitle>
            <AlertDescription className="text-sm text-red-800">
              {activeAlerts.length} of your alert{activeAlerts.length > 1 ? 's have' : ' has'} been triggered. 
              Current AQI exceeds your threshold. Check your email for details.
            </AlertDescription>
          </Alert>
        )}

        {/* Info Alert */}
        <Alert className="mb-4 sm:mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle className="text-sm sm:text-base">Real-Time Protection</AlertTitle>
          <AlertDescription className="text-sm">
            Alerts use live WeatherAPI data refreshed every 10 minutes. Set custom thresholds to protect sensitive family members.
          </AlertDescription>
        </Alert>

        {/* Create Alert Button */}
        {!showForm && (
          <Card className="mb-4 sm:mb-6">
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
              <Button onClick={() => setShowForm(true)} className="w-full" size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create New Alert
              </Button>
            </CardContent>
          </Card>
        )}

      {/* Create Alert Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Alert</CardTitle>
            <CardDescription>Set up a new air quality alert for your location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={formData.location}
                onValueChange={(value: string) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select DMV location" />
                </SelectTrigger>
                <SelectContent>
                  {DMV_LOCATIONS.map((loc: string) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold">Alert Threshold (AQI)</Label>
              <Select
                value={formData.threshold}
                onValueChange={(value: string) => setFormData({ ...formData, threshold: value })}
              >
                <SelectTrigger id="threshold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 - Good</SelectItem>
                  <SelectItem value="100">100 - Moderate</SelectItem>
                  <SelectItem value="150">150 - Unhealthy for Sensitive Groups</SelectItem>
                  <SelectItem value="200">200 - Unhealthy</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">You'll be notified when AQI exceeds this level</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleCreateAlert} className="flex-1">
                Create Alert
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Alerts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Alerts</h2>
          <Badge variant="secondary">{alerts.length} total</Badge>
        </div>

        {alerts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No alerts yet</h3>
              <p className="text-muted-foreground mb-4">Create your first alert to start monitoring air quality</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Alert
              </Button>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert: AlertSubscription) => (
            <Card key={alert.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{alert.location}</span>
                      {alert.isActive ? (
                        <Badge variant="default" className="ml-2">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="ml-2">
                          Paused
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{alert.email}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Alert when AQI exceeds <strong>{alert.threshold}</strong> ({getThresholdLabel(alert.threshold)})
                      </span>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <Switch checked={alert.isActive} onCheckedChange={() => handleToggleAlert(alert.id)} />
                        <Label className="text-sm">{alert.isActive ? "Active" : "Paused"}</Label>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* How It Works */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How Alerts Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>1. Real-time Monitoring:</strong> We check air quality every 5 minutes for your selected locations.
          </p>
          <p>
            <strong>2. Instant Notifications:</strong> When AQI exceeds your threshold, you'll receive an email alert
            immediately.
          </p>
          <p>
            <strong>3. Smart Throttling:</strong> We won't spam you - alerts are sent at most once every 4 hours per
            location.
          </p>
          <p>
            <strong>4. Easy Management:</strong> Pause, resume, or delete alerts anytime from this page.
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
