"use client"

import { ForecastComponent } from "@/components/forecast-component"

export default function ForecastPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Air Quality Forecasting</h1>
          <p className="mt-2 text-gray-600">
            7-day predictions for PM2.5, Ozone, and NO₂ powered by machine learning
          </p>
        </div>
        <ForecastComponent />
      </div>
    </div>
  )
}
