"use client"

import Link from "next/link"
import { Leaf, Map, TrendingUp, Bell, FileText, BarChart3, Info, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const NavLinks = () => (
    <>
      <Link
        href="/"
        onClick={() => setMobileMenuOpen(false)}
        className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-emerald-50"
      >
        Home
      </Link>
      <Link
        href="/map"
        onClick={() => setMobileMenuOpen(false)}
        className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-emerald-50 flex items-center gap-1.5"
      >
        <Map className="h-4 w-4" />
        Map
      </Link>
      <Link
        href="/forecast"
        onClick={() => setMobileMenuOpen(false)}
        className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-emerald-50 flex items-center gap-1.5"
      >
        <TrendingUp className="h-4 w-4" />
        Forecast
      </Link>
      <Link
        href="/alerts"
        onClick={() => setMobileMenuOpen(false)}
        className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-emerald-50 flex items-center gap-1.5"
      >
        <Bell className="h-4 w-4" />
        Alerts
      </Link>
      <Link
        href="/report"
        onClick={() => setMobileMenuOpen(false)}
        className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-emerald-50 flex items-center gap-1.5"
      >
        <FileText className="h-4 w-4" />
        Report
      </Link>
      <Link
        href="/impact"
        onClick={() => setMobileMenuOpen(false)}
        className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-emerald-50 flex items-center gap-1.5"
      >
        <BarChart3 className="h-4 w-4" />
        Impact
      </Link>
      <Link
        href="/resources"
        onClick={() => setMobileMenuOpen(false)}
        className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-emerald-50"
      >
        Resources
      </Link>
      <Link
        href="/about"
        onClick={() => setMobileMenuOpen(false)}
        className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-emerald-50 flex items-center gap-1.5"
      >
        <Info className="h-4 w-4" />
        About
      </Link>
    </>
  )

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 supports-[backdrop-filter]:backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 font-bold text-lg sm:text-xl group flex-shrink-0">
            <div className="relative">
              <Leaf className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-600 transition-transform group-hover:scale-110" />
            </div>
            <span className="text-gray-900">AirSentinel</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 flex-wrap justify-center flex-1">
            <NavLinks />
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-emerald-100 py-4 bg-white/70">
            <div className="flex flex-col gap-2">
              <NavLinks />
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
