import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AQICard } from "@/components/aqi-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Map, TrendingUp, Bell, Users, Wind, AlertTriangle, ArrowRight, Sparkles, Leaf } from "lucide-react"
import { Observation } from "@/lib/types"
import AssessQuick from "@/components/assess-quick"

async function getLatestObservations() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return []
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/observations?select=*&order=created_at.desc&limit=6`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    })

    if (!response.ok) {
      return []
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching observations:", error)
    return []
  }
}

export default async function HomePage() {
  const observations = await getLatestObservations()

  return (
    <div className="flex flex-col w-full">
      {/* Nature Hero (light theme) */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "radial-gradient(1200px 600px at 10% 0%, rgba(56,189,248,0.15), transparent 60%), radial-gradient(1000px 500px at 90% 20%, rgba(16,185,129,0.12), transparent 60%), linear-gradient(180deg, #f7fbff, #f0fbf7)",
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-16 sm:py-20 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-gray-900">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 bg-white/70 shadow-sm">
                <Leaf className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Air Quality & Activity Planning</span>
              </div>
              <h1 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight">
                AirSentinel: Plan your outdoor time
              </h1>
              Explore air-quality observations and compare how activity duration, intensity, and indoor settings affect estimated exposure. See the factors behind each recommendation.
              <div className="flex gap-3 pt-5">
                <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700 hover:scale-105 transition-transform duration-200 elevation-2 hover:elevation-3">
                  <Link href="#assess">Assess my activity</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="hover:scale-105 transition-transform duration-200">
                  <Link href="/map">
                    <Map className="mr-2 h-5 w-5" /> Explore map
                  </Link>
                </Button>
              </div>
            </div>
            <div id="assess" className="bg-white/80 rounded-2xl shadow-xl p-4 sm:p-6 backdrop-blur">
              <AssessQuick />
            </div>
          </div>
        </div>
      </section>

      {/* Monitoring Observations Section */}
      <section className="py-12 sm:py-16 md:py-20 relative bg-background/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 text-balance">Monitoring Observations</h2>
            <p className="text-base sm:text-lg text-muted-foreground">Latest available records from your configured data source</p>
          </div>

          {observations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {observations.slice(0, 6).map((obs: Observation) => (
                <AQICard
                  key={obs.id}
                  location={obs.location_name}
                  aqi={obs.aqi}
                  timestamp={obs.observed_at}
                  lat={obs.lat}
                  lon={obs.lon}
                  pollutants={{
                    pm25: obs.pm25,
                    pm10: obs.pm10,
                    o3: obs.o3,
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No database observations are configured. Explore the map for bundled historical data.</p>
          )}

          <div className="text-center mt-10">
            <Button
              variant="outline"
              asChild
              className="border-primary/30 hover:border-primary hover:bg-primary/10 bg-transparent"
            >
              <Link href="/map">
                View All Locations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Why Choose AirSentinel?</h2>
            <p className="text-lg text-muted-foreground">Practical guidance to keep your plans and cut exposure</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <Card className="glass-card border-border/40 hover:border-primary/50 transition-all group elevation-1 hover:elevation-2 hover:scale-[1.02] duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Map className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Air Quality Map</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Explore monitoring locations and historical air-quality observations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-border/40 hover:border-primary/50 transition-all group elevation-1 hover:elevation-2 hover:scale-[1.02] duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-xl">AI Forecasts</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Seven-day pollutant forecasts when model and data assets are configured
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-border/40 hover:border-primary/50 transition-all group elevation-1 hover:elevation-2 hover:scale-[1.02] duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Smart Alerts</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Save location and threshold preferences for future notification delivery
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-border/40 hover:border-primary/50 transition-all group elevation-1 hover:elevation-2 hover:scale-[1.02] duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-xl">Community Reports</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Share and view local air quality observations from neighbors
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="glass-card border-destructive/30 bg-destructive/5 max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl md:text-3xl mb-3">Stay Informed, Stay Healthy</CardTitle>
                  <CardDescription className="text-base md:text-lg leading-relaxed">
                    Air pollution can affect everyone, especially children, elderly, and those with respiratory
                    conditions. Explore the available data and learn about air quality.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="glow-primary">
                <Link href="/alerts">
                  Create Your First Alert
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Ready to Breathe Easier?</h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Explore local observations and the factors behind activity exposure estimates
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="glow-primary text-base h-12 px-8">
              <Link href="/map">
                Explore the Map
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary/30 hover:border-primary hover:bg-primary/10 text-base h-12 px-8 bg-transparent"
              asChild
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
