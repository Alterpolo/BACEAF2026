import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ExerciseType, Work } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize client properly
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash';

const SYSTEM_INSTRUCTION = `
Tu es un professeur de français expert, correcteur au baccalauréat. 
Ton ton est pédagogique, encourageant mais exigeant (niveau "Excellence").
Tu aides les élèves de Première pour l'Épreuve Anticipée de Français (EAF).
Tu connais parfaitement le programme 2026 et les méthodologies de la dissertation et du commentaire.
`;

export const generateSubject = async (type: ExerciseType, work?: Work): Promise<string> => {
  if (!apiKey) throw new Error("API Key manquante");

  let prompt = "";

  if (type === ExerciseType.DISSERTATION && work) {
    prompt = `Génère un sujet de dissertation type bac sur l'œuvre "${work.title}" de ${work.author} dans le cadre du parcours "${work.parcours}". Le sujet doit être une question ou une citation à discuter.`;
  } else if (type === ExerciseType.COMMENTAIRE) {
    prompt = `Propose un texte littéraire classique (domaine public, XIXe ou XXe siècle) d'environ 15-20 lignes pour un exercice de commentaire de texte. Indique l'auteur, le titre et la date. Ne donne pas encore la correction.`;
  } else if (type === ExerciseType.ORAL && work) {
    prompt = `Pose une question de grammaire ou une question d'interprétation ponctuelle sur un passage clé de "${work.title}" pour préparer l'entretien de l'oral.`;
  } else {
    return "Erreur de configuration de l'exercice.";
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });
    return response.text || "Erreur lors de la génération.";
  } catch (error) {
    console.error(error);
    throw new Error("Impossible de contacter Gemini.");
  }
};

export const evaluateStudentWork = async (
  type: ExerciseType,
  subject: string,
  studentInput: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key manquante");

  const prompt = `
  Exercice : ${type}
  Sujet / Texte : ${subject}
  
  Travail de l'élève (Plan, Problématique ou Réponse) :
  "${studentInput}"
  
  Consigne : Évalue ce travail selon les critères officiels du bac français.
  1. Points forts.
  2. Points à améliorer (méthodologie, pertinence).
  3. Donne une suggestion de correction ou d'amélioration concrète (ex: une meilleure problématique ou un axe plus pertinent).
  Sois bienveillant mais rigoureux.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5, // Lower temperature for more analytical feedback
      }
    });
    return response.text || "Erreur lors de l'évaluation.";
  } catch (error) {
    console.error(error);
    throw new Error("Impossible d'obtenir la correction.");
  }
};
