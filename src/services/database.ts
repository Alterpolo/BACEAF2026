import { supabase } from '../lib/supabase';
import { ExerciseType, Work } from '../types';

// ============================================
// TYPES
// ============================================

export interface Exercise {
  id: string;
  user_id: string;
  exercise_type: ExerciseType;
  work_title: string | null;
  work_author: string | null;
  work_parcours: string | null;
  subject: string;
  student_answer: string | null;
  ai_feedback: string | null;
  score: number | null;
  created_at: string;
  updated_at: string;
}

export interface Progress {
  id: string;
  user_id: string;
  work_title: string;
  work_author: string;
  exercises_completed: number;
  average_score: number | null;
  last_activity: string;
}

export interface Note {
  id: string;
  user_id: string;
  work_title: string;
  work_author: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// EXERCISES
// ============================================

export async function saveExercise(params: {
  exerciseType: ExerciseType;
  work?: Work;
  subject: string;
  studentAnswer?: string;
  aiFeedback?: string;
  score?: number;
}): Promise<Exercise | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('exercises')
    .insert({
      user_id: user.id,
      exercise_type: params.exerciseType,
      work_title: params.work?.title || null,
      work_author: params.work?.author || null,
      work_parcours: params.work?.parcours || null,
      subject: params.subject,
      student_answer: params.studentAnswer || null,
      ai_feedback: params.aiFeedback || null,
      score: params.score || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving exercise:', error);
    return null;
  }

  return data;
}

export async function updateExercise(
  exerciseId: string,
  updates: {
    studentAnswer?: string;
    aiFeedback?: string;
    score?: number;
  }
): Promise<Exercise | null> {
  const { data, error } = await supabase
    .from('exercises')
    .update({
      student_answer: updates.studentAnswer,
      ai_feedback: updates.aiFeedback,
      score: updates.score,
    })
    .eq('id', exerciseId)
    .select()
    .single();

  if (error) {
    console.error('Error updating exercise:', error);
    return null;
  }

  return data;
}

export async function getExercises(limit = 20, offset = 0): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching exercises:', error);
    return [];
  }

  return data || [];
}

export async function getExercisesByWork(workTitle: string): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('work_title', workTitle)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching exercises by work:', error);
    return [];
  }

  return data || [];
}

// ============================================
// PROGRESS
// ============================================

export async function getProgress(): Promise<Progress[]> {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .order('last_activity', { ascending: false });

  if (error) {
    console.error('Error fetching progress:', error);
    return [];
  }

  return data || [];
}

export async function getProgressByWork(workTitle: string): Promise<Progress | null> {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('work_title', workTitle)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching progress by work:', error);
  }

  return data || null;
}

// ============================================
// NOTES
// ============================================

export async function saveNote(work: Work, content: string): Promise<Note | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Upsert: update if exists, insert if not
  const { data, error } = await supabase
    .from('notes')
    .upsert({
      user_id: user.id,
      work_title: work.title,
      work_author: work.author,
      content,
    }, {
      onConflict: 'user_id,work_title',
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving note:', error);
    return null;
  }

  return data;
}

export async function getNote(workTitle: string): Promise<Note | null> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('work_title', workTitle)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching note:', error);
  }

  return data || null;
}

export async function getAllNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    return [];
  }

  return data || [];
}

export async function deleteNote(noteId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);

  if (error) {
    console.error('Error deleting note:', error);
    return false;
  }

  return true;
}

// ============================================
// STATS
// ============================================

export async function getStats(): Promise<{
  totalExercises: number;
  averageScore: number | null;
  exercisesByType: Record<string, number>;
  recentActivity: Exercise[];
}> {
  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !exercises) {
    return {
      totalExercises: 0,
      averageScore: null,
      exercisesByType: {},
      recentActivity: [],
    };
  }

  const scores = exercises.filter(e => e.score !== null).map(e => e.score as number);
  const averageScore = scores.length > 0
    ? scores.reduce((a, b) => a + b, 0) / scores.length
    : null;

  const exercisesByType = exercises.reduce((acc, e) => {
    acc[e.exercise_type] = (acc[e.exercise_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalExercises: exercises.length,
    averageScore,
    exercisesByType,
    recentActivity: exercises.slice(0, 5),
  };
}
