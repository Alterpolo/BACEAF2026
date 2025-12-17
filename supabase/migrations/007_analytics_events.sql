-- =============================================
-- Migration 007: Analytics Events
-- =============================================
-- Simple analytics tracking for conversion funnel

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_properties JSONB DEFAULT '{}',
  session_id TEXT,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_event ON analytics_events(user_id, event_name);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events
CREATE POLICY "Users can insert own events"
ON analytics_events FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR user_id IS NULL
);

-- Admins can read all events (for analytics dashboard)
-- Note: You'll need to create an admin role or use service role key for analytics queries
CREATE POLICY "Service role can read all events"
ON analytics_events FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'service_role'
);

-- Useful views for conversion analysis
CREATE OR REPLACE VIEW conversion_funnel AS
SELECT
  DATE_TRUNC('day', created_at) AS day,
  COUNT(DISTINCT CASE WHEN event_name = 'signup' THEN user_id END) AS signups,
  COUNT(DISTINCT CASE WHEN event_name = 'onboarding_completed' THEN user_id END) AS onboarded,
  COUNT(DISTINCT CASE WHEN event_name = 'first_exercise' THEN user_id END) AS activated,
  COUNT(DISTINCT CASE WHEN event_name = 'limit_reached' THEN user_id END) AS limit_reached,
  COUNT(DISTINCT CASE WHEN event_name = 'checkout_started' THEN user_id END) AS checkout_started,
  COUNT(DISTINCT CASE WHEN event_name = 'subscription_created' THEN user_id END) AS converted
FROM analytics_events
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY day DESC;

-- Add comments
COMMENT ON TABLE analytics_events IS 'Simple analytics tracking for conversion funnel';
COMMENT ON VIEW conversion_funnel IS 'Daily conversion funnel metrics for last 30 days';
