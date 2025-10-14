import Link from "next/link"
import { Wind, Map, TrendingUp, Bell, FileText, BarChart3, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-bold text-xl group">
            <div className="relative">
              <Wind className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 blur-md bg-primary/30 group-hover:bg-primary/50 transition-all" />
            </div>
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              AirAware
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
            >
              Home
            </Link>
            <Link
              href="/map"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 flex items-center gap-1.5"
            >
              <Map className="h-4 w-4" />
              Map
            </Link>
            <Link
              href="/forecast"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 flex items-center gap-1.5"
            >
              <TrendingUp className="h-4 w-4" />
              Forecast
            </Link>
            <Link
              href="/alerts"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 flex items-center gap-1.5"
            >
              <Bell className="h-4 w-4" />
              Alerts
            </Link>
            <Link
              href="/report"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 flex items-center gap-1.5"
            >
              <FileText className="h-4 w-4" />
              Report
            </Link>
            <Link
              href="/resources"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
            >
              Resources
            </Link>
            <Link
              href="/impact"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 flex items-center gap-1.5"
            >
              <BarChart3 className="h-4 w-4" />
              Impact
            </Link>
            <Link
              href="/about"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 flex items-center gap-1.5"
            >
              <Info className="h-4 w-4" />
              About
            </Link>
          </nav>

          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex border-primary/30 hover:border-primary hover:bg-primary/10 bg-transparent"
          >
            Sign In
          </Button>
        </div>
      </div>
    </header>
  )
}
