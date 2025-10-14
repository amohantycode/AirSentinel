-- Seed sample data for development and testing

-- Insert sample observations for major cities
INSERT INTO observations (location_name, lat, lon, aqi, pm25, pm10, source, observed_at)
VALUES
  ('Los Angeles, CA', 34.0522, -118.2437, 87, 28.5, 45.2, 'airnow', NOW() - INTERVAL '1 hour'),
  ('San Francisco, CA', 37.7749, -122.4194, 42, 12.3, 22.1, 'airnow', NOW() - INTERVAL '1 hour'),
  ('New York, NY', 40.7128, -74.0060, 55, 15.8, 28.4, 'airnow', NOW() - INTERVAL '1 hour'),
  ('Chicago, IL', 41.8781, -87.6298, 68, 19.2, 35.6, 'airnow', NOW() - INTERVAL '1 hour'),
  ('Houston, TX', 29.7604, -95.3698, 72, 21.4, 38.9, 'airnow', NOW() - INTERVAL '1 hour'),
  ('Phoenix, AZ', 33.4484, -112.0740, 95, 32.1, 52.3, 'airnow', NOW() - INTERVAL '1 hour'),
  ('Seattle, WA', 47.6062, -122.3321, 38, 10.5, 18.7, 'airnow', NOW() - INTERVAL '1 hour'),
  ('Denver, CO', 39.7392, -104.9903, 61, 17.3, 31.2, 'airnow', NOW() - INTERVAL '1 hour')
ON CONFLICT (location_name, observed_at, source) DO NOTHING;

-- Insert sample forecasts for next 24 hours
INSERT INTO forecasts (location_name, lat, lon, forecast_date, forecast_hour, aqi_predicted, confidence, weather_temp, weather_humidity, weather_wind_speed)
SELECT 
  'Los Angeles, CA',
  34.0522,
  -118.2437,
  CURRENT_DATE,
  hour,
  75 + (hour % 12) * 3,
  0.85,
  72.5 + (hour % 12) * 1.5,
  45.0 - (hour % 12) * 2,
  8.5 + (hour % 12) * 0.5
FROM generate_series(0, 23) AS hour
ON CONFLICT (location_name, forecast_date, forecast_hour) DO NOTHING;

-- Insert sample community reports
INSERT INTO reports (location_name, lat, lon, category, severity, description, status, created_at)
VALUES
  ('Downtown LA', 34.0407, -118.2468, 'smoke', 'moderate', 'Visible smoke from nearby wildfires affecting visibility', 'approved', NOW() - INTERVAL '2 hours'),
  ('Santa Monica', 34.0195, -118.4912, 'haze', 'mild', 'Light haze near the beach area', 'approved', NOW() - INTERVAL '4 hours'),
  ('Brooklyn', 40.6782, -73.9442, 'odor', 'mild', 'Chemical smell near industrial area', 'pending', NOW() - INTERVAL '1 hour')
ON CONFLICT DO NOTHING;

-- Insert sample metrics
INSERT INTO metrics (metric_date, location_name, avg_aqi, max_aqi, min_aqi, hours_unhealthy, total_reports)
VALUES
  (CURRENT_DATE - INTERVAL '1 day', 'Los Angeles, CA', 82.5, 105, 58, 6, 12),
  (CURRENT_DATE - INTERVAL '1 day', 'San Francisco, CA', 45.3, 62, 32, 0, 3),
  (CURRENT_DATE - INTERVAL '1 day', 'New York, NY', 58.7, 78, 42, 2, 8)
ON CONFLICT (metric_date, location_name) DO NOTHING;
