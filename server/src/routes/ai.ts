/**
 * AI Routes
 * Endpoints for AI-powered exercise generation and evaluation
 *
 * Security:
 * - All routes require authentication (JWT)
 * - Subscription is loaded to check exercise limits
 * - Free users: limited to 3 exercises/week
 * - Premium users: unlimited access
 */

import { Hono, Context } from "hono";
import { z } from "zod";
import {
  requireAuth,
  loadSubscription,
  checkExerciseLimit,
  incrementExerciseCount,
  SubscriptionInfo,
} from "../middleware/subscription";

// Work type matching the deepseek service
interface Work {
  author: string;
  title: string;
  parcours: string;
}

// Type for context with our custom variables
type Variables = {
  userId: string;
  subscription: SubscriptionInfo;
};

// Use mock if DEEPSEEK_API_KEY is not defined
const useMock = !process.env.DEEPSEEK_API_KEY;
const serviceModule = useMock
  ? await import("../services/deepseek-mock")
  : await import("../services/deepseek");

const {
  generateSubject,
  generateSubjectList,
  evaluateStudentWork,
  generateWorkAnalysis,
} = serviceModule;

if (useMock) {
  console.log("🎭 Mode DEMO: Utilisation du mock DeepSeek (pas de clé API)");
}

export const aiRoutes = new Hono<{ Variables: Variables }>();

// ============================================
// VALIDATION SCHEMAS
// ============================================

const WorkSchema = z.object({
  author: z.string().min(1),
  title: z.string().min(1),
  parcours: z.string().min(1),
});

const ExerciseTypeSchema = z.enum(["Dissertation", "Commentaire", "Oral"]);

const GenerateSubjectSchema = z.object({
  type: ExerciseTypeSchema,
  work: WorkSchema.optional(),
});

const GenerateSubjectListSchema = z.object({
  work: WorkSchema,
  type: ExerciseTypeSchema.optional().default("Dissertation"),
});

const EvaluateSchema = z.object({
  type: ExerciseTypeSchema,
  subject: z.string().min(1),
  studentInput: z
    .string()
    .min(10, "Le travail doit contenir au moins 10 caractères"),
});

const WorkAnalysisSchema = z.object({
  work: WorkSchema,
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function parseBody<T>(c: any, schema: z.ZodSchema<T>): Promise<T | null> {
  try {
    const body = await c.req.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return null;
    }
    throw error;
  }
}

// ============================================
// MIDDLEWARE CHAIN
// All AI routes require: auth → subscription → exercise limit check
// ============================================

aiRoutes.use("*", requireAuth, loadSubscription);

// ============================================
// ROUTES
// ============================================

/**
 * POST /api/ai/generate-subject
 * Generate a single exercise subject
 * Counts toward exercise limit for free users
 */
aiRoutes.post("/generate-subject", checkExerciseLimit, async (c) => {
  const data = await parseBody(c, GenerateSubjectSchema);
  if (!data) {
    return c.json({ error: "Données invalides", code: "INVALID_DATA" }, 400);
  }

  const userId = c.get("userId") as string;
  const subscription = c.get("subscription") as SubscriptionInfo;

  try {
    const result = await generateSubject(data.type, data.work as Work | undefined);

    // Increment exercise count for free users
    if (subscription.exercisesLimit !== -1) {
      await incrementExerciseCount(userId);
    }

    return c.json({
      subject: result,
      exercisesRemaining:
        subscription.exercisesLimit === -1
          ? "unlimited"
          : subscription.exercisesLimit - subscription.exercisesThisWeek - 1,
    });
  } catch (error) {
    console.error("Error generating subject:", error);
    return c.json(
      { error: "Erreur lors de la génération du sujet", code: "AI_ERROR" },
      500
    );
  }
});

/**
 * POST /api/ai/generate-subject-list
 * Generate a list of 3 subjects for a work
 * Counts as 1 exercise toward limit
 */
aiRoutes.post("/generate-subject-list", checkExerciseLimit, async (c) => {
  const data = await parseBody(c, GenerateSubjectListSchema);
  if (!data) {
    return c.json({ error: "Données invalides", code: "INVALID_DATA" }, 400);
  }

  const userId = c.get("userId") as string;
  const subscription = c.get("subscription") as SubscriptionInfo;

  try {
    const result = await generateSubjectList(data.work as Work, data.type);

    // Increment exercise count for free users
    if (subscription.exercisesLimit !== -1) {
      await incrementExerciseCount(userId);
    }

    return c.json({
      subjects: result,
      exercisesRemaining:
        subscription.exercisesLimit === -1
          ? "unlimited"
          : subscription.exercisesLimit - subscription.exercisesThisWeek - 1,
    });
  } catch (error) {
    console.error("Error generating subject list:", error);
    return c.json(
      { error: "Erreur lors de la génération de la liste", code: "AI_ERROR" },
      500
    );
  }
});

/**
 * POST /api/ai/evaluate
 * Evaluate student work and provide feedback
 * Counts toward exercise limit for free users
 */
aiRoutes.post("/evaluate", checkExerciseLimit, async (c) => {
  const data = await parseBody(c, EvaluateSchema);
  if (!data) {
    return c.json({ error: "Données invalides", code: "INVALID_DATA" }, 400);
  }

  const userId = c.get("userId") as string;
  const subscription = c.get("subscription") as SubscriptionInfo;

  try {
    const result = await evaluateStudentWork(
      data.type,
      data.subject,
      data.studentInput
    );

    // Increment exercise count for free users
    if (subscription.exercisesLimit !== -1) {
      await incrementExerciseCount(userId);
    }

    return c.json({
      feedback: result,
      exercisesRemaining:
        subscription.exercisesLimit === -1
          ? "unlimited"
          : subscription.exercisesLimit - subscription.exercisesThisWeek - 1,
    });
  } catch (error) {
    console.error("Error evaluating work:", error);
    return c.json(
      { error: "Erreur lors de l'évaluation", code: "AI_ERROR" },
      500
    );
  }
});

/**
 * POST /api/ai/work-analysis
 * Generate a study guide for a work
 * Does NOT count toward exercise limit (informational only)
 */
aiRoutes.post("/work-analysis", async (c) => {
  const data = await parseBody(c, WorkAnalysisSchema);
  if (!data) {
    return c.json({ error: "Données invalides", code: "INVALID_DATA" }, 400);
  }

  try {
    const result = await generateWorkAnalysis(data.work as Work);
    return c.json({ analysis: result });
  } catch (error) {
    console.error("Error generating work analysis:", error);
    return c.json(
      { error: "Erreur lors de la génération de l'analyse", code: "AI_ERROR" },
      500
    );
  }
});
