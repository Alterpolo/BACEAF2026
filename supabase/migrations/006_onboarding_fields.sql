-- =============================================
-- Migration 006: Onboarding Fields
-- =============================================
-- Adds fields to profiles table for onboarding data

-- Add onboarding columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS class_level TEXT,
ADD COLUMN IF NOT EXISTS exam_date TEXT,
ADD COLUMN IF NOT EXISTS focus_work JSONB;

-- Add index for quick lookup of incomplete onboarding
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding
ON profiles(onboarding_completed)
WHERE onboarding_completed = FALSE;

-- Add comment
COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether user has completed the onboarding flow';
COMMENT ON COLUMN profiles.class_level IS 'Student class level: premiere_generale, premiere_techno, premiere_pro';
COMMENT ON COLUMN profiles.exam_date IS 'Target exam date: juin_2026, septembre_2026';
COMMENT ON COLUMN profiles.focus_work IS 'JSON object with title, author, genre of focus work';
