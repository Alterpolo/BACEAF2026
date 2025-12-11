-- Migration: Initial Schema for Bac Français 2026
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- EXERCISES TABLE
-- Stores all exercises (subjects, answers, feedback)
-- ============================================
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Exercise details
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('Dissertation', 'Commentaire', 'Oral')),
  work_title TEXT,
  work_author TEXT,
  work_parcours TEXT,

  -- Content
  subject TEXT NOT NULL,
  student_answer TEXT,
  ai_feedback TEXT,

  -- Optional score (estimated by AI or self-assessed)
  score INTEGER CHECK (score >= 0 AND score <= 20),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries by user
CREATE INDEX idx_exercises_user_id ON exercises(user_id);
CREATE INDEX idx_exercises_created_at ON exercises(created_at DESC);

-- ============================================
-- PROGRESS TABLE
-- Tracks progress per work (aggregated stats)
-- ============================================
CREATE TABLE IF NOT EXISTS progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Work identification
  work_title TEXT NOT NULL,
  work_author TEXT NOT NULL,

  -- Stats
  exercises_completed INTEGER DEFAULT 0,
  average_score DECIMAL(4,2),

  -- Timestamps
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One progress record per user per work
  UNIQUE(user_id, work_title)
);

CREATE INDEX idx_progress_user_id ON progress(user_id);

-- ============================================
-- NOTES TABLE
-- Personal notes for each work
-- ============================================
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Work identification
  work_title TEXT NOT NULL,
  work_author TEXT NOT NULL,

  -- Content
  content TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_work ON notes(work_title);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Users can only access their own data
-- ============================================

-- Enable RLS on all tables
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Exercises policies
CREATE POLICY "Users can view their own exercises"
  ON exercises FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercises"
  ON exercises FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercises"
  ON exercises FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercises"
  ON exercises FOR DELETE
  USING (auth.uid() = user_id);

-- Progress policies
CREATE POLICY "Users can view their own progress"
  ON progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Notes policies
CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update progress after exercise completion
CREATE OR REPLACE FUNCTION update_progress_on_exercise()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO progress (user_id, work_title, work_author, exercises_completed, last_activity)
  VALUES (NEW.user_id, NEW.work_title, NEW.work_author, 1, NOW())
  ON CONFLICT (user_id, work_title)
  DO UPDATE SET
    exercises_completed = progress.exercises_completed + 1,
    average_score = (
      SELECT AVG(score) FROM exercises
      WHERE user_id = NEW.user_id
      AND work_title = NEW.work_title
      AND score IS NOT NULL
    ),
    last_activity = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update progress
CREATE TRIGGER on_exercise_complete
  AFTER INSERT ON exercises
  FOR EACH ROW
  WHEN (NEW.ai_feedback IS NOT NULL)
  EXECUTE FUNCTION update_progress_on_exercise();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
