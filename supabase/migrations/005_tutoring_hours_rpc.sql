-- =============================================
-- Migration 005: Atomic Tutoring Hours Functions
-- =============================================
-- These functions provide atomic operations for tutoring hours
-- to prevent race conditions during concurrent updates

-- Increment tutoring hours (for refunds/cancellations)
CREATE OR REPLACE FUNCTION increment_tutoring_hours(
  p_user_id UUID,
  p_hours DECIMAL(4,2)
)
RETURNS DECIMAL(4,2) AS $$
DECLARE
  v_new_hours DECIMAL(4,2);
BEGIN
  UPDATE subscriptions
  SET
    tutoring_hours_remaining = GREATEST(0, tutoring_hours_remaining + p_hours),
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING tutoring_hours_remaining INTO v_new_hours;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription not found for user: %', p_user_id;
  END IF;

  RETURN v_new_hours;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement tutoring hours (for bookings)
-- Returns remaining hours, or raises exception if insufficient
CREATE OR REPLACE FUNCTION decrement_tutoring_hours(
  p_user_id UUID,
  p_hours DECIMAL(4,2)
)
RETURNS DECIMAL(4,2) AS $$
DECLARE
  v_current_hours DECIMAL(4,2);
  v_new_hours DECIMAL(4,2);
BEGIN
  -- Lock the row and get current hours
  SELECT tutoring_hours_remaining INTO v_current_hours
  FROM subscriptions
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription not found for user: %', p_user_id;
  END IF;

  IF v_current_hours < p_hours THEN
    RAISE EXCEPTION 'Insufficient tutoring hours. Available: %, Required: %', v_current_hours, p_hours;
  END IF;

  -- Perform atomic update
  UPDATE subscriptions
  SET
    tutoring_hours_remaining = tutoring_hours_remaining - p_hours,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING tutoring_hours_remaining INTO v_new_hours;

  RETURN v_new_hours;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_tutoring_hours(UUID, DECIMAL) TO service_role;
GRANT EXECUTE ON FUNCTION decrement_tutoring_hours(UUID, DECIMAL) TO service_role;

COMMENT ON FUNCTION increment_tutoring_hours IS 'Atomically adds hours to a user subscription. Used for refunds when sessions are canceled.';
COMMENT ON FUNCTION decrement_tutoring_hours IS 'Atomically subtracts hours from a user subscription. Raises exception if insufficient hours.';
