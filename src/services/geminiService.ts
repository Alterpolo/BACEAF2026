import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ExerciseType, Work, WorkAnalysis } from "../types";

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
    if (work) {
      prompt = `Choisis un extrait significatif (environ 20-25 lignes) tiré de l'œuvre "${work.title}" de ${work.author}. Génère le sujet complet du commentaire composé :
      1. Indique le titre du passage ou sa situation précise dans l'œuvre (ex: Acte I, Scène 2).
      2. Fournis le texte intégral du passage sélectionné.
      3. Ajoute la consigne standard du bac (Vous ferez le commentaire de cet extrait...).`;
    } else {
      prompt = `Propose un texte littéraire classique (domaine public, XIXe ou XXe siècle) d'environ 15-20 lignes pour un exercice de commentaire de texte hors programme. Indique l'auteur, le titre et la date. Ne donne pas encore la correction.`;
    }
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

export const generateSubjectList = async (work: Work, type: ExerciseType = ExerciseType.DISSERTATION): Promise<string[]> => {
  if (!apiKey) throw new Error("API Key manquante");

  let prompt = "";
  
  if (type === ExerciseType.COMMENTAIRE) {
    prompt = `Sélectionne 3 extraits clés et distincts de l'œuvre "${work.title}" de ${work.author} propices à un commentaire littéraire. 
    Retourne une liste JSON de 3 chaînes de caractères.
    Chaque chaîne doit contenir impérativement :
    1. Un titre court situant le passage (ex: Chapitre 3 - La rencontre).
    2. Un saut de ligne.
    3. Le texte intégral de l'extrait (environ 15-20 lignes).
    Ne mets pas de texte d'introduction, juste le tableau JSON.`;
  } else {
    prompt = `Génère 3 sujets de dissertation distincts (type bac) sur l'œuvre "${work.title}" de ${work.author} (Parcours: "${work.parcours}"). Retourne uniquement les sujets dans une liste JSON.`;
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error(error);
    throw new Error("Impossible de générer la liste de sujets.");
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
        temperature: 0.5,
      }
    });
    return response.text || "Erreur lors de l'évaluation.";
  } catch (error) {
    console.error(error);
    throw new Error("Impossible d'obtenir la correction.");
  }
};

export const generateWorkAnalysis = async (work: Work): Promise<WorkAnalysis> => {
  if (!apiKey) throw new Error("API Key manquante");

  const prompt = `Réalise une fiche de révision complète pour l'œuvre "${work.title}" de ${work.author}.
  Le format de réponse doit être strictement du JSON suivant la structure demandée.
  
  Détails attendus :
  1. Biographie : Courte biographie de l'auteur (dates, mouvement, style).
  2. Contexte : Contexte historique et littéraire de l'œuvre.
  3. Résumé : Un résumé détaillé, découpé partie par partie, acte par acte, ou chapitre par chapitre (selon la nature de l'œuvre). Il faut au moins 4 ou 5 parties significatives.
  4. Personnages : Liste des personnages principaux avec une courte description. Pour la poésie ou les essais sans personnages, liste les thèmes clés ou les figures d'énonciation.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4, // Lower temperature for factual accuracy
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            biography: { type: Type.STRING },
            context: { type: Type.STRING },
            summary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  partTitle: { type: Type.STRING, description: "Titre du chapitre, de l'acte ou de la partie" },
                  content: { type: Type.STRING, description: "Résumé de cette partie" }
                },
                required: ["partTitle", "content"]
              }
            },
            characters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Nom du personnage ou du thème" },
                  description: { type: Type.STRING }
                },
                required: ["name", "description"]
              }
            }
          },
          required: ["biography", "context", "summary", "characters"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as WorkAnalysis;
    }
    throw new Error("Réponse vide");
  } catch (error) {
    console.error(error);
    throw new Error("Impossible de générer la fiche de révision.");
  }
};