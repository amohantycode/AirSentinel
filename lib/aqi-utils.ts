// AQI utility functions for color coding and health messaging

export interface AQILevel {
  min: number
  max: number
  level: string
  color: string
  textColor: string
  healthMessage: string
  cautionaryStatement: string
}

export const AQI_LEVELS: AQILevel[] = [
  {
    min: 0,
    max: 50,
    level: "Good",
    color: "oklch(0.7 0.15 145)",
    textColor: "oklch(0.98 0 0)",
    healthMessage: "Air quality is satisfactory",
    cautionaryStatement: "Air pollution poses little or no risk.",
  },
  {
    min: 51,
    max: 100,
    level: "Moderate",
    color: "oklch(0.75 0.15 85)",
    textColor: "oklch(0.2 0 0)",
    healthMessage: "Air quality is acceptable",
    cautionaryStatement: "Unusually sensitive people should consider limiting prolonged outdoor exertion.",
  },
  {
    min: 101,
    max: 150,
    level: "Unhealthy for Sensitive Groups",
    color: "oklch(0.7 0.18 55)",
    textColor: "oklch(0.98 0 0)",
    healthMessage: "Sensitive groups may experience health effects",
    cautionaryStatement:
      "Children, elderly, and people with respiratory conditions should limit prolonged outdoor exertion.",
  },
  {
    min: 151,
    max: 200,
    level: "Unhealthy",
    color: "oklch(0.6 0.22 25)",
    textColor: "oklch(0.98 0 0)",
    healthMessage: "Everyone may begin to experience health effects",
    cautionaryStatement:
      "Everyone should limit prolonged outdoor exertion. Sensitive groups should avoid outdoor activities.",
  },
  {
    min: 201,
    max: 300,
    level: "Very Unhealthy",
    color: "oklch(0.5 0.2 330)",
    textColor: "oklch(0.98 0 0)",
    healthMessage: "Health alert: everyone may experience serious effects",
    cautionaryStatement: "Everyone should avoid prolonged outdoor exertion. Sensitive groups should remain indoors.",
  },
  {
    min: 301,
    max: 500,
    level: "Hazardous",
    color: "oklch(0.35 0.15 340)",
    textColor: "oklch(0.98 0 0)",
    healthMessage: "Health warning of emergency conditions",
    cautionaryStatement: "Everyone should avoid all outdoor exertion. Remain indoors with windows closed.",
  },
]

export function getAQILevel(aqi: number): AQILevel {
  return AQI_LEVELS.find((level) => aqi >= level.min && aqi <= level.max) || AQI_LEVELS[AQI_LEVELS.length - 1]
}

export function getAQIColor(aqi: number): string {
  return getAQILevel(aqi).color
}

export function getAQITextColor(aqi: number): string {
  return getAQILevel(aqi).textColor
}

export function getAQILevelName(aqi: number): string {
  return getAQILevel(aqi).level
}

export function formatAQI(aqi: number | null | undefined): string {
  if (aqi === null || aqi === undefined) return "N/A"
  return Math.round(aqi).toString()
}
