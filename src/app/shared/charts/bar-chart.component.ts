import {
  Component, Input, ElementRef, ViewChild, AfterViewInit, OnChanges, OnDestroy, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { resolveCssColor } from './chart-color.util';

export interface BarChartItem {
  label: string;
  value: number;
}

/**
 * Gráfico de barras verticais reutilizável, baseado em Chart.js.
 *
 * Uso:
 * <redamind-bar-chart [data]="[{label:'Seg', value:2}, {label:'Ter', value:3.5}]"
 *                      color="var(--violet)" [highlightLast]="true">
 * </redamind-bar-chart>
 */
@Component({
  selector: 'redamind-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="rc-chart-wrap" [style.aspectRatio]="width + ' / ' + height">
  <canvas #canvasRef></canvas>
</div>
  `,
  styles: [`
.rc-chart-wrap { position: relative; width: 100%; }
canvas { width: 100% !important; height: 100% !important; }
  `]
})
export class BarChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() data: BarChartItem[] = [];
  @Input() color = 'rgba(124,58,237,0.6)';
  /** Destaca a última barra com uma cor diferente (ex: dia atual). */
  @Input() highlightLast = false;
  @Input() highlightColor = 'var(--accent)';
  @Input() width = 220;
  @Input() height = 140;
  @Input() showLabels = true;
  /** Espaço entre barras, de 0 (colado) a 1 (bem espaçado). */
  @Input() gap = 0.35;

  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  constructor(private zone: NgZone) {}

  // A criação/atualização roda fora da zone do Angular — ver nota de performance no line-chart.component.ts.
  ngAfterViewInit() { this.zone.runOutsideAngular(() => this.createChart()); }
  ngOnChanges() { if (this.chart) this.zone.runOutsideAngular(() => this.updateChart()); }
  ngOnDestroy() { this.chart?.destroy(); }

  private buildColors(el: HTMLElement): string[] {
    const base = resolveCssColor(this.color, el);
    const highlight = resolveCssColor(this.highlightColor, el);
    return this.data.map((_, i) => (this.highlightLast && i === this.data.length - 1) ? highlight : base);
  }

  private createChart() {
    const el = this.canvasRef.nativeElement;
    const ctx = el.getContext('2d')!;

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.data.map(d => d.label),
        datasets: [{
          data: this.data.map(d => d.value),
          backgroundColor: this.buildColors(el),
          borderRadius: 4,
          barPercentage: 1 - this.gap,
          categoryPercentage: 0.9,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 650, easing: 'easeOutQuart' },
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        scales: {
          y: { display: false, beginAtZero: true },
          x: {
            grid: { display: false },
            ticks: { display: this.showLabels, color: 'rgba(148,163,184,0.6)', font: { size: 9 } }
          }
        }
      }
    });
  }

  private updateChart() {
    if (!this.chart) return;
    const el = this.canvasRef.nativeElement;
    this.chart.data.labels = this.data.map(d => d.label);
    this.chart.data.datasets[0].data = this.data.map(d => d.value);
    this.chart.data.datasets[0].backgroundColor = this.buildColors(el);
    this.chart.update(); // anima da altura antiga pra nova
  }
}
