-- Enable Row Level Security on all tables

ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- Observations: Public read, authenticated write
CREATE POLICY "Public can view observations"
  ON observations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert observations"
  ON observations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Forecasts: Public read, authenticated write
CREATE POLICY "Public can view forecasts"
  ON forecasts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert forecasts"
  ON forecasts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Reports: Public read approved, users manage their own
CREATE POLICY "Public can view approved reports"
  ON reports FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own reports"
  ON reports FOR UPDATE
  USING (auth.uid() = user_id);

-- Alerts: Users can only manage their own
CREATE POLICY "Users can view their own alerts"
  ON alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alerts"
  ON alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
  ON alerts FOR DELETE
  USING (auth.uid() = user_id);

-- User Profiles: Users can only manage their own
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Metrics: Public read, service role write
CREATE POLICY "Public can view metrics"
  ON metrics FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage metrics"
  ON metrics FOR ALL
  USING (auth.role() = 'service_role');
