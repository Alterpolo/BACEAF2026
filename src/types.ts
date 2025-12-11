export enum Genre {
  LITTERATURE_IDEES = "La littérature d'idées du XVIe au XVIIIe siècle",
  POESIE = "La poésie du XIXe siècle au XXIe siècle",
  ROMAN = "Le roman et le récit du Moyen Âge au XXIe siècle",
  THEATRE = "Le théâtre du XVIIe siècle au XXIe siècle"
}

export interface Work {
  author: string;
  title: string;
  parcours: string;
}

export interface ProgramObject {
  genre: Genre;
  works: Work[];
}

export enum ExerciseType {
  DISSERTATION = 'Dissertation',
  COMMENTAIRE = 'Commentaire',
  ORAL = 'Oral'
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  isError?: boolean;
}

export interface MethodCard {
  title: string;
  content: string;
  steps?: { title: string; description: string }[];
}

export interface WorkAnalysis {
  biography: string;
  context: string;
  summary: { partTitle: string; content: string }[];
  characters: { name: string; description: string }[];
}

export interface User {
  email: string;
  name: string;
  avatar?: string;
}
