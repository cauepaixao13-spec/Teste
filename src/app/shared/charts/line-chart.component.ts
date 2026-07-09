import {
  Component, Input, ElementRef, ViewChild, AfterViewInit, OnChanges,
  OnDestroy, SimpleChanges, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { resolveCssColor } from './chart-color.util';

/**
 * Gráfico de linha reutilizável, baseado em Chart.js.
 *
 * Toda vez que `data`/`labels` mudam (via ngOnChanges), o gráfico existente
 * é atualizado (não recriado) — isso é o que dá a transição suave entre
 * um valor e outro, de graça, pelo próprio motor de animação do Chart.js.
 *
 * IMPORTANTE — performance: o Chart.js anima via `requestAnimationFrame`.
 * Como o Angular usa Zone.js, qualquer `requestAnimationFrame` dispararia,
 * por padrão, uma verificação de mudanças (change detection) da árvore
 * INTEIRA do app a cada frame — em páginas com vários gráficos ao mesmo
 * tempo isso trava a UI. Por isso, criação/atualização do Chart.js sempre
 * rodam dentro de `ngZone.runOutsideAngular()`: o canvas continua sendo
 * pintado normalmente (é desenho imperativo, não binding do Angular), só
 * que sem gerar milhares de ciclos de CD desnecessários.
 *
 * Uso:
 * <redamind-line-chart [data]="[420, 540, 600, 680]" [labels]="['S1','S2','S3','S4']" color="var(--accent)">
 * </redamind-line-chart>
 */
@Component({
  selector: 'redamind-line-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="rc-chart-wrap" [style.aspectRatio]="width + ' / ' + height">
  <canvas #canvasRef></canvas>
</div>
  `,
  styles: [`
.rc-chart-wrap { position: relative; width: 100%; }
canvas { position: absolute; top: 0; left: 0; width: 100% !important; height: 100% !important; }
  `]
})
export class LineChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() data: number[] = [];
  @Input() labels: string[] = [];
  @Input() color = 'var(--accent)';
  /** Usado apenas para calcular a proporção (aspect-ratio) do container — o canvas em si é responsivo. */
  @Input() width = 440;
  @Input() height = 160;
  @Input() min?: number;
  @Input() max?: number;
  @Input() showArea = true;
  @Input() showDots = true;
  @Input() showGrid = true;
  @Input() formatY: (v: number) => string = (v) => `${Math.round(v)}`;

  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  constructor(private zone: NgZone) {}

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => this.createChart());
  }

  ngOnChanges(changes: SimpleChanges) {
    // Se o gráfico ainda não foi criado (primeira rodada de bindings antes do
    // ngAfterViewInit), não faz nada — ele já vai nascer com os dados certos.
    if (!this.chart) return;
    this.zone.runOutsideAngular(() => this.updateChart());
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  private createChart() {
    const el = this.canvasRef.nativeElement;
    const resolvedColor = resolveCssColor(this.color, el);
    const ctx = el.getContext('2d')!;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [{
          data: this.data,
          borderColor: resolvedColor,
          backgroundColor: this.showArea ? this.buildGradient(ctx, resolvedColor) : 'transparent',
          fill: this.showArea,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: this.showDots ? 3.5 : 0,
          pointBackgroundColor: resolvedColor,
          pointBorderColor: 'transparent',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 650, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          y: {
            min: this.min,
            max: this.max,
            grid: { display: this.showGrid, color: 'rgba(255,255,255,0.06)' },
            ticks: { callback: (v) => this.formatY(Number(v)), color: 'rgba(148,163,184,0.6)', font: { size: 9 } }
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
    const resolvedColor = resolveCssColor(this.color, el);

    this.chart.data.labels = this.labels;
    this.chart.data.datasets[0].data = this.data;
    this.chart.data.datasets[0].borderColor = resolvedColor;
    (this.chart.data.datasets[0] as any).pointBackgroundColor = resolvedColor;

    const scaleY = this.chart.options.scales?.['y'];
    if (scaleY) { (scaleY as any).min = this.min; (scaleY as any).max = this.max; }

    this.chart.update(); // dispara a animação de transição entre os valores antigos e os novos
  }

  private buildGradient(ctx: CanvasRenderingContext2D, color: string) {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, this.withAlpha(color, 0.32));
    gradient.addColorStop(1, this.withAlpha(color, 0));
    return gradient;
  }

  private withAlpha(color: string, alpha: number): string {
    if (color.startsWith('#')) {
      let hex = color.slice(1);
      if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  }
}
