/**
 * n8n Exercises Service
 * Browser-to-n8n integration for teacher exercise creation and batch generation
 *
 * Architecture: Browser → n8n webhook → DeepSeek API → response
 *
 * Usage:
 * 1. Create webhook workflows in n8n (see comments below for expected endpoints)
 * 2. Call these functions from TeacherDashboard or admin tools
 */

const N8N_BASE_URL = import.meta.env.VITE_N8N_URL || 'https://n8n.srv831064.hstgr.cloud';

// ============================================
// TYPES
// ============================================

export interface Work {
  author: string;
  title: string;
  parcours: string;
}

export type ExerciseType = 'Dissertation' | 'Commentaire' | 'Oral';

export interface GenerateExerciseParams {
  type: ExerciseType;
  work: Work;
  /** Optional: specific instructions for the AI */
  customPrompt?: string;
}

export interface BatchGenerateParams {
  works: Work[];
  type: ExerciseType;
  /** Number of exercises per work (default: 3) */
  exercisesPerWork?: number;
}

export interface GeneratedExercise {
  work: Work;
  type: ExerciseType;
  subject: string;
  generatedAt: string;
}

export interface BatchResult {
  exercises: GeneratedExercise[];
  totalGenerated: number;
  errors?: { work: Work; error: string }[];
}

// ============================================
// n8n WEBHOOK ENDPOINTS
// Expected workflow structure in n8n:
//
// 1. Webhook node (POST) → receives JSON body
// 2. HTTP Request node → calls DeepSeek API
// 3. Respond to Webhook node → returns result
// ============================================

const ENDPOINTS = {
  /** Single exercise generation */
  generateExercise: '/webhook/generate-exercise',
  /** Batch generation for multiple works */
  batchGenerate: '/webhook/batch-generate',
  /** Generate study guide/analysis */
  generateAnalysis: '/webhook/generate-analysis',
} as const;

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Generate a single exercise via n8n
 *
 * n8n workflow should:
 * 1. Receive: { type, work, customPrompt? }
 * 2. Call DeepSeek with appropriate prompt
 * 3. Return: { subject: string }
 */
export async function generateExercise(params: GenerateExerciseParams): Promise<string> {
  const response = await fetch(`${N8N_BASE_URL}${ENDPOINTS.generateExercise}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`n8n error: ${error}`);
  }

  const data = await response.json();
  return data.subject;
}

/**
 * Generate multiple exercises in batch via n8n
 * Useful for creating weekly content or exercise banks
 *
 * n8n workflow should:
 * 1. Receive: { works, type, exercisesPerWork }
 * 2. Loop through works, call DeepSeek for each
 * 3. Return: { exercises: [...], totalGenerated, errors? }
 */
export async function batchGenerateExercises(params: BatchGenerateParams): Promise<BatchResult> {
  const response = await fetch(`${N8N_BASE_URL}${ENDPOINTS.batchGenerate}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...params,
      exercisesPerWork: params.exercisesPerWork ?? 3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`n8n batch error: ${error}`);
  }

  return response.json();
}

/**
 * Generate a study guide/analysis for a work via n8n
 *
 * n8n workflow should:
 * 1. Receive: { work }
 * 2. Call DeepSeek for biography, context, summary, characters
 * 3. Return: { analysis: WorkAnalysis }
 */
export async function generateWorkAnalysis(work: Work): Promise<{
  biography: string;
  context: string;
  summary: { partTitle: string; content: string }[];
  characters: { name: string; description: string }[];
}> {
  const response = await fetch(`${N8N_BASE_URL}${ENDPOINTS.generateAnalysis}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ work }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`n8n analysis error: ${error}`);
  }

  const data = await response.json();
  return data.analysis;
}

// ============================================
// HELPERS
// ============================================

/**
 * Check if n8n is reachable
 */
export async function checkN8nConnection(): Promise<boolean> {
  try {
    // n8n health check or simple webhook ping
    const response = await fetch(`${N8N_BASE_URL}/healthz`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get the configured n8n base URL
 */
export function getN8nUrl(): string {
  return N8N_BASE_URL;
}
