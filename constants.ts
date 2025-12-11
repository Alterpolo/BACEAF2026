import { Genre, ProgramObject, MethodCard } from './types';

export const PROGRAM_2026: ProgramObject[] = [
  {
    genre: Genre.LITTERATURE_IDEES,
    works: [
      { author: "Étienne de La Boétie", title: "Discours de la servitude volontaire", parcours: "« Défendre » et « entretenir » la liberté." },
      { author: "Bernard Le Bouyer de Fontenelle", title: "Entretiens sur la pluralité des mondes", parcours: "Le goût de la science." },
      { author: "Françoise de Graffigny", title: "Lettres d'une Péruvienne", parcours: "« Un nouvel univers s’est offert à mes yeux »." }
    ]
  },
  {
    genre: Genre.POESIE,
    works: [
      { author: "Arthur Rimbaud", title: "Cahier de Douai", parcours: "Émancipations créatrices." },
      { author: "Francis Ponge", title: "La rage de l'Expression", parcours: "Dans l'atelier du poète." },
      { author: "Hélène Dorion", title: "Mes forêts", parcours: "La poésie, la nature, l'intime." }
    ]
  },
  {
    genre: Genre.ROMAN,
    works: [
      { author: "Abbé Prévost", title: "Manon Lescaut", parcours: "Personnages en marge, plaisirs du romanesque." },
      { author: "Honoré de Balzac", title: "La Peau de chagrin", parcours: "Les romans de l'énergie : création et destruction." },
      { author: "Colette", title: "Sido suivi de Les Vrilles de la vigne", parcours: "La célébration du monde." }
    ]
  },
  {
    genre: Genre.THEATRE,
    works: [
      { author: "Pierre Corneille", title: "Le Menteur", parcours: "Mensonge et comédie." },
      { author: "Alfred de Musset", title: "On ne badine pas avec l'amour", parcours: "Les jeux du coeur et de la parole." },
      { author: "Nathalie Sarraute", title: "Pour un oui ou pour un non", parcours: "Théâtre et dispute." }
    ]
  }
];

export const METHOD_DISSERTATION: MethodCard[] = [
  {
    title: "1. Analyse du Sujet",
    content: "Une analyse minutieuse est la condition sine qua non de la réussite.",
    steps: [
      { title: "Mots-Clés", description: "Repérer les termes centraux (noms, verbes) et les définir." },
      { title: "Présupposés", description: "Identifier ce que la question affirme implicitement." },
      { title: "Délimitation", description: "Cerner les limites (genre, époque, œuvre)." },
      { title: "Reformulation", description: "Reformuler le sujet pour vérifier la compréhension." }
    ]
  },
  {
    title: "2. La Problématique",
    content: "La problématique transforme l'énoncé en un problème intellectuel. Elle doit être formulée sous forme de question et servir de fil conducteur.",
  },
  {
    title: "3. Le Plan",
    content: "L'ossature de l'argumentation.",
    steps: [
      { title: "Thématique", description: "Progressif (aspects d'une question). Idéal pour les sujets ouverts." },
      { title: "Dialectique", description: "Thèse / Antithèse / Synthèse. Pour les sujets invitant au débat." },
      { title: "Analytique", description: "Constat / Analyse / Perspective. Pour examiner un phénomène." }
    ]
  }
];

export const METHOD_COMMENTAIRE: MethodCard[] = [
  {
    title: "1. Lecture & Repérage",
    content: "Ne jamais faire de lecture linéaire. Repérez les champs lexicaux, figures de style, temps verbaux, etc.",
  },
  {
    title: "2. Le Projet de Lecture",
    content: "Synthèse de l'interprétation en une hypothèse. Question : 'Qu'est-ce qui fait la singularité de ce texte ?'",
  },
  {
    title: "3. Structure",
    content: "Introduction (Auteur, Texte, Problématique, Annonce), Développement (Axes de lecture non linéaires), Conclusion (Bilan, Réponse, Ouverture).",
  }
];
