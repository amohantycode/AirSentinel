import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getAQILevel } from "@/lib/aqi-utils"
import { AlertTriangle, Heart, Wind } from "lucide-react"

interface HealthRecommendationsProps {
  aqi: number
}

export function HealthRecommendations({ aqi }: HealthRecommendationsProps) {
  const level = getAQILevel(aqi)

  const getIcon = () => {
    if (aqi > 150) return <AlertTriangle className="h-5 w-5" />
    if (aqi > 100) return <Wind className="h-5 w-5" />
    return <Heart className="h-5 w-5" />
  }

  const getVariant = () => {
    if (aqi > 150) return "destructive"
    if (aqi > 100) return "default"
    return "default"
  }

  return (
    <Alert variant={getVariant() as "default" | "destructive"}>
      {getIcon()}
      <AlertTitle className="font-semibold">{level.level}</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>{level.healthMessage}</p>
        <p className="text-sm">{level.cautionaryStatement}</p>
      </AlertDescription>
    </Alert>
  )
}
