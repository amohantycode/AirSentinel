"use client"

import Link from "next/link"
import { Wind, Map, TrendingUp, Bell, FileText, BarChart3, Info, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const NavLinks = () => (
    <>
      <Link
        href="/"
        onClick={() => setMobileMenuOpen(false)}
        className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
      >
        Home
      </Link>
      <Link
        href="/map"
        onClick={() => setMobileMenuOpen(false)}
        className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 flex items-center gap-1.5"
      >
        <Map className="h-4 w-4" />
        Map
      </Link>
      <Link
        href="/forecast"
        onClick={() => setMobileMenuOpen(false)}
        className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 flex items-center gap-1.5"
      >
        <TrendingUp className="h-4 w-4" />
        Forecast
      </Link>
      <Link
        href="/alerts"
        onClick={() => setMobileMenuOpen(false)}
        className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 flex items-center gap-1.5"
      >
        <Bell className="h-4 w-4" />
        Alerts
      </Link>
      <Link
        href="/report"
        onClick={() => setMobileMenuOpen(false)}
        className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 flex items-center gap-1.5"
      >
        <FileText className="h-4 w-4" />
        Report
      </Link>
      <Link
        href="/impact"
        onClick={() => setMobileMenuOpen(false)}
        className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 flex items-center gap-1.5"
      >
        <BarChart3 className="h-4 w-4" />
        Impact
      </Link>
      <Link
        href="/resources"
        onClick={() => setMobileMenuOpen(false)}
        className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
      >
        Resources
      </Link>
      <Link
        href="/about"
        onClick={() => setMobileMenuOpen(false)}
        className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 flex items-center gap-1.5"
      >
        <Info className="h-4 w-4" />
        About
      </Link>
    </>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-card backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 font-bold text-lg sm:text-xl group flex-shrink-0">
            <div className="relative">
              <Wind className="h-6 w-6 sm:h-7 sm:w-7 text-primary transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 blur-md bg-primary/30 group-hover:bg-primary/50 transition-all" />
            </div>
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              AirAware
            </span>
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
          <nav className="lg:hidden border-t border-border/40 py-4">
            <div className="flex flex-col gap-2">
              <NavLinks />
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
