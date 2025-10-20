"use client"

import Link from "next/link"
import { Wind, Map, TrendingUp, Bell, FileText, BarChart3, Info, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  const NavLinks = () => (
    <>
      <Link
        href="/"
        onClick={() => setOpen(false)}
        className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
      >
        Home
      </Link>
      <Link
        href="/map"
        onClick={() => setOpen(false)}
        className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 flex items-center gap-1.5"
      >
        <Map className="h-4 w-4" />
        Map
      </Link>
      <Link
        href="/forecast"
        onClick={() => setOpen(false)}
        className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 flex items-center gap-1.5"
      >
        <TrendingUp className="h-4 w-4" />
        Forecast
      </Link>
      <Link
        href="/alerts"
        onClick={() => setOpen(false)}
        className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 flex items-center gap-1.5"
      >
        <Bell className="h-4 w-4" />
        Alerts
      </Link>
      <Link
        href="/report"
        onClick={() => setOpen(false)}
        className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 flex items-center gap-1.5"
      >
        <FileText className="h-4 w-4" />
        Report
      </Link>
      <Link
        href="/impact"
        onClick={() => setOpen(false)}
        className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 flex items-center gap-1.5"
      >
        <BarChart3 className="h-4 w-4" />
        Impact
      </Link>
      <Link
        href="/resources"
        onClick={() => setOpen(false)}
        className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
      >
        Resources
      </Link>
      <Link
        href="/about"
        onClick={() => setOpen(false)}
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

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 flex-wrap justify-center flex-1">
            <NavLinks />
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex border-primary/30 hover:border-primary hover:bg-primary/10 bg-transparent"
            >
              Sign In
            </Button>

            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <div className="flex flex-col gap-4 mt-8">
                  <Link href="/" className="flex items-center gap-3 font-bold text-xl pb-4 border-b">
                    <Wind className="h-6 w-6 text-primary" />
                    <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                      AirAware
                    </span>
                  </Link>
                  <nav className="flex flex-col gap-1">
                    <NavLinks />
                  </nav>
                  <Button variant="outline" className="mt-4 border-primary/30 hover:border-primary hover:bg-primary/10">
                    Sign In
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
