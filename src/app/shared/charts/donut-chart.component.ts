import {
  Component, Input, ElementRef, ViewChild, AfterViewInit, OnChanges, OnDestroy, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { resolveCssColor } from './chart-color.util';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

/**
 * Gráfico de rosca (donut) para proporções/distribuições, baseado em Chart.js.
 * Aceita conteúdo projetado (`<ng-content>`) centralizado por cima do gráfico
 * — útil para mostrar um percentual ou total no meio da rosca.
 *
 * Uso:
 * <redamind-donut-chart [segments]="[{label:'Concluído', value:70, color:'var(--green)'},
 *                                     {label:'Restante', value:30, color:'rgba(255,255,255,0.08)'}]">
 *   <span>70%</span>
 * </redamind-donut-chart>
 */
@Component({
  selector: 'redamind-donut-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="rc-donut-wrap" [style.width.px]="size" [style.height.px]="size">
  <canvas #canvasRef></canvas>
  <div class="rc-donut-content"><ng-content></ng-content></div>
</div>
  `,
  styles: [`
.rc-donut-wrap { position: relative; display: inline-flex; align-items: center; justify-content: center; }
canvas { width: 100% !important; height: 100% !important; }
.rc-donut-content { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
  `]
})
export class DonutChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() segments: DonutSegment[] = [];
  @Input() size = 160;
  @Input() strokeWidth = 20;

  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  constructor(private zone: NgZone) {}

  // Fora da zone do Angular — ver nota de performance no line-chart.component.ts.
  ngAfterViewInit() { this.zone.runOutsideAngular(() => this.createChart()); }
  ngOnChanges() { if (this.chart) this.zone.runOutsideAngular(() => this.updateChart()); }
  ngOnDestroy() { this.chart?.destroy(); }

  /** Converte a espessura do anel (em px) num "cutout" percentual, que é como o Chart.js define o furo do donut. */
  private get cutout(): string {
    const pct = Math.max(10, 100 - (this.strokeWidth / (this.size / 2)) * 100);
    return `${pct}%`;
  }

  private buildColors(el: HTMLElement): string[] {
    return this.segments.map(s => resolveCssColor(s.color, el));
  }

  private createChart() {
    const el = this.canvasRef.nativeElement;
    const ctx = el.getContext('2d')!;

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.segments.map(s => s.label),
        datasets: [{
          data: this.segments.map(s => s.value),
          backgroundColor: this.buildColors(el),
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: this.cutout,
        animation: { duration: 650, easing: 'easeOutQuart' },
        plugins: { legend: { display: false }, tooltip: { enabled: true } }
      }
    });
  }

  private updateChart() {
    if (!this.chart) return;
    const el = this.canvasRef.nativeElement;
    this.chart.data.labels = this.segments.map(s => s.label);
    this.chart.data.datasets[0].data = this.segments.map(s => s.value);
    this.chart.data.datasets[0].backgroundColor = this.buildColors(el);
    this.chart.options.cutout = this.cutout;
    this.chart.update();
  }
}
