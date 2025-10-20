"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Bell, Plus, Trash2, MapPin, Mail, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AlertSubscription {
  id: string
  location: string
  email: string
  threshold: number
  isActive: boolean
}

// Mock data - Real DMV monitoring locations
const mockAlerts: AlertSubscription[] = [
  {
    id: "1",
    location: "River Terrace, DC",
    email: "user@example.com",
    threshold: 100,
    isActive: true,
  },
  {
    id: "2",
    location: "Baltimore County, MD",
    email: "user@example.com",
    threshold: 150,
    isActive: false,
  },
]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertSubscription[]>(mockAlerts)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    location: "",
    email: "",
    threshold: "100",
  })

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
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, isActive: !alert.isActive } : alert)))
  }

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== id))
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
          <p className="text-sm sm:text-base text-muted-foreground">Get notified when air quality reaches unhealthy levels</p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-4 sm:mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle className="text-sm sm:text-base">Stay Protected</AlertTitle>
          <AlertDescription className="text-sm">
            Set up alerts to receive email notifications when air quality in your area exceeds your chosen threshold.
            Perfect for protecting sensitive family members.
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
              <Input
                id="location"
                placeholder="Enter city or zip code"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold">Alert Threshold (AQI)</Label>
              <Select
                value={formData.threshold}
                onValueChange={(value) => setFormData({ ...formData, threshold: value })}
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
          alerts.map((alert) => (
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
