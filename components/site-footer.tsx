import Link from "next/link"
import { Leaf } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-emerald-100 bg-white/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <Leaf className="h-4 w-4 text-emerald-600" />
              <span>AirSentinel</span>
            </div>
            <p className="text-xs text-gray-600">
              Personalized, actionable recommendations to cut exposure during outdoor activities.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2 text-gray-900">Features</h3>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="/map" className="text-gray-600 hover:text-emerald-700 transition-colors">
                  Live Map
                </Link>
              </li>
              <li>
                <Link href="/forecast" className="text-gray-600 hover:text-emerald-700 transition-colors">
                  Forecasts
                </Link>
              </li>
              <li>
                <Link href="/alerts" className="text-gray-600 hover:text-emerald-700 transition-colors">
                  Alerts
                </Link>
              </li>
              <li>
                <Link href="/report" className="text-gray-600 hover:text-emerald-700 transition-colors">
                  Community Reports
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2 text-gray-900">Learn</h3>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="/resources" className="text-gray-600 hover:text-emerald-700 transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/impact" className="text-gray-600 hover:text-emerald-700 transition-colors">
                  Impact Dashboard
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-emerald-700 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-emerald-100 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} AirSentinel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
