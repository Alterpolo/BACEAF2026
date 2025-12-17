/**
 * AI API Service
 * Calls to the AI backend for exercise generation and evaluation
 */

import { ExerciseType, Work, WorkAnalysis } from '../types';
import { post } from './apiClient';

/**
 * Generate a single subject for an exercise type
 */
export async function generateSubject(type: ExerciseType, work?: Work): Promise<string> {
  const result = await post<{ subject: string }>('/api/ai/generate-subject', { type, work });
  return result.subject;
}

/**
 * Generate a list of 3 subjects for a work
 */
export async function generateSubjectList(
  work: Work,
  type: ExerciseType = ExerciseType.DISSERTATION
): Promise<string[]> {
  const result = await post<{ subjects: string[] }>('/api/ai/generate-subject-list', { work, type });
  return result.subjects;
}

/**
 * Evaluate student work and provide feedback
 */
export async function evaluateStudentWork(
  type: ExerciseType,
  subject: string,
  studentInput: string
): Promise<string> {
  const result = await post<{ feedback: string }>('/api/ai/evaluate', { type, subject, studentInput });
  return result.feedback;
}

/**
 * Generate a study guide for a work
 */
export async function generateWorkAnalysis(work: Work): Promise<WorkAnalysis> {
  const result = await post<{ analysis: WorkAnalysis }>('/api/ai/work-analysis', { work });
  return result.analysis;
}
