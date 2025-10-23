import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wind, Target, Users, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">About AirAware</h1>
        <p className="text-muted-foreground">
          Our mission to create healthier communities through air quality awareness
        </p>
      </div>

      {/* Mission */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            AirAware was created to empower families and communities with real-time air quality information. We believe
            everyone deserves to breathe clean air and make informed decisions about their health.
          </p>
          <p>
            By combining data from official monitoring stations with community reports, we provide the most
            comprehensive and up-to-date air quality information available.
          </p>
        </CardContent>
      </Card>

      {/* Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <Wind className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Transparency</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            We provide clear, accurate data from trusted sources with no hidden agendas.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Community</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            We believe in the power of community-driven data and collective action.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Heart className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Health First</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Your health and safety are our top priorities in everything we do.
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>How AirAware Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold mb-1">Data Collection</h3>
              <p className="text-sm text-muted-foreground">
                We gather air quality data from EPA monitoring stations, PurpleAir sensors, and community reports.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold mb-1">Analysis & Forecasting</h3>
              <p className="text-sm text-muted-foreground">
                Our system analyzes current conditions and weather patterns to predict air quality for the next 24
                hours.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold mb-1">Alerts & Notifications</h3>
              <p className="text-sm text-muted-foreground">
                When air quality reaches unhealthy levels, we send instant alerts to help you protect yourself and your
                family.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <h3 className="font-semibold mb-1">Community Action</h3>
              <p className="text-sm text-muted-foreground">
                Together, we track trends, share observations, and advocate for cleaner air in our communities.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Get in Touch</CardTitle>
          <CardDescription>Questions, feedback, or partnership inquiries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Email:</strong> contact@airaware.app
          </p>
          <p>
            <strong>Support:</strong> support@airaware.app
          </p>
          <p>
            <strong>Data Partnerships:</strong> data@airaware.app
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
