import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoalsService, GoalInput } from '../../../../core/services/goals.service';
import { FlashcardsService } from '../../../../core/services/flashcards.service';
import { AuthService } from '../../../../core/services/auth.service';

/** Uma meta "automática", calculada a partir de dados reais (não é editável nem excluível, só acompanhada). */
interface AutoGoal {
  title: string;
  subtitle: string;
  progress: number;
}

@Component({
  selector: 'app-metas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <p class="eyebrow">METAS</p>
      <h1>Seus <span class="highlight">objetivos</span></h1>
    </div>
    <button class="btn-add" (click)="openCreateForm()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      Nova meta
    </button>
  </div>

  @if (showForm()) {
    <div class="goal-form card">
      <h3>{{ editingId() ? 'Editar meta' : 'Nova meta' }}</h3>
      <div class="form-field">
        <label>Título</label>
        <input type="text" [(ngModel)]="formTitle" name="formTitle" placeholder="Ex: Ler 2 livros este mês" />
      </div>
      <div class="form-field">
        <label>Descrição/prazo</label>
        <input type="text" [(ngModel)]="formSubtitle" name="formSubtitle" placeholder="Ex: Até o fim do mês" />
      </div>
      <div class="form-field">
        <label>Progresso inicial: {{ formProgress }}%</label>
        <input type="range" min="0" max="100" [(ngModel)]="formProgress" name="formProgress" />
      </div>
      @if (formError()) { <p class="form-error">{{ formError() }}</p> }
      <div class="form-actions">
        <button class="btn-ghost" type="button" (click)="closeForm()">Cancelar</button>
        <button class="btn-primary" type="button" (click)="saveForm()">{{ editingId() ? 'Salvar' : 'Criar meta' }}</button>
      </div>
    </div>
  }

  <!-- Metas automáticas: calculadas a partir da atividade real do usuário (flashcards revisados, streak) -->
  <div class="auto-goals-row">
    @for (goal of autoGoals(); track goal.title) {
      <div class="auto-goal card">
        <div class="auto-goal-top">
          <span class="auto-badge">AUTOMÁTICA</span>
          <span class="goal-pct" [style.color]="getColorByProgress(goal.progress)">{{ goal.progress }}%</span>
        </div>
        <h3>{{ goal.title }}</h3>
        <p class="goal-sub">{{ goal.subtitle }}</p>
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="goal.progress" [style.background]="progressGradient(goal.progress)"></div>
        </div>
      </div>
    }
  </div>

  <!-- Metas personalizadas (CRUD) -->
  <div class="goals-grid">
    @for (goal of goals(); track goal.id) {
      <div class="goal-card card" [class.completed]="goal.progress >= 100">
        <div class="goal-top">
          <div class="goal-icon" [class.done]="goal.progress >= 100">
            @if (goal.progress >= 100) {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            } @else {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            }
          </div>
          <div class="goal-pct" [style.color]="getColorByProgress(goal.progress)">{{ goal.progress }}%</div>
        </div>

        <h3>{{ goal.title }}</h3>
        <p class="goal-sub">{{ goal.subtitle }}</p>

        <div class="goal-progress-wrap">
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="goal.progress" [style.background]="progressGradient(goal.progress)"></div>
          </div>
          <div class="goal-quick-actions">
            <button class="quick-btn" (click)="goalsService.adjustProgress(goal.id, -10)" title="-10%">−</button>
            <span class="progress-text">{{ goal.progress }}% concluído</span>
            <button class="quick-btn" (click)="goalsService.adjustProgress(goal.id, 10)" title="+10%">+</button>
          </div>
        </div>

        <div class="goal-card-footer">
          @if (goal.progress >= 100) {
            <div class="goal-badge done">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Concluído
            </div>
          } @else {
            <div class="goal-badge ongoing">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Em andamento
            </div>
          }
          <div class="manage-actions">
            <button class="icon-btn" (click)="openEditForm(goal)" title="Editar">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="icon-btn danger" (click)="deleteGoal(goal.id)" title="Excluir">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    }

    <div class="goal-card add-card" (click)="openCreateForm()">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      <span>Adicionar meta</span>
    </div>
  </div>

  <div class="goals-summary">
    <div class="summary-item"><div class="sum-circle done">{{ goalsService.completedCount() }}</div><span>Concluídas</span></div>
    <div class="sum-divider"></div>
    <div class="summary-item"><div class="sum-circle active">{{ goalsService.activeCount() }}</div><span>Em andamento</span></div>
    <div class="sum-divider"></div>
    <div class="summary-item"><div class="sum-circle total">{{ goals().length }}</div><span>Total</span></div>
  </div>
</div>
  `,
  styles: [`
.page { max-width: 1200px; margin: 0 auto; animation: fadeIn 0.4s ease; display: flex; flex-direction: column; gap: 28px; }
.eyebrow { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; color: var(--accent); text-transform: uppercase; margin-bottom: 8px; }
h1 { font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.btn-add {
  display: flex; align-items: center; gap: 7px; padding: 9px 18px;
  background: var(--accent-10); border: 1px solid var(--border); border-radius: var(--radius-sm);
  color: var(--accent); font-size: 0.83rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
  &:hover { background: rgba(0,196,255,0.15); box-shadow: 0 0 12px var(--accent-glow); }
}

.goal-form { padding: 24px; display: flex; flex-direction: column; gap: 14px; }
.goal-form h3 { font-size: 1rem; font-weight: 700; }
.form-field { display: flex; flex-direction: column; gap: 6px; }
.form-field label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); }
.form-field input[type="text"] {
  background: rgba(255,255,255,0.04); border: 1px solid var(--border-card); border-radius: var(--radius-sm);
  padding: 10px 12px; font-size: 0.85rem; color: var(--text-primary);
  &:focus { border-color: var(--accent); outline: none; }
}
.form-error { color: var(--red); font-size: 0.8rem; }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; }

.auto-goals-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.auto-goal { padding: 20px 24px; display: flex; flex-direction: column; gap: 8px; border-style: dashed; }
.auto-goal-top { display: flex; justify-content: space-between; align-items: center; }
.auto-badge { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.06em; color: var(--violet); background: rgba(124,58,237,0.1); padding: 3px 8px; border-radius: 999px; }
.auto-goal h3 { font-size: 0.92rem; font-weight: 700; }

.goals-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.goal-card { padding: 28px; display: flex; flex-direction: column; gap: 12px; transition: border-color 0.2s, transform 0.2s; &:hover { border-color: var(--border); } &.completed { border-color: rgba(16,185,129,0.25); background: rgba(16,185,129,0.02); } }
.goal-top { display: flex; justify-content: space-between; align-items: center; }
.goal-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(0,196,255,0.1); color: var(--accent); &.done { background: rgba(16,185,129,0.12); color: var(--green); } }
.goal-pct { font-size: 1.6rem; font-weight: 900; letter-spacing: -0.03em; }
.goal-card h3 { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
.goal-sub { font-size: 0.8rem; color: var(--text-muted); }
.goal-progress-wrap { display: flex; flex-direction: column; gap: 8px; }
.progress-bar { width: 100%; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }
.progress-text { font-size: 0.72rem; color: var(--text-muted); flex: 1; text-align: center; }
.goal-quick-actions { display: flex; align-items: center; gap: 8px; }
.quick-btn {
  width: 22px; height: 22px; border-radius: 6px; background: rgba(255,255,255,0.04); border: 1px solid var(--border-card);
  color: var(--text-secondary); font-size: 0.9rem; line-height: 1; display: flex; align-items: center; justify-content: center;
  &:hover { border-color: var(--border); color: var(--text-primary); }
}
.goal-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 4px; }
.goal-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 600; &.done { background: rgba(16,185,129,0.1); color: var(--green); border: 1px solid rgba(16,185,129,0.2); } &.ongoing { background: rgba(0,196,255,0.08); color: var(--accent); border: 1px solid var(--border); } }
.manage-actions { display: flex; gap: 6px; }
.icon-btn { width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); &:hover { background: rgba(255,255,255,0.06); color: var(--text-secondary); } &.danger:hover { background: rgba(239,68,68,0.1); color: var(--red); } }

.add-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; min-height: 160px; background: rgba(255,255,255,0.02); border: 2px dashed rgba(255,255,255,0.08); cursor: pointer; color: var(--text-muted); font-size: 0.88rem; transition: all 0.2s; &:hover { border-color: var(--border); color: var(--accent); background: var(--accent-10); } }

.goals-summary { display: flex; align-items: center; gap: 0; padding: 24px 32px; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: var(--radius-lg); justify-content: center; }
.summary-item { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 0 40px; }
.summary-item span { font-size: 0.78rem; color: var(--text-muted); font-weight: 500; }
.sum-circle { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 900; &.done { background: rgba(16,185,129,0.12); color: var(--green); border: 2px solid rgba(16,185,129,0.25); } &.active { background: rgba(0,196,255,0.1); color: var(--accent); border: 2px solid var(--border); } &.total { background: rgba(124,58,237,0.1); color: var(--violet); border: 2px solid rgba(124,58,237,0.2); } }
.sum-divider { width: 1px; height: 48px; background: var(--border-card); }

@media (max-width: 768px) { .goals-grid, .auto-goals-row { grid-template-columns: 1fr; } }
  `]
})
export class MetasComponent {
  goals = computed(() => this.goalsService.goals$());

  /** Metas calculadas ao vivo a partir da atividade real (flashcards revisados hoje, streak) — nada fictício. */
  autoGoals = computed<AutoGoal[]>(() => {
    const settings = this.authService.currentUser()?.settings;
    const dailyGoal = settings?.dailyGoalCards ?? 20;
    const reviewedToday = this.flashcardsService.cardsReviewedToday();
    const streak = this.flashcardsService.streak();

    return [
      {
        title: 'Flashcards revisados hoje',
        subtitle: `Meta diária: ${dailyGoal} cards (ajustável em Configurações)`,
        progress: dailyGoal > 0 ? Math.min(100, Math.round((reviewedToday / dailyGoal) * 100)) : 0,
      },
      {
        title: 'Manter uma sequência de estudos',
        subtitle: `${streak} dia(s) seguido(s) — meta de 30 dias`,
        progress: Math.min(100, Math.round((streak / 30) * 100)),
      },
    ];
  });

  showForm = signal(false);
  editingId = signal<string | null>(null);
  formTitle = '';
  formSubtitle = '';
  formProgress = 0;
  formError = signal('');

  constructor(
    public goalsService: GoalsService,
    private flashcardsService: FlashcardsService,
    private authService: AuthService,
  ) {}

  getColorByProgress(progress: number): string {
    if (progress >= 100) return 'var(--green)';
    if (progress >= 75) return 'var(--green)';
    if (progress >= 40) return 'var(--accent)';
    return 'var(--amber)';
  }

  progressGradient(progress: number): string {
    if (progress >= 100) return 'var(--green)';
    if (progress >= 75) return 'linear-gradient(90deg,var(--green),#34d399)';
    return 'linear-gradient(90deg,#0080d0,var(--accent))';
  }

  openCreateForm() {
    this.editingId.set(null);
    this.formTitle = '';
    this.formSubtitle = '';
    this.formProgress = 0;
    this.formError.set('');
    this.showForm.set(true);
  }

  openEditForm(goal: { id: string; title: string; subtitle: string; progress: number }) {
    this.editingId.set(goal.id);
    this.formTitle = goal.title;
    this.formSubtitle = goal.subtitle;
    this.formProgress = goal.progress;
    this.formError.set('');
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); }

  saveForm() {
    if (!this.formTitle.trim()) {
      this.formError.set('Dê um título para a meta.');
      return;
    }
    const input: GoalInput = { title: this.formTitle, subtitle: this.formSubtitle, progress: this.formProgress };
    if (this.editingId()) this.goalsService.update(this.editingId()!, input);
    else this.goalsService.create(input);
    this.showForm.set(false);
  }

  deleteGoal(id: string) {
    if (confirm('Excluir esta meta? Essa ação não pode ser desfeita.')) {
      this.goalsService.delete(id);
    }
  }
}
