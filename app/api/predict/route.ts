import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// Type definitions
interface PredictionRequest {
  location: string;
  pollutant: 'PM2.5' | 'Ozone' | 'NO2';
  concentration: number;
  timestamp?: string;
}

interface PredictionResponse {
  location: string;
  pollutant: string;
  concentration: number;
  aqi: number;
  category: string;
  healthMessage: string;
  timestamp: string;
}

// AQI calculation formulas (from EPA standards)
const AQI_BREAKPOINTS = {
  'PM2.5': [
    { cLow: 0.0, cHigh: 12.0, aqiLow: 0, aqiHigh: 50, category: 'Good' },
    { cLow: 12.1, cHigh: 35.4, aqiLow: 51, aqiHigh: 100, category: 'Moderate' },
    { cLow: 35.5, cHigh: 55.4, aqiLow: 101, aqiHigh: 150, category: 'Unhealthy for Sensitive Groups' },
    { cLow: 55.5, cHigh: 150.4, aqiLow: 151, aqiHigh: 200, category: 'Unhealthy' },
    { cLow: 150.5, cHigh: 250.4, aqiLow: 201, aqiHigh: 300, category: 'Very Unhealthy' },
    { cLow: 250.5, cHigh: 500.4, aqiLow: 301, aqiHigh: 500, category: 'Hazardous' },
  ],
  'Ozone': [
    { cLow: 0.000, cHigh: 0.054, aqiLow: 0, aqiHigh: 50, category: 'Good' },
    { cLow: 0.055, cHigh: 0.070, aqiLow: 51, aqiHigh: 100, category: 'Moderate' },
    { cLow: 0.071, cHigh: 0.085, aqiLow: 101, aqiHigh: 150, category: 'Unhealthy for Sensitive Groups' },
    { cLow: 0.086, cHigh: 0.105, aqiLow: 151, aqiHigh: 200, category: 'Unhealthy' },
    { cLow: 0.106, cHigh: 0.200, aqiLow: 201, aqiHigh: 300, category: 'Very Unhealthy' },
  ],
  'NO2': [
    { cLow: 0, cHigh: 53, aqiLow: 0, aqiHigh: 50, category: 'Good' },
    { cLow: 54, cHigh: 100, aqiLow: 51, aqiHigh: 100, category: 'Moderate' },
    { cLow: 101, cHigh: 360, aqiLow: 101, aqiHigh: 150, category: 'Unhealthy for Sensitive Groups' },
    { cLow: 361, cHigh: 649, aqiLow: 151, aqiHigh: 200, category: 'Unhealthy' },
    { cLow: 650, cHigh: 1249, aqiLow: 201, aqiHigh: 300, category: 'Very Unhealthy' },
    { cLow: 1250, cHigh: 2049, aqiLow: 301, aqiHigh: 500, category: 'Hazardous' },
  ],
};

const HEALTH_MESSAGES = {
  'Good': 'Air quality is satisfactory, and air pollution poses little or no risk.',
  'Moderate': 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.',
  'Unhealthy for Sensitive Groups': 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
  'Unhealthy': 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.',
  'Very Unhealthy': 'Health alert: The risk of health effects is increased for everyone.',
  'Hazardous': 'Health warning of emergency conditions: everyone is more likely to be affected.',
};

function calculateAQI(pollutant: string, concentration: number): { aqi: number; category: string } {
  const breakpoints = AQI_BREAKPOINTS[pollutant as keyof typeof AQI_BREAKPOINTS];
  if (!breakpoints) {
    throw new Error(`Unknown pollutant: ${pollutant}`);
  }

  // Find the appropriate breakpoint
  const breakpoint = breakpoints.find(
    bp => concentration >= bp.cLow && concentration <= bp.cHigh
  );

  if (!breakpoint) {
    // If concentration is out of range, use the highest category
    const lastBp = breakpoints[breakpoints.length - 1];
    return { aqi: lastBp.aqiHigh, category: lastBp.category };
  }

  // Calculate AQI using EPA formula
  const { cLow, cHigh, aqiLow, aqiHigh, category } = breakpoint;
  const aqi = Math.round(
    ((aqiHigh - aqiLow) / (cHigh - cLow)) * (concentration - cLow) + aqiLow
  );

  return { aqi, category };
}

export async function POST(request: NextRequest) {
  try {
    const body: PredictionRequest = await request.json();
    
    const { location, pollutant, concentration, timestamp } = body;

    // Validate input
    if (!location || !pollutant || concentration === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: location, pollutant, concentration' },
        { status: 400 }
      );
    }

    if (!['PM2.5', 'Ozone', 'NO2'].includes(pollutant)) {
      return NextResponse.json(
        { error: 'Invalid pollutant. Must be PM2.5, Ozone, or NO2' },
        { status: 400 }
      );
    }

    // Calculate AQI using EPA formula
    const { aqi, category } = calculateAQI(pollutant, concentration);
    const healthMessage = HEALTH_MESSAGES[category as keyof typeof HEALTH_MESSAGES];

    const response: PredictionResponse = {
      location,
      pollutant,
      concentration,
      aqi,
      category,
      healthMessage,
      timestamp: timestamp || new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json(
      { error: 'Prediction failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const location = searchParams.get('location') || 'Washington DC';
  const pollutant = searchParams.get('pollutant') || 'PM2.5';
  const concentration = parseFloat(searchParams.get('concentration') || '10');

  try {
    const { aqi, category } = calculateAQI(pollutant, concentration);
    const healthMessage = HEALTH_MESSAGES[category as keyof typeof HEALTH_MESSAGES];

    const response: PredictionResponse = {
      location,
      pollutant,
      concentration,
      aqi,
      category,
      healthMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Prediction failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
