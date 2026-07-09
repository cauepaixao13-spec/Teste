/** Meta personalizada criada pelo usuário na tela de Metas (CRUD completo). */
export interface GoalRecord {
  id: string;
  title: string;
  subtitle: string;
  /** Progresso manual de 0 a 100 — o próprio usuário atualiza conforme avança. */
  progress: number;
  createdAt: string;
}
