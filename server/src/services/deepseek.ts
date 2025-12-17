/**
 * DeepSeek API Service
 * Compatible avec l'API OpenAI - utilise deepseek-chat (DeepSeek-V3.2)
 * Doc: https://api-docs.deepseek.com/
 */

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const MODEL_NAME = 'deepseek-chat'; // DeepSeek-V3.2 non-thinking mode

const apiKey = process.env.DEEPSEEK_API_KEY || '';

if (!apiKey) {
  console.warn('DEEPSEEK_API_KEY is not set. AI features will not work.');
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000, // 1 second
  maxDelayMs: 30000, // 30 seconds
  retryableStatuses: [429, 500, 502, 503, 504],
};

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay with jitter
 */
function getBackoffDelay(attempt: number, baseDelay: number): number {
  // Exponential backoff: delay = baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  // Add jitter (random 0-20% of delay)
  const jitter = exponentialDelay * Math.random() * 0.2;
  // Cap at max delay
  return Math.min(exponentialDelay + jitter, RETRY_CONFIG.maxDelayMs);
}

const SYSTEM_INSTRUCTION = `Tu es un professeur de français expert, correcteur au baccalauréat.
Ton ton est pédagogique, encourageant mais exigeant (niveau "Excellence").
Tu aides les élèves de Première pour l'Épreuve Anticipée de Français (EAF).
Tu connais parfaitement le programme 2026 et les méthodologies de la dissertation et du commentaire.`;

export type ExerciseType = 'Dissertation' | 'Commentaire' | 'Oral';

export interface Work {
  author: string;
  title: string;
  parcours: string;
}

export interface WorkAnalysis {
  biography: string;
  context: string;
  summary: { partTitle: string; content: string }[];
  characters: { name: string; description: string }[];
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekResponse {
  choices: {
    message: {
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

async function callDeepSeek(
  messages: ChatMessage[],
  options: {
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
  } = {}
): Promise<string> {
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY manquante');

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 4096,
          ...(options.jsonMode && {
            response_format: { type: 'json_object' },
          }),
        }),
      });

      // Check if we should retry this response
      if (!response.ok) {
        const errorText = await response.text();
        const isRetryable = RETRY_CONFIG.retryableStatuses.includes(response.status);

        if (isRetryable && attempt < RETRY_CONFIG.maxRetries) {
          const delay = getBackoffDelay(attempt, RETRY_CONFIG.initialDelayMs);
          console.warn(JSON.stringify({
            type: 'deepseek_retry',
            attempt: attempt + 1,
            maxRetries: RETRY_CONFIG.maxRetries,
            status: response.status,
            delayMs: Math.round(delay),
            error: errorText.slice(0, 200),
          }));
          await sleep(delay);
          continue;
        }

        console.error('DeepSeek API error:', errorText);
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data: DeepSeekResponse = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Réponse vide de DeepSeek');
      }

      // Log success with timing info
      if (attempt > 0) {
        console.log(JSON.stringify({
          type: 'deepseek_success_after_retry',
          attempts: attempt + 1,
          tokens: data.usage?.total_tokens,
        }));
      }

      return data.choices[0].message.content;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if it's a network error (fetch failed)
      const isNetworkError = lastError.message.includes('fetch') ||
                             lastError.message.includes('network') ||
                             lastError.message.includes('ECONNREFUSED') ||
                             lastError.message.includes('ETIMEDOUT');

      if (isNetworkError && attempt < RETRY_CONFIG.maxRetries) {
        const delay = getBackoffDelay(attempt, RETRY_CONFIG.initialDelayMs);
        console.warn(JSON.stringify({
          type: 'deepseek_network_retry',
          attempt: attempt + 1,
          maxRetries: RETRY_CONFIG.maxRetries,
          delayMs: Math.round(delay),
          error: lastError.message,
        }));
        await sleep(delay);
        continue;
      }

      // Non-retryable error or max retries reached
      throw lastError;
    }
  }

  // Should never reach here, but TypeScript needs this
  throw lastError || new Error('DeepSeek call failed after retries');
}

export async function generateSubject(type: ExerciseType, work?: Work): Promise<string> {
  let prompt = '';

  if (type === 'Dissertation' && work) {
    prompt = `Génère un sujet de dissertation type bac sur l'œuvre "${work.title}" de ${work.author} dans le cadre du parcours "${work.parcours}". Le sujet doit être une question ou une citation à discuter.`;
  } else if (type === 'Commentaire') {
    if (work) {
      prompt = `Choisis un extrait significatif (environ 20-25 lignes) tiré de l'œuvre "${work.title}" de ${work.author}. Génère le sujet complet du commentaire composé :
1. Indique le titre du passage ou sa situation précise dans l'œuvre (ex: Acte I, Scène 2).
2. Fournis le texte intégral du passage sélectionné.
3. Ajoute la consigne standard du bac (Vous ferez le commentaire de cet extrait...).`;
    } else {
      prompt = `Propose un texte littéraire classique (domaine public, XIXe ou XXe siècle) d'environ 15-20 lignes pour un exercice de commentaire de texte hors programme. Indique l'auteur, le titre et la date. Ne donne pas encore la correction.`;
    }
  } else if (type === 'Oral' && work) {
    prompt = `Pose une question de grammaire ou une question d'interprétation ponctuelle sur un passage clé de "${work.title}" pour préparer l'entretien de l'oral.`;
  } else {
    return 'Erreur de configuration de l\'exercice.';
  }

  return callDeepSeek([
    { role: 'system', content: SYSTEM_INSTRUCTION },
    { role: 'user', content: prompt },
  ], { temperature: 0.7 });
}

export async function generateSubjectList(work: Work, type: ExerciseType = 'Dissertation'): Promise<string[]> {
  let prompt = '';

  if (type === 'Commentaire') {
    prompt = `Sélectionne 3 extraits clés et distincts de l'œuvre "${work.title}" de ${work.author} propices à un commentaire littéraire.

Retourne UNIQUEMENT un tableau JSON de 3 chaînes de caractères, sans texte avant ou après.
Chaque chaîne doit contenir :
1. Un titre court situant le passage (ex: Chapitre 3 - La rencontre)
2. Un saut de ligne
3. Le texte intégral de l'extrait (environ 15-20 lignes)

Format attendu : ["extrait 1...", "extrait 2...", "extrait 3..."]`;
  } else {
    prompt = `Génère 3 sujets de dissertation distincts (type bac) sur l'œuvre "${work.title}" de ${work.author} (Parcours: "${work.parcours}").

Retourne UNIQUEMENT un tableau JSON de 3 chaînes de caractères.
Format attendu : ["sujet 1", "sujet 2", "sujet 3"]`;
  }

  const response = await callDeepSeek([
    { role: 'system', content: SYSTEM_INSTRUCTION },
    { role: 'user', content: prompt },
  ], { temperature: 0.8, jsonMode: true });

  try {
    const parsed = JSON.parse(response);
    // Handle both array directly or object with subjects key
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (parsed.subjects && Array.isArray(parsed.subjects)) {
      return parsed.subjects;
    }
    throw new Error('Format de réponse invalide');
  } catch (e) {
    console.error('Failed to parse subject list:', response);
    throw new Error('Impossible de parser la liste de sujets');
  }
}

export async function evaluateStudentWork(
  type: ExerciseType,
  subject: string,
  studentInput: string
): Promise<string> {
  const prompt = `Exercice : ${type}
Sujet / Texte : ${subject}

Travail de l'élève (Plan, Problématique ou Réponse) :
"${studentInput}"

Consigne : Évalue ce travail selon les critères officiels du bac français.
1. Points forts.
2. Points à améliorer (méthodologie, pertinence).
3. Donne une suggestion de correction ou d'amélioration concrète (ex: une meilleure problématique ou un axe plus pertinent).
Sois bienveillant mais rigoureux.`;

  return callDeepSeek([
    { role: 'system', content: SYSTEM_INSTRUCTION },
    { role: 'user', content: prompt },
  ], { temperature: 0.5 });
}

export async function generateWorkAnalysis(work: Work): Promise<WorkAnalysis> {
  const prompt = `Réalise une fiche de révision complète pour l'œuvre "${work.title}" de ${work.author}.

Retourne UNIQUEMENT un objet JSON avec cette structure exacte :
{
  "biography": "Courte biographie de l'auteur (dates, mouvement, style)",
  "context": "Contexte historique et littéraire de l'œuvre",
  "summary": [
    { "partTitle": "Titre de la partie 1", "content": "Résumé de cette partie" },
    { "partTitle": "Titre de la partie 2", "content": "Résumé de cette partie" }
  ],
  "characters": [
    { "name": "Nom du personnage", "description": "Description du personnage" }
  ]
}

Détails attendus :
- biography: Courte biographie de l'auteur
- context: Contexte historique et littéraire
- summary: Résumé détaillé en 4-5 parties minimum
- characters: Personnages principaux (ou thèmes clés pour poésie/essais)`;

  const response = await callDeepSeek([
    { role: 'system', content: SYSTEM_INSTRUCTION },
    { role: 'user', content: prompt },
  ], { temperature: 0.4, jsonMode: true });

  try {
    return JSON.parse(response) as WorkAnalysis;
  } catch (e) {
    console.error('Failed to parse work analysis:', response);
    throw new Error('Impossible de parser l\'analyse');
  }
}
