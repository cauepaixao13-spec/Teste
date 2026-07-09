import {
  Component, Input, ElementRef, ViewChild, AfterViewInit, OnChanges, OnDestroy, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { resolveCssColor, withAlpha } from './chart-color.util';

export interface RadarAxis {
  label: string;
  /** Valor de 0 a 1 (fração do máximo). */
  value: number;
}

/**
 * Gráfico de radar (teia), baseado em Chart.js. Ideal para exibir
 * competências (ex: C1-C5 do ENEM).
 *
 * Uso:
 * <redamind-radar-chart [axes]="[{label:'C1', value:0.9}, {label:'C2', value:0.8}]"></redamind-radar-chart>
 */
@Component({
  selector: 'redamind-radar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="rc-chart-wrap" [style.width.px]="size" [style.height.px]="size">
  <canvas #canvasRef></canvas>
</div>
  `,
  styles: [`
.rc-chart-wrap { position: relative; }
canvas { position: absolute; top: 0; left: 0; width: 100% !important; height: 100% !important; }
  `]
})
export class RadarChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() axes: RadarAxis[] = [];
  @Input() color = 'var(--accent)';
  @Input() size = 200;
  /** Quantidade de anéis de fundo. */
  @Input() ringCount = 5;

  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  constructor(private zone: NgZone) {}

  // Fora da zone do Angular — ver nota de performance no line-chart.component.ts.
  ngAfterViewInit() { this.zone.runOutsideAngular(() => this.createChart()); }
  ngOnChanges() { if (this.chart) this.zone.runOutsideAngular(() => this.updateChart()); }
  ngOnDestroy() { this.chart?.destroy(); }

  private createChart() {
    const el = this.canvasRef.nativeElement;
    const ctx = el.getContext('2d')!;
    const color = resolveCssColor(this.color, el);

    this.chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: this.axes.map(a => a.label),
        datasets: [{
          data: this.axes.map(a => a.value),
          borderColor: color,
          backgroundColor: withAlpha(color, 0.28),
          pointBackgroundColor: color,
          pointRadius: 3,
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 650, easing: 'easeOutQuart' },
        plugins: { legend: { display: false } },
        scales: {
          r: {
            min: 0,
            max: 1,
            ticks: { display: false, count: this.ringCount },
            grid: { color: 'rgba(255,255,255,0.08)' },
            angleLines: { color: 'rgba(255,255,255,0.08)' },
            pointLabels: { color: 'rgba(148,163,184,0.9)', font: { size: 10 } }
          }
        }
      }
    });
  }

  private updateChart() {
    if (!this.chart) return;
    const el = this.canvasRef.nativeElement;
    const color = resolveCssColor(this.color, el);
    this.chart.data.labels = this.axes.map(a => a.label);
    this.chart.data.datasets[0].data = this.axes.map(a => a.value);
    this.chart.data.datasets[0].borderColor = color;
    this.chart.data.datasets[0].backgroundColor = withAlpha(color, 0.28);
    (this.chart.data.datasets[0] as any).pointBackgroundColor = color;
    this.chart.update();
  }
}
