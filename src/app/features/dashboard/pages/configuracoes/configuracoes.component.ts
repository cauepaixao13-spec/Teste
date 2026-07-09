import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { FlashcardsService } from '../../../../core/services/flashcards.service';
import { GoalsService } from '../../../../core/services/goals.service';
import { PLANOS, PlanId, UserSettings } from '../../../../core/models/user.model';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <h1>Configurações</h1>
      <p class="page-sub">Preferências de conta, notificações e tema.</p>
    </div>
  </div>

  <div class="config-grid">
    <!-- Perfil -->
    <div class="config-section card">
      <h2 class="section-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        Perfil
      </h2>
      <div class="config-row">
        <label>Nome</label>
        <div class="config-input-wrap"><input type="text" [value]="user()?.displayName" readonly class="config-input" /></div>
      </div>
      <div class="config-row">
        <label>Email</label>
        <div class="config-input-wrap"><input type="email" [value]="user()?.email" readonly class="config-input" /></div>
      </div>
      <div class="config-row">
        <label>Plano</label>
        <select class="config-select" [ngModel]="user()?.plan" (ngModelChange)="onPlanChange($event)">
          @for (plano of planos; track plano.id) {
            <option [ngValue]="plano.id">{{ plano.label }}</option>
          }
        </select>
      </div>
    </div>

    <!-- Notificações -->
    <div class="config-section card">
      <h2 class="section-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        Notificações
      </h2>
      @for (notif of notifOptions; track notif.key) {
        <div class="config-row toggle-row">
          <div class="toggle-info">
            <span class="toggle-label">{{ notif.label }}</span>
            <span class="toggle-desc">{{ notif.desc }}</span>
          </div>
          <button class="toggle-switch" [class.on]="user()?.settings?.notifications?.[notif.key]" (click)="toggleNotification(notif.key)">
            <span class="toggle-thumb"></span>
          </button>
        </div>
      }
    </div>

    <!-- Aparência -->
    <div class="config-section card">
      <h2 class="section-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
        </svg>
        Aparência
      </h2>
      <div class="theme-options">
        @for (theme of themes; track theme.id) {
          <div class="theme-option" [class.active]="user()?.settings?.theme === theme.id" (click)="setTheme(theme.id)">
            <div class="theme-preview" [style.background]="theme.preview"></div>
            <span>{{ theme.label }}</span>
            @if (user()?.settings?.theme === theme.id) {
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            }
          </div>
        }
      </div>
    </div>

    <!-- Estudo -->
    <div class="config-section card">
      <h2 class="section-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        Estudo
      </h2>
      <div class="config-row">
        <label>Meta diária de flashcards</label>
        <select class="config-select" [ngModel]="user()?.settings?.dailyGoalCards" (ngModelChange)="updateSetting('dailyGoalCards', $event)">
          <option [ngValue]="10">10 cards</option>
          <option [ngValue]="20">20 cards</option>
          <option [ngValue]="30">30 cards</option>
          <option [ngValue]="50">50 cards</option>
        </select>
      </div>
      <div class="config-row">
        <label>Meta semanal de redações</label>
        <select class="config-select" [ngModel]="user()?.settings?.weeklyGoalEssays" (ngModelChange)="updateSetting('weeklyGoalEssays', $event)">
          <option [ngValue]="1">1 redação</option>
          <option [ngValue]="2">2 redações</option>
          <option [ngValue]="3">3 redações</option>
        </select>
      </div>
      <div class="config-row">
        <label>Tempo de sessão preferido</label>
        <select class="config-select" [ngModel]="user()?.settings?.sessionMinutes" (ngModelChange)="updateSetting('sessionMinutes', $event)">
          <option [ngValue]="15">15 minutos</option>
          <option [ngValue]="30">30 minutos</option>
          <option [ngValue]="45">45 minutos</option>
          <option [ngValue]="60">1 hora</option>
        </select>
      </div>
    </div>
  </div>

  <!-- Zona de perigo -->
  <div class="danger-zone">
    <h3>Zona de perigo</h3>
    <p>Estas ações são irreversíveis. Proceda com cautela.</p>
    <div class="danger-actions">
      <button class="danger-btn soft" (click)="resetProgress()">Resetar progresso</button>
      <button class="danger-btn hard" (click)="deleteAccount()">Excluir conta</button>
    </div>
  </div>
</div>
  `,
  styles: [`
.page { max-width: 900px; margin: 0 auto; animation: fadeIn 0.4s ease; display: flex; flex-direction: column; gap: 24px; }
h1 { font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em; }
.page-sub { font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; }

.config-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.config-section { padding: 28px; }
.section-title { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.06em; }
.config-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-card); gap: 16px; &:last-child { border-bottom: none; } }
.config-row label { font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; }
.config-input-wrap { flex-shrink: 0; }
.config-input { background: rgba(255,255,255,0.04); border: 1px solid var(--border-card); border-radius: 6px; padding: 7px 12px; font-size: 0.83rem; color: var(--text-primary); min-width: 180px; }
.config-select { background: rgba(255,255,255,0.04); border: 1px solid var(--border-card); border-radius: 6px; padding: 7px 12px; font-size: 0.83rem; color: var(--text-primary); cursor: pointer; }
.toggle-row { align-items: center; }
.toggle-info { display: flex; flex-direction: column; gap: 2px; }
.toggle-label { font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; }
.toggle-desc { font-size: 0.75rem; color: var(--text-muted); }
.toggle-switch { width: 40px; height: 22px; border-radius: 999px; position: relative; cursor: pointer; flex-shrink: 0; background: rgba(255,255,255,0.1); border: 1px solid var(--border-card); transition: all 0.25s; &.on { background: var(--accent); border-color: var(--accent); } }
.toggle-thumb { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: white; transition: transform 0.25s; display: block; .toggle-switch.on & { transform: translateX(18px); } }

.theme-options { display: flex; flex-direction: column; gap: 8px; }
.theme-option { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: var(--radius-sm); cursor: pointer; border: 1px solid transparent; transition: all 0.2s; font-size: 0.85rem; color: var(--text-secondary); &:hover { background: rgba(255,255,255,0.04); border-color: var(--border-card); } &.active { border-color: var(--border); color: var(--text-primary); background: var(--accent-10); } }
.theme-preview { width: 28px; height: 28px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); flex-shrink: 0; }

.danger-zone { padding: 24px 28px; background: rgba(239,68,68,0.04); border: 1px solid rgba(239,68,68,0.15); border-radius: var(--radius-lg); }
.danger-zone h3 { font-size: 0.88rem; font-weight: 700; color: var(--red); margin-bottom: 6px; }
.danger-zone p { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 16px; }
.danger-actions { display: flex; gap: 12px; }
.danger-btn { padding: 8px 18px; border-radius: var(--radius-sm); font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s; &.soft { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: var(--red); &:hover { background: rgba(239,68,68,0.15); } } &.hard { background: var(--red); border: 1px solid var(--red); color: white; &:hover { opacity: 0.85; } } }

@media (max-width: 768px) { .config-grid { grid-template-columns: 1fr; } }
  `]
})
export class ConfiguracoesComponent {
  user = this.authService.currentUser;
  planos = PLANOS;

  notifOptions: { key: keyof UserSettings['notifications']; label: string; desc: string }[] = [
    { key: 'desafioSemanal', label: 'Desafio semanal', desc: 'Lembre-me quando um novo desafio estiver disponível' },
    { key: 'revisaoFlashcards', label: 'Revisão de flashcards', desc: 'Notifique quando houver cards para revisar' },
    { key: 'streakEmRisco', label: 'Streak em risco', desc: 'Avise quando meu streak estiver prestes a quebrar' },
    { key: 'rankingSemanal', label: 'Ranking semanal', desc: 'Resumo do meu desempenho no ranking' },
  ];

  themes: { id: UserSettings['theme']; label: string; preview: string }[] = [
    { id: 'dark', label: 'Escuro (padrão)', preview: 'linear-gradient(135deg, #070c18, #0a0f1e)' },
    { id: 'midnight', label: 'Meia-noite', preview: 'linear-gradient(135deg, #030308, #07070f)' },
    { id: 'navy', label: 'Naval', preview: 'linear-gradient(135deg, #050a14, #0a1830)' },
  ];

  constructor(
    private authService: AuthService,
    private flashcardsService: FlashcardsService,
    private goalsService: GoalsService,
    private router: Router,
  ) {}

  onPlanChange(plan: PlanId) {
    this.authService.updatePlan(plan);
  }

  toggleNotification(key: keyof UserSettings['notifications']) {
    const current = this.user()?.settings.notifications;
    if (!current) return;
    this.authService.updateSettings({ notifications: { ...current, [key]: !current[key] } });
  }

  setTheme(theme: UserSettings['theme']) {
    this.authService.updateSettings({ theme });
  }

  updateSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
    this.authService.updateSettings({ [key]: value } as Partial<UserSettings>);
  }

  resetProgress() {
    if (confirm('Isso vai zerar seu streak, o progresso de revisão dos flashcards e o percentual das suas metas — mas não vai excluir os flashcards/metas em si. Continuar?')) {
      this.flashcardsService.resetProgress();
      this.goalsService.resetProgress();
    }
  }

  deleteAccount() {
    if (confirm('Isso vai excluir permanentemente sua conta e todos os seus dados (flashcards, metas, progresso). Essa ação NÃO pode ser desfeita. Tem certeza?')) {
      this.authService.deleteAccount();
      this.router.navigate(['/']);
    }
  }
}
