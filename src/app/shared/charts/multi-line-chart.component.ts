import {
  Component, Input, ElementRef, ViewChild, AfterViewInit, OnChanges, OnDestroy, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { resolveCssColor } from './chart-color.util';

export interface ChartSeries {
  label: string;
  color: string;
  data: number[];
}

/**
 * Gráfico com múltiplas séries de linha (ex: evolução por competência),
 * baseado em Chart.js. A legenda é gerada automaticamente a partir das séries.
 *
 * Uso:
 * <redamind-multi-line-chart [series]="[{label:'C1', color:'#00c4ff', data:[120,140,160]}]"
 *                             [xLabels]="['S1','S2','S3']">
 * </redamind-multi-line-chart>
 */
@Component({
  selector: 'redamind-multi-line-chart',
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
export class MultiLineChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() series: ChartSeries[] = [];
  @Input() xLabels: string[] = [];
  @Input() width = 800;
  @Input() height = 180;
  @Input() max?: number;
  @Input() showLegend = true;
  @Input() showGrid = true;

  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  constructor(private zone: NgZone) {}

  // Fora da zone do Angular — ver nota de performance no line-chart.component.ts.
  ngAfterViewInit() { this.zone.runOutsideAngular(() => this.createChart()); }
  ngOnChanges() { if (this.chart) this.zone.runOutsideAngular(() => this.updateChart()); }
  ngOnDestroy() { this.chart?.destroy(); }

  private buildDatasets(el: HTMLElement) {
    return this.series.map(s => {
      const color = resolveCssColor(s.color, el);
      return {
        label: s.label,
        data: s.data,
        borderColor: color,
        backgroundColor: color,
        pointBackgroundColor: color,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
      };
    });
  }

  private createChart() {
    const el = this.canvasRef.nativeElement;
    const ctx = el.getContext('2d')!;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: { labels: this.xLabels, datasets: this.buildDatasets(el) },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 650, easing: 'easeOutQuart' },
        plugins: {
          legend: {
            display: this.showLegend,
            position: 'bottom',
            labels: { color: 'rgba(203,213,225,0.85)', boxWidth: 8, boxHeight: 8, font: { size: 11 }, usePointStyle: true }
          },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          y: {
            max: this.max,
            grid: { display: this.showGrid, color: 'rgba(255,255,255,0.06)' },
            ticks: { color: 'rgba(148,163,184,0.6)', font: { size: 9 } }
          },
          x: {
            grid: { display: false },
            ticks: { color: 'rgba(148,163,184,0.6)', font: { size: 9 } }
          }
        }
      }
    });
  }

  private updateChart() {
    if (!this.chart) return;
    const el = this.canvasRef.nativeElement;
    this.chart.data.labels = this.xLabels;
    this.chart.data.datasets = this.buildDatasets(el) as any;
    const scaleY = this.chart.options.scales?.['y'];
    if (scaleY) (scaleY as any).max = this.max;
    this.chart.update();
  }
}
