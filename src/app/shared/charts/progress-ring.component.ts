import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Anel de progresso circular. Útil para metas, módulos e conclusão de tarefas.
 *
 * Uso:
 * <redamind-progress-ring [progress]="79" color="var(--accent)" [size]="64">
 *   79%
 * </redamind-progress-ring>
 */
@Component({
  selector: 'redamind-progress-ring',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="rc-ring-wrap" [style.width.px]="size" [style.height.px]="size">
  <svg [attr.viewBox]="'0 0 ' + size + ' ' + size" class="rc-ring-svg">
    <circle [attr.cx]="size / 2" [attr.cy]="size / 2" [attr.r]="radius"
            fill="none" stroke="rgba(255,255,255,0.06)" [attr.stroke-width]="strokeWidth"/>
    <circle [attr.cx]="size / 2" [attr.cy]="size / 2" [attr.r]="radius"
            fill="none" [attr.stroke]="color" [attr.stroke-width]="strokeWidth"
            stroke-linecap="round"
            [attr.stroke-dasharray]="circumference"
            [attr.stroke-dashoffset]="dashOffset"
            [attr.transform]="'rotate(-90 ' + size / 2 + ' ' + size / 2 + ')'"/>
  </svg>
  <div class="rc-ring-content">
    <ng-content></ng-content>
  </div>
</div>
  `,
  styles: [`
.rc-ring-wrap { position: relative; display: inline-flex; align-items: center; justify-content: center; }
.rc-ring-svg { width: 100%; height: 100%; display: block; }
.rc-ring-content { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-weight: 700; }
  `]
})
export class ProgressRingComponent implements OnChanges, OnInit {
  /** Progresso de 0 a 100. */
  @Input() progress = 0;
  @Input() size = 64;
  @Input() strokeWidth = 8;
  @Input() color = 'var(--accent)';

  radius = 28;
  circumference = 0;
  dashOffset = 0;

  ngOnInit() { this.build(); }
  ngOnChanges() { this.build(); }

  private build() {
    this.radius = (this.size - this.strokeWidth) / 2;
    this.circumference = 2 * Math.PI * this.radius;
    const pct = Math.max(0, Math.min(100, this.progress)) / 100;
    this.dashOffset = this.circumference * (1 - pct);
  }
}
