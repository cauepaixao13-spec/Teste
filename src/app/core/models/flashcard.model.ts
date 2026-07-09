/** Um flashcard criado/editado pelo usuário (ou semeado por padrão na primeira vez). */
export interface FlashcardRecord {
  id: string;
  question: string;
  answer: string;
  category: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  /** Estatísticas de revisão — alimentam o progresso mostrado no dashboard. */
  stats: {
    timesReviewed: number;
    timesEasy: number;
    timesHard: number;
    lastReviewedAt: string | null;
  };
}

/** Um registro de sessão de estudo (revisão de flashcards) — usado pra calcular streak, tempo estudado e metas. */
export interface StudySession {
  id: string;
  date: string;        // formato YYYY-MM-DD (dia local), usado para agrupar por dia
  cardsReviewed: number;
  easyCount: number;
  hardCount: number;
  durationMinutes: number;
  completedAt: string; // ISO completo
}
