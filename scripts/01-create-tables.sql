-- AirSentinel Database Schema
-- Creates all tables for air quality monitoring system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Observations table: stores raw AQI readings from sensors
CREATE TABLE IF NOT EXISTS observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_name TEXT NOT NULL,
  lat NUMERIC(9,6) NOT NULL,
  lon NUMERIC(9,6) NOT NULL,
  aqi INTEGER NOT NULL CHECK (aqi >= 0 AND aqi <= 500),
  pm25 NUMERIC(6,2),
  pm10 NUMERIC(6,2),
  o3 NUMERIC(6,2),
  no2 NUMERIC(6,2),
  so2 NUMERIC(6,2),
  co NUMERIC(6,2),
  source TEXT NOT NULL CHECK (source IN ('airnow', 'purpleair', 'manual')),
  observed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_observation UNIQUE (location_name, observed_at, source)
);

-- Forecasts table: stores predicted AQI values
CREATE TABLE IF NOT EXISTS forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_name TEXT NOT NULL,
  lat NUMERIC(9,6) NOT NULL,
  lon NUMERIC(9,6) NOT NULL,
  forecast_date DATE NOT NULL,
  forecast_hour INTEGER CHECK (forecast_hour >= 0 AND forecast_hour <= 23),
  aqi_predicted INTEGER NOT NULL CHECK (aqi_predicted >= 0 AND aqi_predicted <= 500),
  confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  weather_temp NUMERIC(5,2),
  weather_humidity NUMERIC(5,2),
  weather_wind_speed NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_forecast UNIQUE (location_name, forecast_date, forecast_hour)
);

-- Reports table: community-submitted air quality reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  location_name TEXT NOT NULL,
  lat NUMERIC(9,6) NOT NULL,
  lon NUMERIC(9,6) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('smoke', 'dust', 'odor', 'haze', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
  description TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts table: stores alert subscriptions and delivery status
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  location_name TEXT NOT NULL,
  lat NUMERIC(9,6) NOT NULL,
  lon NUMERIC(9,6) NOT NULL,
  threshold INTEGER NOT NULL CHECK (threshold >= 0 AND threshold <= 500),
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_alert UNIQUE (user_id, location_name, email)
);

-- Users table extension: stores user preferences
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  preferred_location TEXT,
  preferred_lat NUMERIC(9,6),
  preferred_lon NUMERIC(9,6),
  notification_preferences JSONB DEFAULT '{"email": true, "threshold": 100}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Metrics table: aggregated statistics for analytics
CREATE TABLE IF NOT EXISTS metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_date DATE NOT NULL,
  location_name TEXT NOT NULL,
  avg_aqi NUMERIC(6,2),
  max_aqi INTEGER,
  min_aqi INTEGER,
  hours_unhealthy INTEGER DEFAULT 0,
  total_reports INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_metric UNIQUE (metric_date, location_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_observations_location ON observations(location_name, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_observations_coords ON observations(lat, lon);
CREATE INDEX IF NOT EXISTS idx_forecasts_location ON forecasts(location_name, forecast_date, forecast_hour);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_location ON reports(location_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active, location_name);
CREATE INDEX IF NOT EXISTS idx_metrics_date ON metrics(metric_date DESC, location_name);
