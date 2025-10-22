"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileText, MapPin, Camera, CheckCircle2, AlertTriangle, Clock, Users, Loader2 } from "lucide-react"

interface Report {
  id: string
  location_name?: string
  location?: string
  category: string
  severity: string
  description: string
  created_at?: string
  timestamp?: string
  status: "pending" | "approved" | "rejected"
}

const DMV_LOCATIONS = [
  "Washington, DC",
  "Arlington, VA",
  "Alexandria, VA",
  "Baltimore, MD",
  "Silver Spring, MD",
  "Bethesda, MD",
  "Rockville, MD",
  "College Park, MD",
  "Annapolis, MD",
]

export default function ReportPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    location: "",
    category: "",
    severity: "",
    description: "",
  })

  // Fetch reports on mount
  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/reports")
      const data = await response.json()

      if (data.success) {
        // Normalize the response to handle both location_name and location fields
        const normalizedReports = (data.data || data.reports || []).map((report: Report) => ({
          ...report,
          location: report.location_name || report.location,
          timestamp: report.created_at || report.timestamp,
        }))
        setReports(normalizedReports)
      } else {
        setError(data.error || "Failed to load reports")
      }
    } catch (err) {
      console.error("Error fetching reports:", err)
      setError("Failed to connect to server")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      setError(null)

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location_name: formData.location,
          category: formData.category,
          severity: formData.severity,
          description: formData.description,
          lat: 0, // Geocoding would be added in production
          lon: 0,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setFormData({ location: "", category: "", severity: "", description: "" })
        setSubmitted(true)
        setShowForm(false)
        setTimeout(() => setSubmitted(false), 5000)
        // Refresh reports list
        fetchReports()
      } else {
        setError(data.error || "Failed to submit report")
      }
    } catch (err) {
      console.error("Error submitting report:", err)
      setError("Failed to connect to server")
    } finally {
      setSubmitting(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      smoke: "🔥",
      dust: "💨",
      odor: "👃",
      haze: "🌫️",
      other: "📍",
    }
    return icons[category] || "📍"
  }

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      mild: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      moderate: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
      severe: "bg-red-500/10 text-red-700 dark:text-red-400",
    }
    return colors[severity] || ""
  }

  const getStatusBadge = (status: string) => {
    if (status === "approved") return <Badge variant="default">Approved</Badge>
    if (status === "pending") return <Badge variant="secondary">Pending Review</Badge>
    return <Badge variant="destructive">Rejected</Badge>
  }

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Community Reports</h1>
        <p className="text-muted-foreground">Share and view local air quality observations from your community</p>
      </div>

      {/* Success Alert */}
      {submitted && (
        <Alert className="mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Report Submitted Successfully!</AlertTitle>
          <AlertDescription>
            Thank you for contributing to our community. Your report is pending review and will be visible once
            approved.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{reports.filter((r) => r.status === "approved").length}</div>
                <div className="text-sm text-muted-foreground">Active Reports</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{reports.filter((r) => r.status === "pending").length}</div>
                <div className="text-sm text-muted-foreground">Pending Review</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">
                  {reports.filter((r) => r.severity === "severe" && r.status === "approved").length}
                </div>
                <div className="text-sm text-muted-foreground">Severe Conditions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Report Button */}
      {!showForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Button onClick={() => setShowForm(true)} className="w-full" size="lg">
              <FileText className="mr-2 h-5 w-5" />
              Submit New Report
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Submit Report Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Submit Air Quality Report</CardTitle>
            <CardDescription>Help your community by reporting local air quality conditions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select DMV location" />
                </SelectTrigger>
                <SelectContent>
                  {DMV_LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smoke">Smoke</SelectItem>
                    <SelectItem value="dust">Dust</SelectItem>
                    <SelectItem value="odor">Odor</SelectItem>
                    <SelectItem value="haze">Haze</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => setFormData({ ...formData, severity: value })}
                >
                  <SelectTrigger id="severity">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what you're observing (e.g., visibility, smell, symptoms)"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Photo (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input id="photo" type="file" accept="image/*" className="flex-1" />
                <Button variant="outline" size="icon">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Upload a photo to help verify your report</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={!formData.location || !formData.category || !formData.severity || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1" disabled={submitting}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Reports</h2>
          <Badge variant="secondary">{reports.length} total</Badge>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-spin" />
              <h3 className="text-lg font-semibold mb-2">Loading reports...</h3>
              <p className="text-muted-foreground">Fetching community air quality reports</p>
            </CardContent>
          </Card>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to report air quality conditions in your area</p>
              <Button onClick={() => setShowForm(true)}>
                <FileText className="mr-2 h-4 w-4" />
                Submit Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{getCategoryIcon(report.category)}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{report.location}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="capitalize">
                            {report.category}
                          </Badge>
                          <Badge className={getSeverityColor(report.severity) + " capitalize"}>{report.severity}</Badge>
                          {getStatusBadge(report.status)}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground whitespace-nowrap">
                        {report.timestamp ? new Date(report.timestamp).toLocaleString() : "Unknown"}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Guidelines */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Reporting Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Be Specific:</strong> Include exact location details and what you're observing (visibility, smell,
            physical symptoms).
          </p>
          <p>
            <strong>Be Honest:</strong> Only report conditions you're actually experiencing. False reports harm the
            community.
          </p>
          <p>
            <strong>Add Photos:</strong> Visual evidence helps verify reports and provides valuable data for analysis.
          </p>
          <p>
            <strong>Moderation:</strong> All reports are reviewed before being published to ensure quality and accuracy.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
