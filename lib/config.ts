// Environment configuration helper
export const config = {
  // API Configuration
  apiBase: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000',
  
  // Maps Configuration
  mapsProvider: (process.env.NEXT_PUBLIC_MAPS_PROVIDER || 'google') as 'google' | 'mapbox',
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '',
  
  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
}

// Validation helpers
export const validateConfig = () => {
  const errors: string[] = []
  
  if (config.mapsProvider === 'google' && !config.googleMapsApiKey) {
    errors.push('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is required when using Google Maps')
  }
  
  if (config.mapsProvider === 'mapbox' && !config.mapboxToken) {
    errors.push('NEXT_PUBLIC_MAPBOX_TOKEN is required when using Mapbox')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Get Maps API Key based on provider
export const getMapsApiKey = () => {
  if (config.mapsProvider === 'google') {
    return config.googleMapsApiKey
  }
  if (config.mapsProvider === 'mapbox') {
    return config.mapboxToken
  }
  return ''
}
