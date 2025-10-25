import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Target, Users, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">About AirSentinel</h1>
        <p className="text-gray-600">Our mission is to turn air-quality data into safer daily decisions.</p>
      </div>

      {/* Mission */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-600">
          <p>
            AirSentinel helps you keep your plans while reducing exposure. We translate air data into clear actions
            like “delay one hour,” “shorten to 30 minutes,” or “move indoors,” so you can do more and breathe better.
          </p>
          <p>
            We combine trusted sources and transparent reasoning to give you practical guidance—especially for kids,
            athletes, and sensitive groups.
          </p>
        </CardContent>
      </Card>

      {/* Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <Leaf className="h-8 w-8 text-emerald-600 mb-2" />
            <CardTitle className="text-lg">Transparency</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            We provide clear, accurate data from trusted sources with no hidden agendas.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="h-8 w-8 text-emerald-600 mb-2" />
            <CardTitle className="text-lg">Community</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            We believe in the power of community-driven data and collective action.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Heart className="h-8 w-8 text-emerald-600 mb-2" />
            <CardTitle className="text-lg">Health First</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            Your health and safety are our top priorities in everything we do.
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>How AirSentinel Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold mb-1">Data Collection</h3>
              <p className="text-sm text-gray-600">We combine EPA monitoring data, community reports, and live conditions.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold mb-1">Analysis & Forecasting</h3>
              <p className="text-sm text-gray-600">We forecast short-term pollutant levels and translate them into expected exposure for specific activities.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">3</div>
            <div>
              <h3 className="font-semibold mb-1">Decision Support</h3>
              <p className="text-sm text-gray-600">We recommend minimal changes—delay, shorten, or move indoors—to cut exposure while keeping your plans.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <h3 className="font-semibold mb-1">Community Action</h3>
              <p className="text-sm text-gray-600">Together, we track trends, share observations, and advocate for cleaner air in our communities.</p>
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
        <CardContent className="space-y-3 text-sm text-gray-600">
          <p>
            <strong>Email:</strong> contact@airsentinel.app
          </p>
          <p>
            <strong>Support:</strong> support@airsentinel.app
          </p>
          <p>
            <strong>Data Partnerships:</strong> data@airsentinel.app
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
