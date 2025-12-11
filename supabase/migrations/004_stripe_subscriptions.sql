-- =============================================
-- Migration 004: Stripe Subscriptions & Tutoring
-- =============================================

-- =============================================
-- ENUM TYPES
-- =============================================

CREATE TYPE subscription_plan AS ENUM (
  'free',
  'student_premium',
  'student_tutoring',
  'teacher_pro'
);

CREATE TYPE subscription_status AS ENUM (
  'active',
  'trialing',
  'past_due',
  'canceled',
  'incomplete'
);

CREATE TYPE billing_interval AS ENUM (
  'month',
  'year'
);

CREATE TYPE tutoring_session_status AS ENUM (
  'scheduled',
  'completed',
  'canceled',
  'no_show'
);

-- =============================================
-- SUBSCRIPTIONS TABLE
-- =============================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Stripe IDs
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,

  -- Plan info
  plan subscription_plan NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  billing_interval billing_interval,

  -- Dates
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,

  -- Usage tracking (for free plan limits)
  exercises_this_week INT NOT NULL DEFAULT 0,
  week_start DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Tutoring hours (for student_tutoring plan)
  tutoring_hours_remaining DECIMAL(4,2) DEFAULT 0,
  tutoring_hours_reset_date DATE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Index for quick lookups
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- =============================================
-- STRIPE EVENTS LOG (for webhook idempotency)
-- =============================================

CREATE TABLE stripe_events (
  id TEXT PRIMARY KEY, -- Stripe event ID
  event_type TEXT NOT NULL,
  stripe_customer_id TEXT,
  data JSONB,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stripe_events_customer ON stripe_events(stripe_customer_id);

-- =============================================
-- TUTORS TABLE
-- =============================================

CREATE TABLE tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Tutor info
  bio TEXT,
  specialties TEXT[], -- ['dissertation', 'commentaire', 'oral']
  hourly_rate DECIMAL(6,2), -- For internal tracking

  -- Availability settings
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  max_students_per_week INT DEFAULT 10,

  -- Stats
  total_sessions INT NOT NULL DEFAULT 0,
  average_rating DECIMAL(3,2),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX idx_tutors_active ON tutors(is_active) WHERE is_active = TRUE;

-- =============================================
-- TUTOR AVAILABILITY
-- =============================================

CREATE TABLE tutor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,

  -- Time slot
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  -- Duration of each slot in minutes
  slot_duration INT NOT NULL DEFAULT 60,

  -- Validity period (null = always valid)
  valid_from DATE,
  valid_until DATE,

  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (end_time > start_time)
);

CREATE INDEX idx_tutor_availability_tutor ON tutor_availability(tutor_id);
CREATE INDEX idx_tutor_availability_day ON tutor_availability(day_of_week);

-- =============================================
-- TUTORING SESSIONS
-- =============================================

CREATE TABLE tutoring_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Participants
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,

  -- Session details
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  status tutoring_session_status NOT NULL DEFAULT 'scheduled',

  -- Content
  topic TEXT, -- What the student wants to work on
  focus_area TEXT, -- 'dissertation', 'commentaire', 'oral'
  work_title TEXT, -- Specific work to discuss

  -- Meeting info
  meeting_url TEXT,
  meeting_notes TEXT, -- Tutor's notes after session

  -- Rating
  student_rating INT CHECK (student_rating BETWEEN 1 AND 5),
  student_feedback TEXT,

  -- Timestamps
  completed_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tutoring_sessions_student ON tutoring_sessions(student_id);
CREATE INDEX idx_tutoring_sessions_tutor ON tutoring_sessions(tutor_id);
CREATE INDEX idx_tutoring_sessions_scheduled ON tutoring_sessions(scheduled_at);
CREATE INDEX idx_tutoring_sessions_status ON tutoring_sessions(status);

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutoring_sessions ENABLE ROW LEVEL SECURITY;

-- Subscriptions: users can only see their own
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can manage subscriptions"
  ON subscriptions FOR ALL
  TO service_role
  USING (TRUE);

-- Stripe events: only service role
CREATE POLICY "Only service role can access stripe events"
  ON stripe_events FOR ALL
  TO service_role
  USING (TRUE);

-- Tutors: anyone can view active tutors
CREATE POLICY "Anyone can view active tutors"
  ON tutors FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "Tutors can update own profile"
  ON tutors FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Tutor availability: anyone can view
CREATE POLICY "Anyone can view tutor availability"
  ON tutor_availability FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "Tutors can manage own availability"
  ON tutor_availability FOR ALL
  TO authenticated
  USING (tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));

-- Tutoring sessions: participants can view
CREATE POLICY "Students can view own sessions"
  ON tutoring_sessions FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Tutors can view assigned sessions"
  ON tutoring_sessions FOR SELECT
  TO authenticated
  USING (tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));

CREATE POLICY "Students can create sessions"
  ON tutoring_sessions FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Participants can update sessions"
  ON tutoring_sessions FOR UPDATE
  TO authenticated
  USING (
    student_id = auth.uid() OR
    tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid())
  );

-- =============================================
-- FUNCTIONS
-- =============================================

-- Auto-create subscription for new users
CREATE OR REPLACE FUNCTION handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on profiles insert
CREATE TRIGGER on_profile_created_subscription
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_subscription();

-- Reset weekly exercise count
CREATE OR REPLACE FUNCTION reset_weekly_exercises()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET
    exercises_this_week = 0,
    week_start = CURRENT_DATE
  WHERE week_start < CURRENT_DATE - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can do exercise (for free plan)
CREATE OR REPLACE FUNCTION can_do_exercise(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription subscriptions%ROWTYPE;
BEGIN
  SELECT * INTO v_subscription
  FROM subscriptions
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Premium users always can
  IF v_subscription.plan != 'free' AND v_subscription.status IN ('active', 'trialing') THEN
    RETURN TRUE;
  END IF;

  -- Reset week if needed
  IF v_subscription.week_start < CURRENT_DATE - INTERVAL '7 days' THEN
    UPDATE subscriptions
    SET exercises_this_week = 0, week_start = CURRENT_DATE
    WHERE user_id = p_user_id;
    RETURN TRUE;
  END IF;

  -- Check limit (3 per week for free)
  RETURN v_subscription.exercises_this_week < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment exercise count
CREATE OR REPLACE FUNCTION increment_exercise_count(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET
    exercises_this_week = exercises_this_week + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check subscription access
CREATE OR REPLACE FUNCTION check_subscription_access(p_user_id UUID, p_feature TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription subscriptions%ROWTYPE;
BEGIN
  SELECT * INTO v_subscription
  FROM subscriptions
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check if subscription is active
  IF v_subscription.status NOT IN ('active', 'trialing') THEN
    RETURN FALSE;
  END IF;

  -- Feature checks
  CASE p_feature
    WHEN 'ai_unlimited' THEN
      RETURN v_subscription.plan IN ('student_premium', 'student_tutoring', 'teacher_pro');
    WHEN 'tutoring' THEN
      RETURN v_subscription.plan = 'student_tutoring' AND v_subscription.tutoring_hours_remaining > 0;
    WHEN 'class_management' THEN
      RETURN v_subscription.plan = 'teacher_pro';
    ELSE
      RETURN TRUE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get available tutoring slots for a date range
CREATE OR REPLACE FUNCTION get_available_slots(
  p_start_date DATE,
  p_end_date DATE,
  p_tutor_id UUID DEFAULT NULL
)
RETURNS TABLE (
  tutor_id UUID,
  tutor_name TEXT,
  slot_start TIMESTAMPTZ,
  slot_end TIMESTAMPTZ,
  duration_minutes INT
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(p_start_date, p_end_date, '1 day'::interval)::DATE as slot_date
  ),
  potential_slots AS (
    SELECT
      t.id as tutor_id,
      p.name as tutor_name,
      (ds.slot_date + ta.start_time) AT TIME ZONE 'Europe/Paris' as slot_start,
      (ds.slot_date + ta.end_time) AT TIME ZONE 'Europe/Paris' as slot_end,
      ta.slot_duration as duration_minutes
    FROM tutors t
    JOIN profiles p ON t.user_id = p.id
    JOIN tutor_availability ta ON t.id = ta.tutor_id
    CROSS JOIN date_series ds
    WHERE t.is_active = TRUE
      AND ta.is_active = TRUE
      AND EXTRACT(DOW FROM ds.slot_date) = ta.day_of_week
      AND (ta.valid_from IS NULL OR ds.slot_date >= ta.valid_from)
      AND (ta.valid_until IS NULL OR ds.slot_date <= ta.valid_until)
      AND (p_tutor_id IS NULL OR t.id = p_tutor_id)
  )
  SELECT ps.*
  FROM potential_slots ps
  WHERE NOT EXISTS (
    SELECT 1 FROM tutoring_sessions ts
    WHERE ts.tutor_id = ps.tutor_id
      AND ts.status = 'scheduled'
      AND ts.scheduled_at = ps.slot_start
  )
  AND ps.slot_start > NOW()
  ORDER BY ps.slot_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Book a tutoring session
CREATE OR REPLACE FUNCTION book_tutoring_session(
  p_student_id UUID,
  p_tutor_id UUID,
  p_scheduled_at TIMESTAMPTZ,
  p_duration_minutes INT DEFAULT 60,
  p_topic TEXT DEFAULT NULL,
  p_focus_area TEXT DEFAULT NULL,
  p_work_title TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_subscription subscriptions%ROWTYPE;
BEGIN
  -- Check student has tutoring access
  SELECT * INTO v_subscription
  FROM subscriptions
  WHERE user_id = p_student_id;

  IF NOT FOUND OR v_subscription.plan != 'student_tutoring' THEN
    RAISE EXCEPTION 'Student does not have tutoring plan';
  END IF;

  IF v_subscription.tutoring_hours_remaining < (p_duration_minutes / 60.0) THEN
    RAISE EXCEPTION 'Not enough tutoring hours remaining';
  END IF;

  -- Create session
  INSERT INTO tutoring_sessions (
    student_id, tutor_id, scheduled_at, duration_minutes,
    topic, focus_area, work_title
  )
  VALUES (
    p_student_id, p_tutor_id, p_scheduled_at, p_duration_minutes,
    p_topic, p_focus_area, p_work_title
  )
  RETURNING id INTO v_session_id;

  -- Deduct hours
  UPDATE subscriptions
  SET
    tutoring_hours_remaining = tutoring_hours_remaining - (p_duration_minutes / 60.0),
    updated_at = NOW()
  WHERE user_id = p_student_id;

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_timestamp
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_timestamp();

CREATE TRIGGER update_tutors_timestamp
  BEFORE UPDATE ON tutors
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_timestamp();

CREATE TRIGGER update_tutoring_sessions_timestamp
  BEFORE UPDATE ON tutoring_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_timestamp();
