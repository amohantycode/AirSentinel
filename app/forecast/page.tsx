"use client"

import { ForecastComponent } from "@/components/forecast-component"

export default function ForecastPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-4">Air Quality Forecasting</h1>
        <p className="text-lg text-muted-foreground">
          7-day predictions for PM2.5, Ozone, and NO₂ powered by machine learning
        </p>
      </div>
      <ForecastComponent />
    </div>
  )
}
