import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Ícone/monograma oficial do Redamind — usado no sidebar, na landing page
 * e como base do favicon (public/favicon.svg é uma cópia estática deste SVG).
 *
 * Uso:
 * <redamind-logo [size]="36"></redamind-logo>
 */
@Component({
  selector: 'redamind-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
<svg [attr.width]="size" [attr.height]="size" viewBox="0 0 40 40" class="rm-logo" [attr.aria-label]="ariaLabel" role="img">
  <defs>
    <linearGradient [attr.id]="gradId" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="var(--accent, #00c4ff)"/>
      <stop offset="100%" stop-color="var(--violet, #7c3aed)"/>
    </linearGradient>
    <linearGradient [attr.id]="glowId" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect x="0" y="0" width="40" height="40" rx="11" [attr.fill]="'url(#' + gradId + ')'"/>
  <rect x="0" y="0" width="40" height="20" rx="11" [attr.fill]="'url(#' + glowId + ')'"/>

  <path d="M13,10.5 V29.5 M13,10.5 H19 A5.2,5.2 0 0 1 19,21 H13 M19.3,21 L27,29.3"
        fill="none" stroke="#ffffff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="27.7" cy="30" r="2.4" fill="#ffffff"/>
</svg>
  `,
  styles: [`
.rm-logo { display: block; flex-shrink: 0; }
  `]
})
export class LogoIconComponent {
  @Input() size = 36;
  @Input() ariaLabel = 'Redamind';

  gradId = `rmLogoGrad${Math.random().toString(36).slice(2, 9)}`;
  glowId = `rmLogoGlow${Math.random().toString(36).slice(2, 9)}`;
}
