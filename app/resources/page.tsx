import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BookOpen, Heart, Users, Home, Activity, AlertTriangle, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function ResourcesPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Air Quality Resources</h1>
        <p className="text-muted-foreground">Learn about air quality, health impacts, and how to protect yourself</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <BookOpen className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Understanding AQI</CardTitle>
            <CardDescription>Learn how air quality is measured and what the numbers mean</CardDescription>
          </CardHeader>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <Heart className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Health Effects</CardTitle>
            <CardDescription>Understand how air pollution affects your health</CardDescription>
          </CardHeader>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <Home className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Protection Tips</CardTitle>
            <CardDescription>Practical steps to reduce exposure and stay safe</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Understanding AQI */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Understanding the Air Quality Index (AQI)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Air Quality Index (AQI) is a standardized indicator of air quality. It tells you how clean or polluted
            your air is, and what associated health effects might be a concern.
          </p>

          <div className="space-y-3">
            <div
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ backgroundColor: "oklch(0.7 0.15 145 / 0.2)" }}
            >
              <div className="font-bold text-lg w-16">0-50</div>
              <div className="flex-1">
                <div className="font-semibold">Good</div>
                <div className="text-sm text-muted-foreground">
                  Air quality is satisfactory, and air pollution poses little or no risk.
                </div>
              </div>
            </div>

            <div
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ backgroundColor: "oklch(0.75 0.15 85 / 0.2)" }}
            >
              <div className="font-bold text-lg w-16">51-100</div>
              <div className="flex-1">
                <div className="font-semibold">Moderate</div>
                <div className="text-sm text-muted-foreground">
                  Air quality is acceptable. However, there may be a risk for some people, particularly those who are
                  unusually sensitive to air pollution.
                </div>
              </div>
            </div>

            <div
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ backgroundColor: "oklch(0.7 0.18 55 / 0.2)" }}
            >
              <div className="font-bold text-lg w-16">101-150</div>
              <div className="flex-1">
                <div className="font-semibold">Unhealthy for Sensitive Groups</div>
                <div className="text-sm text-muted-foreground">
                  Members of sensitive groups may experience health effects. The general public is less likely to be
                  affected.
                </div>
              </div>
            </div>

            <div
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ backgroundColor: "oklch(0.6 0.22 25 / 0.2)" }}
            >
              <div className="font-bold text-lg w-16">151-200</div>
              <div className="flex-1">
                <div className="font-semibold">Unhealthy</div>
                <div className="text-sm text-muted-foreground">
                  Some members of the general public may experience health effects; members of sensitive groups may
                  experience more serious health effects.
                </div>
              </div>
            </div>

            <div
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ backgroundColor: "oklch(0.5 0.2 330 / 0.2)" }}
            >
              <div className="font-bold text-lg w-16">201-300</div>
              <div className="flex-1">
                <div className="font-semibold">Very Unhealthy</div>
                <div className="text-sm text-muted-foreground">
                  Health alert: The risk of health effects is increased for everyone.
                </div>
              </div>
            </div>

            <div
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ backgroundColor: "oklch(0.35 0.15 340 / 0.2)" }}
            >
              <div className="font-bold text-lg w-16">301-500</div>
              <div className="flex-1">
                <div className="font-semibold">Hazardous</div>
                <div className="text-sm text-muted-foreground">
                  Health warning of emergency conditions: everyone is more likely to be affected.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Effects */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-6 w-6" />
            Health Effects of Air Pollution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="sensitive">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Who is Most at Risk?
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-muted-foreground">
                <p>Certain groups are more vulnerable to air pollution:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Children and teenagers (lungs still developing)</li>
                  <li>Adults 65 years and older</li>
                  <li>People with lung diseases (asthma, COPD)</li>
                  <li>People with heart disease or diabetes</li>
                  <li>Pregnant women</li>
                  <li>People who work or exercise outdoors</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="short-term">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Short-term Health Effects
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-muted-foreground">
                <p>Exposure to poor air quality can cause immediate symptoms:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Eye, nose, and throat irritation</li>
                  <li>Coughing and difficulty breathing</li>
                  <li>Chest tightness and wheezing</li>
                  <li>Headaches and dizziness</li>
                  <li>Fatigue and reduced athletic performance</li>
                  <li>Aggravation of existing respiratory conditions</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="long-term">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Long-term Health Effects
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-muted-foreground">
                <p>Prolonged exposure to air pollution can lead to serious health problems:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Development of asthma and other respiratory diseases</li>
                  <li>Increased risk of heart disease and stroke</li>
                  <li>Reduced lung function and lung cancer</li>
                  <li>Premature death in people with heart or lung disease</li>
                  <li>Developmental issues in children</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Protection Tips */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-6 w-6" />
            How to Protect Yourself
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>When Air Quality is Poor</AlertTitle>
            <AlertDescription>Follow these guidelines to reduce your exposure to air pollution</AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Outdoor Activities</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>• Limit outdoor exercise when AQI is unhealthy</p>
                <p>• Exercise in the morning when pollution is lower</p>
                <p>• Avoid busy roads and high-traffic areas</p>
                <p>• Reduce intensity and duration of outdoor activities</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Indoor Air Quality</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>• Keep windows and doors closed on bad air days</p>
                <p>• Use air purifiers with HEPA filters</p>
                <p>• Avoid smoking and burning candles indoors</p>
                <p>• Run air conditioning on recirculate mode</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Personal Protection</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>• Wear N95 or P100 masks when outdoors</p>
                <p>• Take prescribed medications as directed</p>
                <p>• Have a supply of medications on hand</p>
                <p>• Know your triggers and avoid them</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Stay Informed</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>• Check AQI daily before outdoor activities</p>
                <p>• Set up air quality alerts for your area</p>
                <p>• Follow local health department guidance</p>
                <p>• Share information with family and friends</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* External Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
          <CardDescription>Learn more from trusted sources</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link
            href="https://www.airnow.gov"
            target="_blank"
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
          >
            <div>
              <div className="font-semibold">AirNow.gov</div>
              <div className="text-sm text-muted-foreground">Official U.S. air quality information</div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link
            href="https://www.epa.gov/air-quality"
            target="_blank"
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
          >
            <div>
              <div className="font-semibold">EPA Air Quality</div>
              <div className="text-sm text-muted-foreground">Environmental Protection Agency resources</div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link
            href="https://www.lung.org/clean-air"
            target="_blank"
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
          >
            <div>
              <div className="font-semibold">American Lung Association</div>
              <div className="text-sm text-muted-foreground">Health effects and protection guidance</div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
