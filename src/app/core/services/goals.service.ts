import { Injectable, computed, effect, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { GoalRecord } from '../models/goal.model';

export interface GoalInput {
  title: string;
  subtitle: string;
  progress: number;
}

/**
 * GoalsService — CRUD das metas personalizadas (a lista editável que aparece
 * na tela de Metas). Segue o mesmo padrão do FlashcardsService: dados
 * isolados por usuário e persistidos no LocalStorage, com um seed inicial
 * só pra tela não nascer vazia.
 */
@Injectable({ providedIn: 'root' })
export class GoalsService {
  private goals = signal<GoalRecord[]>([]);
  readonly goals$ = this.goals.asReadonly();

  readonly completedCount = computed(() => this.goals().filter(g => g.progress >= 100).length);
  readonly activeCount = computed(() => this.goals().filter(g => g.progress < 100).length);

  constructor(private storage: StorageService, private auth: AuthService) {
    effect(() => {
      const userId = this.auth.currentUser()?.id ?? null;
      this.loadForUser(userId);
    });
  }

  private key(userId: string) { return `goals:${userId}`; }

  private loadForUser(userId: string | null) {
    if (!userId) { this.goals.set([]); return; }

    const existing = this.storage.get<GoalRecord[] | null>(this.key(userId), null);
    if (existing === null) {
      const seeded = this.seedDefaults();
      this.storage.set(this.key(userId), seeded);
      this.goals.set(seeded);
    } else {
      this.goals.set(existing);
    }
  }

  private persist() {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    this.storage.set(this.key(userId), this.goals());
  }

  private seedDefaults(): GoalRecord[] {
    const now = new Date().toISOString();
    return [
      { id: crypto.randomUUID(), title: 'Atingir 960 pontos no ENEM', subtitle: 'Até dezembro', progress: 79, createdAt: now },
      { id: crypto.randomUUID(), title: 'Escrever 1 redação por semana', subtitle: 'Semanalmente', progress: 100, createdAt: now },
      { id: crypto.randomUUID(), title: 'Completar módulo de Repertório', subtitle: 'Esta semana', progress: 13, createdAt: now },
    ];
  }

  create(input: GoalInput): void {
    const goal: GoalRecord = {
      id: crypto.randomUUID(),
      title: input.title.trim(),
      subtitle: input.subtitle.trim(),
      progress: this.clampProgress(input.progress),
      createdAt: new Date().toISOString(),
    };
    this.goals.update(list => [goal, ...list]);
    this.persist();
  }

  update(id: string, input: GoalInput): void {
    this.goals.update(list => list.map(g =>
      g.id === id ? { ...g, title: input.title.trim(), subtitle: input.subtitle.trim(), progress: this.clampProgress(input.progress) } : g
    ));
    this.persist();
  }

  delete(id: string): void {
    this.goals.update(list => list.filter(g => g.id !== id));
    this.persist();
  }

  /** Ajusta o progresso em +/- delta (usado nos botões rápidos "+10%"/"-10%" do card). */
  adjustProgress(id: string, delta: number): void {
    this.goals.update(list => list.map(g =>
      g.id === id ? { ...g, progress: this.clampProgress(g.progress + delta) } : g
    ));
    this.persist();
  }

  private clampProgress(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  /** "Resetar progresso": zera o percentual de todas as metas personalizadas, sem excluí-las. */
  resetProgress(): void {
    this.goals.update(list => list.map(g => ({ ...g, progress: 0 })));
    this.persist();
  }
}
