import { Hono } from "hono";
import { z } from "zod";
import {
  generateSubject,
  generateSubjectList,
  evaluateStudentWork,
  generateWorkAnalysis,
  ExerciseType,
  Work,
} from "../services/deepseek";

export const aiRoutes = new Hono();

// Schémas de validation
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

// Helper pour valider et parser le body
async function parseBody<T>(c: any, schema: z.ZodSchema<T>): Promise<T | null> {
  try {
    const body = await c.req.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      c.status(400);
      return null;
    }
    throw error;
  }
}

// POST /api/ai/generate-subject
aiRoutes.post("/generate-subject", async (c) => {
  const data = await parseBody(c, GenerateSubjectSchema);
  if (!data) {
    return c.json({ error: "Données invalides" }, 400);
  }

  try {
    const result = await generateSubject(data.type, data.work);
    return c.json({ subject: result });
  } catch (error) {
    console.error("Error generating subject:", error);
    return c.json({ error: "Erreur lors de la génération du sujet" }, 500);
  }
});

// POST /api/ai/generate-subject-list
aiRoutes.post("/generate-subject-list", async (c) => {
  const data = await parseBody(c, GenerateSubjectListSchema);
  if (!data) {
    return c.json({ error: "Données invalides" }, 400);
  }

  try {
    const result = await generateSubjectList(data.work, data.type);
    return c.json({ subjects: result });
  } catch (error) {
    console.error("Error generating subject list:", error);
    return c.json({ error: "Erreur lors de la génération de la liste" }, 500);
  }
});

// POST /api/ai/evaluate
aiRoutes.post("/evaluate", async (c) => {
  const data = await parseBody(c, EvaluateSchema);
  if (!data) {
    return c.json({ error: "Données invalides" }, 400);
  }

  try {
    const result = await evaluateStudentWork(
      data.type,
      data.subject,
      data.studentInput,
    );
    return c.json({ feedback: result });
  } catch (error) {
    console.error("Error evaluating work:", error);
    return c.json({ error: "Erreur lors de l'évaluation" }, 500);
  }
});

// POST /api/ai/work-analysis
aiRoutes.post("/work-analysis", async (c) => {
  const data = await parseBody(c, WorkAnalysisSchema);
  if (!data) {
    return c.json({ error: "Données invalides" }, 400);
  }

  try {
    const result = await generateWorkAnalysis(data.work);
    return c.json({ analysis: result });
  } catch (error) {
    console.error("Error generating work analysis:", error);
    return c.json({ error: "Erreur lors de la génération de l'analyse" }, 500);
  }
});
