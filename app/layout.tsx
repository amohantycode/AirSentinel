import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "AirAware - Real-time Air Quality Monitoring",
  description: "Monitor local air quality, get forecasts, and receive alerts for healthier communities.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <div className="flex min-h-screen flex-col bg-background">
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
            <SiteHeader />
            <main className="flex-1 w-full">{children}</main>
            <SiteFooter />
          </Suspense>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
