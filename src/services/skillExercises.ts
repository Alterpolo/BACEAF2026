/**
 * Service pour générer des exercices ciblés par compétence méthodologique
 */

import { Skill, UserSkill } from './progression';
import { ExerciseType } from '../types';

// Prompts spécifiques pour chaque compétence
const SKILL_PROMPTS: Record<string, SkillPromptConfig> = {
  // ===== DISSERTATION =====
  'diss-analyse-sujet': {
    instruction: `Tu es un professeur préparant un exercice d'analyse de sujet de dissertation.`,
    exercisePrompt: (work) => `
Génère un sujet de dissertation sur "${work?.title || 'une œuvre au programme'}" avec les consignes suivantes :

1. Donne le sujet (citation ou question)
2. Demande à l'élève de :
   - Identifier les mots-clés du sujet
   - Définir précisément chaque terme important
   - Repérer les présupposés et enjeux implicites
   - Reformuler le sujet avec ses propres mots

Ne donne PAS la correction. L'élève doit s'exercer.`,
    evaluationCriteria: [
      'Identification complète des mots-clés',
      'Définitions précises et nuancées',
      'Repérage des présupposés',
      'Reformulation fidèle et personnelle',
    ],
  },

  'diss-problematique': {
    instruction: `Tu es un professeur préparant un exercice de formulation de problématique.`,
    exercisePrompt: (work) => `
Génère un sujet de dissertation sur "${work?.title || 'une œuvre au programme'}" avec :

1. Le sujet complet
2. Une analyse rapide des termes (pour aider l'élève)
3. Demande à l'élève de formuler une problématique qui :
   - Transforme le sujet en question ouverte
   - Met en tension les termes du sujet
   - Ouvre un débat argumentatif

Ne donne PAS d'exemple de problématique.`,
    evaluationCriteria: [
      'Forme interrogative correcte',
      'Mise en tension des termes',
      'Ouverture au débat',
      'Pertinence par rapport au sujet',
    ],
  },

  'diss-plan': {
    instruction: `Tu es un professeur préparant un exercice de construction de plan dialectique.`,
    exercisePrompt: (work) => `
Génère un sujet de dissertation sur "${work?.title || 'une œuvre au programme'}" avec :

1. Le sujet
2. Une problématique déjà formulée
3. Demande à l'élève de proposer un plan en 3 parties (thèse, antithèse, synthèse) avec :
   - Un titre clair pour chaque partie
   - 2-3 sous-parties pour chaque grande partie
   - L'idée directrice de chaque sous-partie

Format attendu : plan détaillé sans rédaction.`,
    evaluationCriteria: [
      'Structure dialectique respectée',
      'Progression logique',
      'Pertinence des sous-parties',
      'Équilibre entre les parties',
    ],
  },

  'diss-argumentation': {
    instruction: `Tu es un professeur préparant un exercice d'argumentation.`,
    exercisePrompt: (work) => `
Propose un argument à développer sur "${work?.title || 'une œuvre au programme'}".

1. Donne le sujet de dissertation
2. Donne une idée directrice à développer
3. Demande à l'élève de rédiger un paragraphe argumentatif complet :
   - Affirmation de l'idée
   - Explication/justification
   - Exemple littéraire précis (citation si possible)
   - Analyse de l'exemple
   - Conclusion du paragraphe

Un seul paragraphe à rédiger.`,
    evaluationCriteria: [
      'Affirmation claire de l\'idée',
      'Explication développée',
      'Exemple pertinent et précis',
      'Analyse de l\'exemple',
      'Lien avec l\'idée directrice',
    ],
  },

  'diss-exemples': {
    instruction: `Tu es un professeur préparant un exercice sur l'utilisation des exemples.`,
    exercisePrompt: (work) => `
Sur l'œuvre "${work?.title || 'une œuvre au programme'}" de ${work?.author || 'l\'auteur'}:

1. Donne un argument à illustrer
2. Demande à l'élève de trouver 2 exemples pertinents dans l'œuvre :
   - Situer précisément l'exemple (chapitre, scène, vers...)
   - Citer un extrait court si possible
   - Expliquer en quoi l'exemple illustre l'argument

Évalue la pertinence et la précision des exemples.`,
    evaluationCriteria: [
      'Pertinence des exemples',
      'Précision des références',
      'Qualité des citations',
      'Lien clair avec l\'argument',
    ],
  },

  'diss-transitions': {
    instruction: `Tu es un professeur préparant un exercice sur les transitions.`,
    exercisePrompt: (work) => `
Dans le cadre d'une dissertation sur "${work?.title || 'une œuvre au programme'}":

1. Présente deux parties consécutives d'un plan (avec leurs idées)
2. Demande à l'élève de rédiger la transition entre ces deux parties :
   - Bilan de la partie précédente
   - Annonce de la limite ou de l'idée nouvelle
   - Ouverture vers la partie suivante

La transition doit être fluide et logique.`,
    evaluationCriteria: [
      'Bilan synthétique de la partie',
      'Annonce de la limite',
      'Lien logique avec la suite',
      'Fluidité de la rédaction',
    ],
  },

  'diss-introduction': {
    instruction: `Tu es un professeur préparant un exercice de rédaction d'introduction.`,
    exercisePrompt: (work) => `
Pour une dissertation sur "${work?.title || 'une œuvre au programme'}":

1. Donne le sujet
2. Donne la problématique et le plan (déjà élaborés)
3. Demande à l'élève de rédiger l'introduction complète :
   - Amorce (accroche culturelle)
   - Présentation du sujet et de l'œuvre
   - Problématique
   - Annonce du plan

Rédaction complète attendue.`,
    evaluationCriteria: [
      'Amorce pertinente et cultivée',
      'Présentation claire du sujet',
      'Problématique bien formulée',
      'Annonce du plan claire',
    ],
  },

  'diss-conclusion': {
    instruction: `Tu es un professeur préparant un exercice de rédaction de conclusion.`,
    exercisePrompt: (work) => `
Pour une dissertation sur "${work?.title || 'une œuvre au programme'}":

1. Donne le sujet et le plan suivi
2. Donne les arguments principaux de chaque partie
3. Demande à l'élève de rédiger la conclusion :
   - Bilan synthétique des parties
   - Réponse à la problématique
   - Ouverture pertinente

Rédaction complète attendue.`,
    evaluationCriteria: [
      'Bilan fidèle et synthétique',
      'Réponse claire à la problématique',
      'Ouverture pertinente',
      'Qualité de la rédaction',
    ],
  },

  // ===== COMMENTAIRE =====
  'comm-genre-registre': {
    instruction: `Tu es un professeur préparant un exercice d'identification de genre et registre.`,
    exercisePrompt: (work) => `
Propose un extrait littéraire de "${work?.title || 'une œuvre classique'}" (10-15 lignes).

Demande à l'élève d'identifier :
1. Le genre littéraire (roman, poésie, théâtre, essai...)
2. Le sous-genre éventuel (roman épistolaire, sonnet...)
3. Le(s) registre(s) dominant(s) (lyrique, tragique, comique, épique...)
4. Les indices textuels qui justifient ces choix

L'élève doit citer le texte pour prouver ses réponses.`,
    evaluationCriteria: [
      'Identification correcte du genre',
      'Identification du registre',
      'Justification par des indices textuels',
      'Précision du vocabulaire littéraire',
    ],
  },

  'comm-structure': {
    instruction: `Tu es un professeur préparant un exercice d'analyse de la structure d'un texte.`,
    exercisePrompt: (work) => `
Propose un extrait de "${work?.title || 'une œuvre au programme'}" (15-20 lignes).

Demande à l'élève de :
1. Découper le texte en mouvements logiques
2. Donner un titre à chaque mouvement
3. Identifier la progression du texte (narration, argumentation, description...)
4. Repérer les connecteurs et transitions

L'analyse doit être précise avec références aux lignes.`,
    evaluationCriteria: [
      'Découpage pertinent en mouvements',
      'Titres clairs et justes',
      'Identification de la progression',
      'Repérage des connecteurs',
    ],
  },

  'comm-procedes': {
    instruction: `Tu es un professeur préparant un exercice d'identification des procédés littéraires.`,
    exercisePrompt: (work) => `
Propose un extrait riche en procédés de "${work?.title || 'une œuvre au programme'}" (10-15 lignes).

Demande à l'élève d'identifier et d'analyser au moins 5 procédés parmi :
- Figures de style (métaphore, comparaison, hyperbole...)
- Procédés rythmiques (anaphore, gradation...)
- Champs lexicaux
- Temps verbaux et leurs effets
- Types de phrases et ponctuation

Pour chaque procédé : le citer, le nommer, expliquer son effet.`,
    evaluationCriteria: [
      'Identification correcte des procédés',
      'Citations précises',
      'Analyse des effets',
      'Variété des procédés repérés',
    ],
  },

  'comm-interpretation': {
    instruction: `Tu es un professeur préparant un exercice d'interprétation.`,
    exercisePrompt: (work) => `
Propose un extrait de "${work?.title || 'une œuvre au programme'}" avec plusieurs procédés déjà identifiés.

Demande à l'élève de :
1. Passer de l'observation à l'interprétation
2. Formuler des hypothèses de sens
3. Relier les procédés à une intention de l'auteur
4. Montrer comment la forme sert le fond

L'élève doit proposer une lecture personnelle et argumentée.`,
    evaluationCriteria: [
      'Passage de l\'observation à l\'interprétation',
      'Hypothèses de sens pertinentes',
      'Lien forme/fond',
      'Argumentation cohérente',
    ],
  },

  'comm-plan': {
    instruction: `Tu es un professeur préparant un exercice de construction de plan de commentaire.`,
    exercisePrompt: (work) => `
Propose un extrait de "${work?.title || 'une œuvre au programme'}" (15-20 lignes).

Après une brève analyse guidée, demande à l'élève de :
1. Formuler une problématique de commentaire
2. Proposer 2 ou 3 axes de lecture
3. Développer chaque axe en 2-3 sous-parties
4. Indiquer quels procédés seront analysés dans chaque sous-partie

Le plan doit être détaillé mais pas rédigé.`,
    evaluationCriteria: [
      'Problématique pertinente',
      'Axes de lecture cohérents',
      'Progression entre les axes',
      'Répartition logique des procédés',
    ],
  },

  'comm-redaction': {
    instruction: `Tu es un professeur préparant un exercice de rédaction de paragraphe de commentaire.`,
    exercisePrompt: (work) => `
Propose un extrait court de "${work?.title || 'une œuvre au programme'}" avec :
1. Un axe de lecture donné
2. Une sous-partie à développer
3. Les procédés à analyser

Demande à l'élève de rédiger le paragraphe en suivant la méthode :
- Idée directrice
- Citation du texte
- Analyse du procédé
- Interprétation
- Transition vers la suite

Un seul paragraphe, bien rédigé.`,
    evaluationCriteria: [
      'Structure du paragraphe respectée',
      'Citations intégrées',
      'Analyse précise',
      'Interprétation pertinente',
    ],
  },

  'comm-introduction': {
    instruction: `Tu es un professeur préparant un exercice d'introduction de commentaire.`,
    exercisePrompt: (work) => `
Pour un commentaire d'un extrait de "${work?.title}" de ${work?.author || 'l\'auteur'}:

1. Donne l'extrait
2. Donne la problématique et le plan (déjà trouvés)
3. Demande à l'élève de rédiger l'introduction :
   - Amorce (contexte littéraire/historique)
   - Présentation de l'auteur et de l'œuvre
   - Situation du passage
   - Problématique
   - Annonce du plan

Introduction complète et rédigée.`,
    evaluationCriteria: [
      'Amorce pertinente',
      'Présentation complète',
      'Situation précise du passage',
      'Annonce claire du plan',
    ],
  },

  'comm-conclusion': {
    instruction: `Tu es un professeur préparant un exercice de conclusion de commentaire.`,
    exercisePrompt: (work) => `
Pour un commentaire déjà rédigé sur un extrait de "${work?.title || 'une œuvre au programme'}":

1. Résume les axes développés
2. Demande à l'élève de rédiger la conclusion :
   - Bilan synthétique des axes
   - Réponse à la problématique
   - Ouverture (vers l'œuvre, l'auteur, ou un thème plus large)

Conclusion complète et rédigée.`,
    evaluationCriteria: [
      'Bilan fidèle des axes',
      'Réponse à la problématique',
      'Ouverture pertinente',
      'Qualité de la rédaction',
    ],
  },

  // ===== ORAL =====
  'oral-lecture': {
    instruction: `Tu es un professeur préparant un exercice de lecture expressive.`,
    exercisePrompt: (work) => `
Propose un extrait de "${work?.title || 'une œuvre au programme'}" (15-20 lignes) pour un exercice de lecture à voix haute.

Demande à l'élève de préparer sa lecture en notant :
1. Les pauses (courtes, longues)
2. Les mots à mettre en valeur (volume, ton)
3. Le rythme général (lent, rapide, variations)
4. Les émotions à transmettre
5. Les liaisons à faire ou éviter

L'élève doit annoter le texte et justifier ses choix.`,
    evaluationCriteria: [
      'Pertinence des pauses',
      'Choix des mots mis en valeur',
      'Cohérence du rythme',
      'Expression des émotions',
    ],
  },

  'oral-explication': {
    instruction: `Tu es un professeur préparant un exercice d'explication linéaire.`,
    exercisePrompt: (work) => `
Propose un extrait court de "${work?.title || 'une œuvre au programme'}" (10-12 lignes).

Demande à l'élève de préparer une explication linéaire :
1. Introduction (situation du passage)
2. Découpage en mouvements (2-3 max)
3. Pour chaque mouvement : analyse ligne par ligne des procédés et de leur sens
4. Conclusion (bilan et ouverture)

L'élève doit organiser son analyse de façon fluide.`,
    evaluationCriteria: [
      'Introduction complète',
      'Découpage pertinent',
      'Analyse linéaire et précise',
      'Cohérence de l\'explication',
    ],
  },

  'oral-grammaire': {
    instruction: `Tu es un professeur préparant un exercice de question de grammaire.`,
    exercisePrompt: (work) => `
À partir d'un extrait de "${work?.title || 'une œuvre au programme'}":

1. Propose une phrase ou un passage court
2. Pose une question de grammaire précise :
   - Analyse d'une proposition subordonnée
   - Valeur d'un temps verbal
   - Nature et fonction d'un groupe de mots
   - Analyse d'une négation, interrogation...

L'élève doit répondre en utilisant le vocabulaire grammatical précis.`,
    evaluationCriteria: [
      'Précision du vocabulaire grammatical',
      'Identification correcte',
      'Analyse complète',
      'Clarté de l\'explication',
    ],
  },

  'oral-synthese': {
    instruction: `Tu es un professeur préparant un exercice de synthèse de lecture.`,
    exercisePrompt: (work) => `
Pour l'œuvre "${work?.title}" de ${work?.author || 'l\'auteur'}:

Demande à l'élève de préparer une présentation orale de 2-3 minutes :
1. Présentation de l'auteur (éléments biographiques essentiels)
2. Contexte de l'œuvre
3. Résumé de l'intrigue/du contenu
4. Thèmes principaux
5. Lien avec le parcours associé

L'élève doit structurer sa présentation et la rendre fluide.`,
    evaluationCriteria: [
      'Informations essentielles présentes',
      'Structure claire',
      'Lien avec le parcours',
      'Fluidité de la présentation',
    ],
  },

  'oral-parcours': {
    instruction: `Tu es un professeur préparant un exercice sur le parcours associé.`,
    exercisePrompt: (work) => `
Pour l'œuvre "${work?.title}" dans le parcours "${work?.parcours || 'le parcours associé'}":

Demande à l'élève d'expliquer :
1. La définition et les enjeux du parcours
2. Comment l'œuvre illustre le parcours (3 exemples précis)
3. Les nuances ou tensions entre l'œuvre et le parcours
4. Une ouverture vers d'autres œuvres du même parcours

Réponse argumentée avec exemples.`,
    evaluationCriteria: [
      'Compréhension du parcours',
      'Exemples précis de l\'œuvre',
      'Nuances identifiées',
      'Ouvertures pertinentes',
    ],
  },

  'oral-entretien': {
    instruction: `Tu es un professeur simulant un entretien de l'oral du bac.`,
    exercisePrompt: (work) => `
Simule un entretien oral sur l'œuvre choisie par l'élève : "${work?.title}" de ${work?.author || 'l\'auteur'}.

Pose 3 questions progressives :
1. Une question simple sur l'œuvre (personnage, thème, passage marquant)
2. Une question d'interprétation (sens, intention de l'auteur)
3. Une question de mise en perspective (lien avec d'autres œuvres, actualité du propos)

L'élève doit répondre à chaque question de façon développée (5-6 phrases minimum).`,
    evaluationCriteria: [
      'Connaissance de l\'œuvre',
      'Capacité d\'interprétation',
      'Culture littéraire',
      'Qualité de l\'expression orale',
    ],
  },
};

interface SkillPromptConfig {
  instruction: string;
  exercisePrompt: (work?: { title: string; author?: string; parcours?: string }) => string;
  evaluationCriteria: string[];
}

export interface SkillExercisePrompt {
  skillId: string;
  skillName: string;
  systemInstruction: string;
  userPrompt: string;
  evaluationCriteria: string[];
}

/**
 * Génère le prompt pour un exercice ciblé sur une compétence
 */
export function generateSkillExercisePrompt(
  skill: Skill,
  work?: { title: string; author?: string; parcours?: string }
): SkillExercisePrompt | null {
  const config = SKILL_PROMPTS[skill.id];

  if (!config) {
    console.warn(`No prompt config for skill: ${skill.id}`);
    return null;
  }

  return {
    skillId: skill.id,
    skillName: skill.name,
    systemInstruction: config.instruction,
    userPrompt: config.exercisePrompt(work).trim(),
    evaluationCriteria: config.evaluationCriteria,
  };
}

/**
 * Génère le prompt d'évaluation pour un exercice de compétence
 */
export function generateSkillEvaluationPrompt(
  skillName: string,
  exercisePrompt: string,
  studentAnswer: string,
  evaluationCriteria: string[]
): string {
  return `
Tu es un professeur de français évaluant un exercice de méthodologie.

## Compétence travaillée
${skillName}

## Exercice proposé
${exercisePrompt}

## Réponse de l'élève
${studentAnswer}

## Critères d'évaluation
${evaluationCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## Consignes d'évaluation
1. Évalue chaque critère sur 5 points (total /20)
2. Donne des retours précis et constructifs
3. Propose des pistes d'amélioration concrètes
4. Reste bienveillant mais exigeant

Réponds avec ce format JSON :
{
  "score": <note sur 20>,
  "criteriaScores": [
    { "criterion": "<critère>", "score": <sur 5>, "comment": "<commentaire>" }
  ],
  "strengths": ["<point fort 1>", "<point fort 2>"],
  "improvements": ["<amélioration 1>", "<amélioration 2>"],
  "advice": "<conseil principal pour progresser>",
  "overallComment": "<commentaire général bienveillant>"
}
`;
}

/**
 * Retourne les compétences disponibles pour un type d'exercice
 */
export function getAvailableSkillIds(exerciseType: ExerciseType): string[] {
  const prefix = {
    [ExerciseType.DISSERTATION]: 'diss-',
    [ExerciseType.COMMENTAIRE]: 'comm-',
    [ExerciseType.ORAL]: 'oral-',
  }[exerciseType];

  return Object.keys(SKILL_PROMPTS).filter((id) => id.startsWith(prefix));
}

/**
 * Vérifie si un skill a un prompt configuré
 */
export function hasSkillPrompt(skillId: string): boolean {
  return skillId in SKILL_PROMPTS;
}
