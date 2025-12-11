import { supabase } from '../lib/supabase';
import { ExerciseType } from '../types';

// ============================================
// TYPES
// ============================================

export interface Skill {
  id: string;
  exercise_type: ExerciseType;
  name: string;
  description: string;
  order_index: number;
  icon: string;
  exercises_to_unlock: number;
  exercises_to_master: number;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  exercises_completed: number;
  best_score: number | null;
  average_score: number | null;
  status: 'locked' | 'unlocked' | 'in_progress' | 'mastered';
  unlocked_at: string | null;
  mastered_at: string | null;
  last_practice: string | null;
  skill?: Skill;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'methodology' | 'practice' | 'mastery' | 'special';
  conditions: Record<string, unknown>;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export interface SkillExercise {
  id: string;
  user_id: string;
  skill_id: string;
  prompt: string;
  student_answer: string | null;
  ai_feedback: string | null;
  score: number | null;
  started_at: string;
  completed_at: string | null;
}

export interface ProgressionStats {
  totalSkills: number;
  masteredSkills: number;
  inProgressSkills: number;
  unlockedSkills: number;
  overallProgress: number; // 0-100
  byType: {
    [key in ExerciseType]: {
      total: number;
      mastered: number;
      progress: number;
    };
  };
}

// ============================================
// SKILLS
// ============================================

export async function getAllSkills(): Promise<Skill[]> {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('exercise_type')
    .order('order_index');

  if (error) {
    console.error('Error fetching skills:', error);
    return [];
  }

  return data || [];
}

export async function getSkillsByType(exerciseType: ExerciseType): Promise<Skill[]> {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('exercise_type', exerciseType)
    .order('order_index');

  if (error) {
    console.error('Error fetching skills by type:', error);
    return [];
  }

  return data || [];
}

// ============================================
// USER SKILLS (Progression)
// ============================================

export async function initializeUserSkills(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.rpc('initialize_user_skills', {
    p_user_id: user.id,
  });

  if (error) {
    console.error('Error initializing user skills:', error);
  }
}

export async function getUserSkills(): Promise<UserSkill[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Initialize skills if not done yet
  await initializeUserSkills();

  const { data, error } = await supabase
    .from('user_skills')
    .select(`
      *,
      skill:skills(*)
    `)
    .eq('user_id', user.id)
    .order('skill(exercise_type)')
    .order('skill(order_index)');

  if (error) {
    console.error('Error fetching user skills:', error);
    return [];
  }

  return data || [];
}

export async function getUserSkillsByType(exerciseType: ExerciseType): Promise<UserSkill[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  await initializeUserSkills();

  const { data, error } = await supabase
    .from('user_skills')
    .select(`
      *,
      skill:skills!inner(*)
    `)
    .eq('user_id', user.id)
    .eq('skill.exercise_type', exerciseType)
    .order('skill(order_index)');

  if (error) {
    console.error('Error fetching user skills by type:', error);
    return [];
  }

  return data || [];
}

export async function getProgressionStats(): Promise<ProgressionStats> {
  const userSkills = await getUserSkills();

  const stats: ProgressionStats = {
    totalSkills: userSkills.length,
    masteredSkills: 0,
    inProgressSkills: 0,
    unlockedSkills: 0,
    overallProgress: 0,
    byType: {
      [ExerciseType.DISSERTATION]: { total: 0, mastered: 0, progress: 0 },
      [ExerciseType.COMMENTAIRE]: { total: 0, mastered: 0, progress: 0 },
      [ExerciseType.ORAL]: { total: 0, mastered: 0, progress: 0 },
    },
  };

  userSkills.forEach((us) => {
    const type = us.skill?.exercise_type as ExerciseType;
    if (!type) return;

    stats.byType[type].total++;

    if (us.status === 'mastered') {
      stats.masteredSkills++;
      stats.byType[type].mastered++;
    } else if (us.status === 'in_progress') {
      stats.inProgressSkills++;
    } else if (us.status === 'unlocked') {
      stats.unlockedSkills++;
    }
  });

  // Calculate percentages
  if (stats.totalSkills > 0) {
    stats.overallProgress = Math.round((stats.masteredSkills / stats.totalSkills) * 100);
  }

  Object.keys(stats.byType).forEach((type) => {
    const t = type as ExerciseType;
    if (stats.byType[t].total > 0) {
      stats.byType[t].progress = Math.round(
        (stats.byType[t].mastered / stats.byType[t].total) * 100
      );
    }
  });

  return stats;
}

// ============================================
// SKILL EXERCISES
// ============================================

export async function createSkillExercise(
  skillId: string,
  prompt: string
): Promise<SkillExercise | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('skill_exercises')
    .insert({
      user_id: user.id,
      skill_id: skillId,
      prompt,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating skill exercise:', error);
    return null;
  }

  return data;
}

export async function completeSkillExercise(
  exerciseId: string,
  studentAnswer: string,
  aiFeedback: string,
  score: number
): Promise<SkillExercise | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Update the exercise
  const { data: exercise, error: exerciseError } = await supabase
    .from('skill_exercises')
    .update({
      student_answer: studentAnswer,
      ai_feedback: aiFeedback,
      score,
      completed_at: new Date().toISOString(),
    })
    .eq('id', exerciseId)
    .select()
    .single();

  if (exerciseError) {
    console.error('Error completing skill exercise:', exerciseError);
    return null;
  }

  // Update skill progress
  const { error: progressError } = await supabase.rpc('update_skill_progress', {
    p_user_id: user.id,
    p_skill_id: exercise.skill_id,
    p_score: score,
  });

  if (progressError) {
    console.error('Error updating skill progress:', progressError);
  }

  return exercise;
}

export async function getSkillExercises(skillId: string): Promise<SkillExercise[]> {
  const { data, error } = await supabase
    .from('skill_exercises')
    .select('*')
    .eq('skill_id', skillId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching skill exercises:', error);
    return [];
  }

  return data || [];
}

// ============================================
// ACHIEVEMENTS
// ============================================

export async function getAllAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('category');

  if (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }

  return data || [];
}

export async function getUserAchievements(): Promise<UserAchievement[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', user.id)
    .order('unlocked_at', { ascending: false });

  if (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }

  return data || [];
}

export async function checkAndGrantAchievements(): Promise<UserAchievement[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get all achievements and user's current achievements
  const [allAchievements, userAchievements, userSkills] = await Promise.all([
    getAllAchievements(),
    getUserAchievements(),
    getUserSkills(),
  ]);

  // Get exercise stats
  const { data: exercises } = await supabase
    .from('exercises')
    .select('exercise_type, score, work_title')
    .eq('user_id', user.id);

  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievement_id));
  const newAchievements: UserAchievement[] = [];

  for (const achievement of allAchievements) {
    if (unlockedIds.has(achievement.id)) continue;

    const conditions = achievement.conditions as Record<string, unknown>;
    let shouldUnlock = false;

    switch (conditions.type) {
      case 'exercise_count': {
        const count = exercises?.filter(
          (e) => e.exercise_type === conditions.exercise_type
        ).length || 0;
        shouldUnlock = count >= (conditions.count as number);
        break;
      }
      case 'total_exercises': {
        shouldUnlock = (exercises?.length || 0) >= (conditions.count as number);
        break;
      }
      case 'all_skills_mastered': {
        if (conditions.exercise_type === 'all') {
          shouldUnlock = userSkills.every((us) => us.status === 'mastered');
        } else {
          shouldUnlock = userSkills
            .filter((us) => us.skill?.exercise_type === conditions.exercise_type)
            .every((us) => us.status === 'mastered');
        }
        break;
      }
      case 'score': {
        shouldUnlock = exercises?.some((e) => e.score === conditions.score) || false;
        break;
      }
      case 'works_practiced': {
        const uniqueWorks = new Set(exercises?.map((e) => e.work_title).filter(Boolean));
        shouldUnlock = uniqueWorks.size >= (conditions.count as number);
        break;
      }
    }

    if (shouldUnlock) {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievement.id,
        })
        .select(`*, achievement:achievements(*)`)
        .single();

      if (!error && data) {
        newAchievements.push(data);
      }
    }
  }

  return newAchievements;
}

// ============================================
// RECOMMENDATIONS
// ============================================

export interface Recommendation {
  skillId: string;
  skill: Skill;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export async function getRecommendations(): Promise<Recommendation[]> {
  const userSkills = await getUserSkills();
  const recommendations: Recommendation[] = [];

  // Group by exercise type
  const byType: Record<string, UserSkill[]> = {};
  userSkills.forEach((us) => {
    const type = us.skill?.exercise_type || '';
    if (!byType[type]) byType[type] = [];
    byType[type].push(us);
  });

  Object.entries(byType).forEach(([type, skills]) => {
    // Sort by order_index
    skills.sort((a, b) => (a.skill?.order_index || 0) - (b.skill?.order_index || 0));

    // Find first unlocked or in_progress skill
    const currentSkill = skills.find(
      (s) => s.status === 'unlocked' || s.status === 'in_progress'
    );

    if (currentSkill && currentSkill.skill) {
      const daysAgo = currentSkill.last_practice
        ? Math.floor((Date.now() - new Date(currentSkill.last_practice).getTime()) / 86400000)
        : 999;

      let priority: 'high' | 'medium' | 'low' = 'medium';
      let reason = '';

      if (currentSkill.status === 'unlocked' && currentSkill.exercises_completed === 0) {
        priority = 'high';
        reason = `Nouvelle compétence débloquée ! Commencez à vous entraîner.`;
      } else if (daysAgo > 7) {
        priority = 'high';
        reason = `Pas pratiqué depuis ${daysAgo} jours. Révisez pour ne pas oublier !`;
      } else if (currentSkill.status === 'in_progress') {
        const remaining = (currentSkill.skill.exercises_to_master || 3) - currentSkill.exercises_completed;
        priority = 'medium';
        reason = `Plus que ${remaining} exercice(s) pour maîtriser cette compétence.`;
      }

      recommendations.push({
        skillId: currentSkill.skill_id,
        skill: currentSkill.skill,
        reason,
        priority,
      });
    }
  });

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}
