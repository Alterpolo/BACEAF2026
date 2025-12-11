export enum Genre {
  LITTERATURE_IDEES = "La littérature d'idées (XVIe-XVIIIe)",
  POESIE = "La poésie (XIXe-XXIe)",
  ROMAN = "Le roman et le récit (Moyen Âge - XXIe)",
  THEATRE = "Le théâtre (XVIIe-XXIe)"
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