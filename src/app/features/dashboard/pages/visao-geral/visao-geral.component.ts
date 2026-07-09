import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FlashcardsService } from '../../../../core/services/flashcards.service';
import { LineChartComponent } from '../../../../shared/charts/line-chart.component';
import { RadarChartComponent, RadarAxis } from '../../../../shared/charts/radar-chart.component';

@Component({
  selector: 'app-visao-geral',
  standalone: true,
  imports: [CommonModule, RouterLink, LineChartComponent, RadarChartComponent],
  template: `
<div class="page">
  <!-- Header -->
  <div class="page-header">
    <div>
      <p class="page-eyebrow">Olá, {{ authService.currentUser()?.displayName || 'estudante' }} 👋</p>
      <h1>Sua jornada para a <span class="highlight">aprovação</span></h1>
    </div>
    <a routerLink="/dashboard/desafio-semanal" class="btn-primary">
      Novo desafio →
    </a>
  </div>

  <!-- Stats Row -->
  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-icon fire">🔥</div>
      <div class="stat-body">
        <span class="stat-label">Streak</span>
        <span class="stat-value">{{ flashcardsService.streak() }} dia(s)</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon level">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      </div>
      <div class="stat-body">
        <span class="stat-label">Nível</span>
        <span class="stat-value">Lv. {{ flashcardsService.level() }}</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon redacoes">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </div>
      <div class="stat-body">
        <span class="stat-label">Flashcards revisados</span>
        <span class="stat-value">{{ flashcardsService.totalReviews() }}</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon xp">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
        </svg>
      </div>
      <div class="stat-body">
        <span class="stat-label">XP Total</span>
        <span class="stat-value">{{ flashcardsService.totalXp() | number:'1.0-0' }}</span>
      </div>
    </div>
  </div>

  <!-- Charts Row -->
  <div class="charts-row">
    <!-- Line Chart -->
    <div class="chart-card card">
      <div class="chart-header">
        <div>
          <h3>Evolução da nota</h3>
          <p class="chart-sub">Últimas {{ gradeHistory.length }} semanas</p>
        </div>
        <span class="trend-badge positive">+{{ gradeGain }} pts</span>
      </div>
      <redamind-line-chart [data]="gradeHistory" [labels]="weekLabels" [width]="400" [height]="150"
                            color="var(--accent)">
      </redamind-line-chart>
    </div>

    <!-- Radar Chart -->
    <div class="chart-card card">
      <div class="chart-header">
        <div>
          <h3>Competências ENEM</h3>
          <p class="chart-sub">Última redação</p>
        </div>
      </div>
      <div class="radar-wrap">
        <redamind-radar-chart [axes]="competenciaAxes" color="var(--accent)" [size]="200"></redamind-radar-chart>
      </div>
    </div>
  </div>

  <!-- Action Cards -->
  <div class="actions-row">
    <div class="action-card card">
      <div class="action-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </div>
      <div class="action-body">
        <p class="action-eyebrow">Desafio Semanal</p>
        <h4>Inteligência artificial e o mundo do trabalho</h4>
      </div>
      <a routerLink="/dashboard/desafio-semanal" class="action-link">Iniciar →</a>
    </div>

    <div class="action-card card">
      <div class="action-icon modules">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      </div>
      <div class="action-body">
        <p class="action-eyebrow">Continuar módulo</p>
        <h4>Proposta de intervenção — 82% concluído</h4>
      </div>
      <a routerLink="/dashboard/modulos" class="action-link">Continuar →</a>
    </div>

    <div class="action-card card">
      <div class="action-icon flashcards">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
      </div>
      <div class="action-body">
        <p class="action-eyebrow">Revisão de hoje</p>
        <h4>12 flashcards aguardando — repetição espaçada</h4>
      </div>
      <a routerLink="/dashboard/flashcards" class="action-link">Revisar →</a>
    </div>
  </div>
</div>
  `,
  styles: [`
.page { display: flex; flex-direction: column; gap: 28px; max-width: 1200px; margin: 0 auto; animation: fadeIn 0.4s ease; }

.page-header { display: flex; align-items: flex-end; justify-content: space-between; }
.page-eyebrow { font-size: 0.78rem; color: var(--text-muted); margin-bottom: 4px; font-weight: 500; }
h1 { font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.stat-card {
  display: flex; align-items: center; gap: 14px;
  background: var(--bg-card); border: 1px solid var(--border-card);
  border-radius: var(--radius-md); padding: 18px 20px;
  transition: border-color 0.2s;
  &:hover { border-color: var(--border); }
}
.stat-icon {
  width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center;
  justify-content: center; font-size: 1.1rem; flex-shrink: 0;
  &.fire  { background: rgba(255,100,0,0.12); }
  &.level { background: rgba(245,158,11,0.12); color: var(--amber); }
  &.redacoes { background: rgba(59,130,246,0.12); color: var(--blue); }
  &.xp    { background: rgba(16,185,129,0.12); color: var(--green); }
}
.stat-body { display: flex; flex-direction: column; gap: 2px; }
.stat-label { font-size: 0.72rem; color: var(--text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }
.stat-value { font-size: 1.4rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }

.charts-row { display: grid; grid-template-columns: 1.6fr 1fr; gap: 20px; }
.chart-card { padding: 24px; }
.chart-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.chart-header h3 { font-size: 0.95rem; font-weight: 700; margin-bottom: 3px; }
.chart-sub { font-size: 0.75rem; color: var(--text-muted); }
.trend-badge { padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
.trend-badge.positive { background: rgba(16,185,129,0.12); color: var(--green); border: 1px solid rgba(16,185,129,0.2); }

.radar-wrap { display: flex; align-items: center; justify-content: center; padding: 8px 0; }
.radar-wrap redamind-radar-chart { width: 180px; height: 180px; display: block; }

.actions-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.action-card { padding: 20px; display: flex; flex-direction: column; gap: 14px; cursor: pointer; transition: border-color 0.2s, transform 0.2s; }
.action-card:hover { border-color: var(--border); transform: translateY(-2px); }
.action-icon {
  width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center;
  justify-content: center; background: rgba(0,196,255,0.1); color: var(--accent);
  &.modules { background: rgba(59,130,246,0.1); color: var(--blue); }
  &.flashcards { background: rgba(124,58,237,0.1); color: var(--violet); }
}
.action-body { flex: 1; }
.action-eyebrow { font-size: 0.7rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
.action-card h4 { font-size: 0.88rem; font-weight: 600; color: var(--text-primary); line-height: 1.4; }
.action-link {
  font-size: 0.82rem; font-weight: 600; color: var(--accent);
  display: inline-flex; align-items: center; gap: 4px;
  transition: gap 0.2s;
  text-decoration: none;
  &:hover { gap: 8px; }
}

@media (max-width: 1024px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .charts-row { grid-template-columns: 1fr; }
  .actions-row { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .stats-row { grid-template-columns: 1fr 1fr; }
  .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
}
  `]
})
export class VisaoGeralComponent implements OnInit {
  // NOTA: nota/competências do ENEM continuam sendo dados de EXEMPLO — o app
  // ainda não tem um motor de correção de redação por IA que gere esses
  // números de verdade. Streak, nível, XP e flashcards revisados (acima) já
  // são 100% reais, calculados a partir da atividade registrada no FlashcardsService.
  gradeHistory: number[] = [];
  weekLabels: string[] = [];
  gradeGain = 0;
  competenciaAxes: RadarAxis[] = [];

  private readonly compLabels = ['C1', 'C2', 'C3', 'C4', 'C5'];

  constructor(
    private dataService: DataService,
    public authService: AuthService,
    public flashcardsService: FlashcardsService,
  ) {}

  ngOnInit() {
    const evo = this.dataService.getEvolutionData();
    const exampleStats = this.dataService.getUserStats();

    // Últimas 7 semanas de nota (dado de exemplo, ver nota acima)
    this.gradeHistory = evo.gradeHistory.slice(-7);
    this.weekLabels = this.gradeHistory.map((_, i) => `S${i + 1}`);
    this.gradeGain = this.gradeHistory[this.gradeHistory.length - 1] - this.gradeHistory[0];

    // Competências (0-100 -> fração 0-1 para o radar; dado de exemplo, ver nota acima)
    this.competenciaAxes = exampleStats.competencias.map((v, i) => ({
      label: this.compLabels[i] ?? `C${i + 1}`,
      value: v / 100
    }));
  }
}
