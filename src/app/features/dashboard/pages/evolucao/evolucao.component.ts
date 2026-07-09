import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../../core/services/data.service';
import { FlashcardsService } from '../../../../core/services/flashcards.service';
import { LineChartComponent } from '../../../../shared/charts/line-chart.component';
import { BarChartComponent, BarChartItem } from '../../../../shared/charts/bar-chart.component';
import { MultiLineChartComponent, ChartSeries } from '../../../../shared/charts/multi-line-chart.component';

@Component({
  selector: 'app-evolucao',
  standalone: true,
  imports: [CommonModule, LineChartComponent, BarChartComponent, MultiLineChartComponent],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <p class="eyebrow">EVOLUÇÃO</p>
      <h1>Sua jornada em <span class="highlight">números</span></h1>
    </div>
  </div>

  <!-- Top row charts -->
  <div class="charts-top">
    <!-- Nota evolution line chart -->
    <div class="chart-card card">
      <div class="chart-header">
        <h3>Evolução da nota</h3>
        <span class="trend-badge positive">+{{ gradeGain }} pts em {{ grades.length }} semanas</span>
      </div>
      <redamind-line-chart [data]="grades" [labels]="weekLabels" [height]="160" [width]="440"
                            [max]="1000" [min]="0" color="var(--accent)">
      </redamind-line-chart>
    </div>

    <!-- Study time bar chart -->
    <div class="chart-card card">
      <div class="chart-header">
        <h3>Tempo estudado</h3>
        <span class="sub-label">horas/semana</span>
      </div>
      <div class="bar-chart-container">
        <redamind-bar-chart [data]="studyBars" color="rgba(124,58,237,0.6)"
                             [highlightLast]="true" highlightColor="var(--accent)"
                             [width]="220" [height]="140">
        </redamind-bar-chart>
      </div>
    </div>
  </div>

  <!-- Competências multi-line chart -->
  <div class="chart-card card full-width">
    <div class="chart-header">
      <h3>Evolução por competência</h3>
    </div>
    <div class="multiline-container">
      <redamind-multi-line-chart [series]="compSeries" [xLabels]="compWeekLabels"
                                  [width]="800" [height]="180" [max]="200">
      </redamind-multi-line-chart>
    </div>
  </div>

  <!-- Summary stats row -->
  <div class="summary-row">
    @for (stat of summaryStats(); track stat.label) {
      <div class="summary-card card">
        <div class="sum-icon" [style.background]="stat.iconBg" [style.color]="stat.color">
          <span [innerHTML]="stat.icon"></span>
        </div>
        <div class="sum-body">
          <span class="sum-val" [style.color]="stat.color">{{ stat.value }}</span>
          <span class="sum-label">{{ stat.label }}</span>
        </div>
      </div>
    }
  </div>
</div>
  `,
  styles: [`
.page { max-width: 1200px; margin: 0 auto; animation: fadeIn 0.4s ease; display: flex; flex-direction: column; gap: 24px; }
.eyebrow { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; color: var(--accent); text-transform: uppercase; margin-bottom: 8px; }
h1 { font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em; }

.charts-top { display: grid; grid-template-columns: 1.6fr 1fr; gap: 20px; }
.chart-card { padding: 24px; }
.chart-card.full-width { }
.chart-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 8px; }
.chart-header h3 { font-size: 0.95rem; font-weight: 700; }
.sub-label { font-size: 0.75rem; color: var(--text-muted); }
.trend-badge.positive { padding: 4px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; background: rgba(16,185,129,0.12); color: var(--green); border: 1px solid rgba(16,185,129,0.2); }

.bar-chart-container { }

.summary-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.summary-card { padding: 20px; display: flex; align-items: center; gap: 14px; }
.sum-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
.sum-body { display: flex; flex-direction: column; gap: 2px; }
.sum-val { font-size: 1.4rem; font-weight: 800; line-height: 1.1; }
.sum-label { font-size: 0.72rem; color: var(--text-muted); font-weight: 500; }

@media (max-width: 1024px) { .charts-top { grid-template-columns: 1fr; } .summary-row { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 640px)  { .summary-row { grid-template-columns: 1fr 1fr; } }
  `]
})
export class EvolucaoComponent implements OnInit {
  grades: number[] = [];
  weekLabels: string[] = [];
  gradeGain = 0;

  studyBars: BarChartItem[] = [];

  compSeries: ChartSeries[] = [];
  compWeekLabels: string[] = [];

  // NOTA: "Nota mais alta" continua sendo exemplo — não há motor de correção de
  // redação por IA neste projeto ainda. Os outros 3 cards já são 100% reais.
  summaryStats = computed(() => [
    { label: 'Flashcards revisados', value: `${this.flashcardsService.totalReviews()}`, icon: '✏️', color: 'var(--accent)', iconBg: 'rgba(0,196,255,0.1)' },
    { label: 'Nota mais alta (exemplo)', value: '920', icon: '🏆', color: 'var(--amber)', iconBg: 'rgba(245,158,11,0.1)' },
    { label: 'Streak atual', value: `${this.flashcardsService.streak()} dia(s)`, icon: '🔥', color: '#ff8040', iconBg: 'rgba(255,100,0,0.1)' },
    { label: 'Estudado nesta semana', value: `${this.flashcardsService.studyMinutesThisWeek()}min`, icon: '⏱️', color: 'var(--violet)', iconBg: 'rgba(124,58,237,0.1)' },
  ]);

  constructor(private dataService: DataService, public flashcardsService: FlashcardsService) {}

  ngOnInit() {
    const evo = this.dataService.getEvolutionData();

    this.grades = evo.gradeHistory;
    this.weekLabels = this.grades.map((_, i) => `S${i + 1}`);
    this.gradeGain = this.grades[this.grades.length - 1] - this.grades[0];

    // Tempo estudado: agora é 100% real, vindo das sessões de revisão de flashcards dos últimos 7 dias.
    const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    this.studyBars = this.flashcardsService.studyMinutesByDay(7).map(({ date, minutes }) => ({
      label: dayLabels[date.getDay()],
      value: minutes,
    }));

    const compMeta: { key: keyof typeof evo.competenciasByWeek; label: string; color: string }[] = [
      { key: 'c1', label: 'C1 Norma', color: '#00c4ff' },
      { key: 'c2', label: 'C2 Tema', color: '#7c3aed' },
      { key: 'c3', label: 'C3 Argum.', color: '#10b981' },
      { key: 'c4', label: 'C4 Coesão', color: '#f59e0b' },
      { key: 'c5', label: 'C5 Interv.', color: '#ef4444' },
    ];
    this.compSeries = compMeta.map(m => ({ label: m.label, color: m.color, data: evo.competenciasByWeek[m.key] }));
    this.compWeekLabels = this.compSeries[0]?.data.map((_, i) => `S${i + 1}`) ?? [];
  }
}
