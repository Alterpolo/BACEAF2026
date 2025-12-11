-- Migration: Methodology Progression System
-- Run this in Supabase SQL Editor after 002_teacher_mode.sql

-- ============================================
-- SKILLS TABLE (compétences méthodologiques)
-- ============================================
CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('Dissertation', 'Commentaire', 'Oral')),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  icon TEXT,

  -- Thresholds for mastery levels
  exercises_to_unlock INTEGER DEFAULT 1,
  exercises_to_master INTEGER DEFAULT 3,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER_SKILLS TABLE (progression par utilisateur)
-- ============================================
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,

  -- Progression
  exercises_completed INTEGER DEFAULT 0,
  best_score INTEGER,
  average_score DECIMAL(4,2),

  -- Status: locked, unlocked, in_progress, mastered
  status TEXT DEFAULT 'locked' CHECK (status IN ('locked', 'unlocked', 'in_progress', 'mastered')),

  unlocked_at TIMESTAMPTZ,
  mastered_at TIMESTAMPTZ,
  last_practice TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, skill_id)
);

CREATE INDEX idx_user_skills_user ON user_skills(user_id);
CREATE INDEX idx_user_skills_status ON user_skills(user_id, status);

-- ============================================
-- SKILL_EXERCISES TABLE (exercices ciblés)
-- ============================================
CREATE TABLE IF NOT EXISTS skill_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,

  -- Exercise content
  prompt TEXT NOT NULL,
  student_answer TEXT,
  ai_feedback TEXT,
  score INTEGER CHECK (score >= 0 AND score <= 20),

  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_skill_exercises_user ON skill_exercises(user_id);
CREATE INDEX idx_skill_exercises_skill ON skill_exercises(skill_id);

-- ============================================
-- ACHIEVEMENTS TABLE (badges)
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('methodology', 'practice', 'mastery', 'special')),

  -- Unlock conditions (JSON)
  conditions JSONB NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER_ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,

  unlocked_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Skills are public (read-only)
CREATE POLICY "Skills are viewable by everyone"
  ON skills FOR SELECT
  USING (TRUE);

-- User skills
CREATE POLICY "Users can view their own skills"
  ON user_skills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills"
  ON user_skills FOR ALL
  USING (auth.uid() = user_id);

-- Skill exercises
CREATE POLICY "Users can manage their own skill exercises"
  ON skill_exercises FOR ALL
  USING (auth.uid() = user_id);

-- Achievements are public
CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  USING (TRUE);

-- User achievements
CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can grant achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (TRUE);

-- Teachers can view student skills
CREATE POLICY "Teachers can view student skills in their classes"
  ON user_skills FOR SELECT
  USING (
    user_id IN (
      SELECT cm.student_id FROM class_members cm
      JOIN classes c ON c.id = cm.class_id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- ============================================
-- SEED DATA: SKILLS
-- ============================================

-- Dissertation skills
INSERT INTO skills (id, exercise_type, name, description, order_index, icon, exercises_to_unlock, exercises_to_master) VALUES
('diss-1-analyse', 'Dissertation', 'Analyser le sujet', 'Identifier les mots-clés, les présupposés et les enjeux du sujet.', 1, 'search', 1, 3),
('diss-2-problematique', 'Dissertation', 'Formuler une problématique', 'Transformer le sujet en question qui guide la réflexion.', 2, 'help-circle', 1, 3),
('diss-3-plan-dialectique', 'Dissertation', 'Construire un plan dialectique', 'Maîtriser le plan Thèse / Antithèse / Synthèse.', 3, 'git-branch', 1, 4),
('diss-4-plan-thematique', 'Dissertation', 'Construire un plan thématique', 'Organiser la réflexion par aspects du sujet.', 4, 'layers', 1, 4),
('diss-5-introduction', 'Dissertation', 'Rédiger une introduction', 'Accroche, citation du sujet, problématique, annonce du plan.', 5, 'play', 1, 3),
('diss-6-argument', 'Dissertation', 'Développer un argument', 'Structurer idée + argument + exemple précis.', 6, 'message-square', 1, 5),
('diss-7-transition', 'Dissertation', 'Rédiger des transitions', 'Assurer la fluidité entre les parties.', 7, 'arrow-right', 1, 3),
('diss-8-conclusion', 'Dissertation', 'Rédiger une conclusion', 'Bilan synthétique, réponse et ouverture.', 8, 'flag', 1, 3)
ON CONFLICT (id) DO NOTHING;

-- Commentaire skills
INSERT INTO skills (id, exercise_type, name, description, order_index, icon, exercises_to_unlock, exercises_to_master) VALUES
('comm-1-genre', 'Commentaire', 'Identifier genre et registre', 'Reconnaître le type de texte et son ton dominant.', 1, 'book-open', 1, 3),
('comm-2-procedes', 'Commentaire', 'Repérer les procédés stylistiques', 'Identifier figures de style, rythme, sonorités.', 2, 'eye', 1, 5),
('comm-3-champ-lexical', 'Commentaire', 'Analyser un champ lexical', 'Repérer et interpréter les réseaux de sens.', 3, 'tag', 1, 3),
('comm-4-projet', 'Commentaire', 'Formuler un projet de lecture', 'Définir l''intérêt singulier du texte.', 4, 'compass', 1, 3),
('comm-5-axes', 'Commentaire', 'Construire des axes d''analyse', 'Organiser le commentaire en 2-3 parties cohérentes.', 5, 'layout', 1, 4),
('comm-6-cii', 'Commentaire', 'Maîtriser la méthode CII', 'Citation, Identification du procédé, Interprétation.', 6, 'check-square', 1, 5),
('comm-7-intro', 'Commentaire', 'Rédiger une introduction', 'Amorce, présentation, projet de lecture, plan.', 7, 'play', 1, 3),
('comm-8-conclusion', 'Commentaire', 'Rédiger une conclusion', 'Synthèse des axes et ouverture pertinente.', 8, 'flag', 1, 3)
ON CONFLICT (id) DO NOTHING;

-- Oral skills
INSERT INTO skills (id, exercise_type, name, description, order_index, icon, exercises_to_unlock, exercises_to_master) VALUES
('oral-1-lecture', 'Oral', 'Lecture expressive', 'Lire avec clarté, rythme et expressivité.', 1, 'volume-2', 1, 5),
('oral-2-situer', 'Oral', 'Situer l''extrait', 'Contextualiser le passage dans l''œuvre.', 2, 'map-pin', 1, 3),
('oral-3-lineaire', 'Oral', 'Analyse linéaire structurée', 'Suivre le mouvement du texte avec rigueur.', 3, 'align-left', 1, 5),
('oral-4-grammaire', 'Oral', 'Question de grammaire', 'Répondre précisément aux questions syntaxiques.', 4, 'code', 1, 4),
('oral-5-oeuvre', 'Oral', 'Présenter l''œuvre choisie', 'Exposer son choix avec passion et pertinence.', 5, 'heart', 1, 3),
('oral-6-entretien', 'Oral', 'Maîtriser l''entretien', 'Répondre avec aisance aux questions du jury.', 6, 'users', 1, 4)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEED DATA: ACHIEVEMENTS
-- ============================================

INSERT INTO achievements (id, name, description, icon, category, conditions) VALUES
-- Methodology achievements
('first-dissertation', 'Première dissertation', 'Compléter votre premier exercice de dissertation.', '📝', 'methodology', '{"type": "exercise_count", "exercise_type": "Dissertation", "count": 1}'),
('first-commentaire', 'Premier commentaire', 'Compléter votre premier exercice de commentaire.', '📖', 'methodology', '{"type": "exercise_count", "exercise_type": "Commentaire", "count": 1}'),
('first-oral', 'Premier oral', 'Compléter votre premier exercice d''oral.', '🎤', 'methodology', '{"type": "exercise_count", "exercise_type": "Oral", "count": 1}'),

-- Practice achievements
('practice-10', 'Entraînement régulier', 'Compléter 10 exercices au total.', '💪', 'practice', '{"type": "total_exercises", "count": 10}'),
('practice-25', 'Travailleur acharné', 'Compléter 25 exercices au total.', '🔥', 'practice', '{"type": "total_exercises", "count": 25}'),
('practice-50', 'Expert en herbe', 'Compléter 50 exercices au total.', '⭐', 'practice', '{"type": "total_exercises", "count": 50}'),

-- Mastery achievements
('master-dissertation', 'Maître dissertateur', 'Maîtriser toutes les compétences de dissertation.', '🎓', 'mastery', '{"type": "all_skills_mastered", "exercise_type": "Dissertation"}'),
('master-commentaire', 'Maître commentateur', 'Maîtriser toutes les compétences de commentaire.', '📚', 'mastery', '{"type": "all_skills_mastered", "exercise_type": "Commentaire"}'),
('master-oral', 'Maître orateur', 'Maîtriser toutes les compétences de l''oral.', '🎙️', 'mastery', '{"type": "all_skills_mastered", "exercise_type": "Oral"}'),
('master-all', 'Excellence complète', 'Maîtriser toutes les compétences des 3 épreuves.', '👑', 'mastery', '{"type": "all_skills_mastered", "exercise_type": "all"}'),

-- Special achievements
('score-20', 'Note parfaite', 'Obtenir un 20/20 sur un exercice.', '🏆', 'special', '{"type": "score", "score": 20}'),
('streak-7', 'Semaine d''excellence', 'S''entraîner 7 jours consécutifs.', '📅', 'special', '{"type": "streak", "days": 7}'),
('all-works', 'Connaisseur du programme', 'Pratiquer sur les 12 œuvres du programme.', '📕', 'special', '{"type": "works_practiced", "count": 12}')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Initialize user skills when they first access progression
CREATE OR REPLACE FUNCTION initialize_user_skills(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Insert all skills for the user with 'locked' status
  -- First skill of each type is 'unlocked'
  INSERT INTO user_skills (user_id, skill_id, status, unlocked_at)
  SELECT
    p_user_id,
    s.id,
    CASE WHEN s.order_index = 1 THEN 'unlocked' ELSE 'locked' END,
    CASE WHEN s.order_index = 1 THEN NOW() ELSE NULL END
  FROM skills s
  ON CONFLICT (user_id, skill_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update skill progress after exercise completion
CREATE OR REPLACE FUNCTION update_skill_progress(
  p_user_id UUID,
  p_skill_id TEXT,
  p_score INTEGER
)
RETURNS VOID AS $$
DECLARE
  v_skill skills%ROWTYPE;
  v_user_skill user_skills%ROWTYPE;
  v_next_skill_id TEXT;
BEGIN
  -- Get skill info
  SELECT * INTO v_skill FROM skills WHERE id = p_skill_id;

  -- Get or create user skill
  SELECT * INTO v_user_skill FROM user_skills
  WHERE user_id = p_user_id AND skill_id = p_skill_id;

  IF NOT FOUND THEN
    INSERT INTO user_skills (user_id, skill_id, status, unlocked_at)
    VALUES (p_user_id, p_skill_id, 'in_progress', NOW())
    RETURNING * INTO v_user_skill;
  END IF;

  -- Update progress
  UPDATE user_skills SET
    exercises_completed = exercises_completed + 1,
    best_score = GREATEST(COALESCE(best_score, 0), p_score),
    average_score = (COALESCE(average_score, 0) * exercises_completed + p_score) / (exercises_completed + 1),
    status = CASE
      WHEN exercises_completed + 1 >= v_skill.exercises_to_master THEN 'mastered'
      ELSE 'in_progress'
    END,
    mastered_at = CASE
      WHEN exercises_completed + 1 >= v_skill.exercises_to_master AND mastered_at IS NULL THEN NOW()
      ELSE mastered_at
    END,
    last_practice = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id AND skill_id = p_skill_id;

  -- Unlock next skill if this one is mastered
  IF v_user_skill.exercises_completed + 1 >= v_skill.exercises_to_master THEN
    SELECT id INTO v_next_skill_id FROM skills
    WHERE exercise_type = v_skill.exercise_type
    AND order_index = v_skill.order_index + 1;

    IF v_next_skill_id IS NOT NULL THEN
      UPDATE user_skills SET
        status = 'unlocked',
        unlocked_at = NOW()
      WHERE user_id = p_user_id
      AND skill_id = v_next_skill_id
      AND status = 'locked';
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updated_at
CREATE TRIGGER update_user_skills_updated_at
  BEFORE UPDATE ON user_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
