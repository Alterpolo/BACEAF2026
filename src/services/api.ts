import { ExerciseType, Work, WorkAnalysis } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function apiRequest<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erreur réseau' }));
    throw new Error(error.error || `Erreur HTTP ${response.status}`);
  }

  return response.json();
}

export const generateSubject = async (type: ExerciseType, work?: Work): Promise<string> => {
  const result = await apiRequest<{ subject: string }>('/api/ai/generate-subject', {
    type,
    work,
  });
  return result.subject;
};

export const generateSubjectList = async (
  work: Work,
  type: ExerciseType = ExerciseType.DISSERTATION
): Promise<string[]> => {
  const result = await apiRequest<{ subjects: string[] }>('/api/ai/generate-subject-list', {
    work,
    type,
  });
  return result.subjects;
};

export const evaluateStudentWork = async (
  type: ExerciseType,
  subject: string,
  studentInput: string
): Promise<string> => {
  const result = await apiRequest<{ feedback: string }>('/api/ai/evaluate', {
    type,
    subject,
    studentInput,
  });
  return result.feedback;
};

export const generateWorkAnalysis = async (work: Work): Promise<WorkAnalysis> => {
  const result = await apiRequest<{ analysis: WorkAnalysis }>('/api/ai/work-analysis', {
    work,
  });
  return result.analysis;
};
