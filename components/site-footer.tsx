import Link from "next/link"
import { Wind } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <Wind className="h-4 w-4" />
              <span>AirAware</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time air quality monitoring and forecasting for healthier communities.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2">Features</h3>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="/map" className="text-muted-foreground hover:text-foreground transition-colors">
                  Live Map
                </Link>
              </li>
              <li>
                <Link href="/forecast" className="text-muted-foreground hover:text-foreground transition-colors">
                  Forecasts
                </Link>
              </li>
              <li>
                <Link href="/alerts" className="text-muted-foreground hover:text-foreground transition-colors">
                  Alerts
                </Link>
              </li>
              <li>
                <Link href="/report" className="text-muted-foreground hover:text-foreground transition-colors">
                  Community Reports
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2">Learn</h3>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="/resources" className="text-muted-foreground hover:text-foreground transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/impact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Impact Dashboard
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AirAware. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
