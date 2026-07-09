import { Component, signal, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { FlashcardsService } from '../../../core/services/flashcards.service';
import { LogoIconComponent } from '../../../shared/brand/logo-icon.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, LogoIconComponent],
  template: `
<aside class="sidebar" [class.mobile-open]="mobileOpen">
  <!-- Logo -->
  <div class="sidebar-logo">
    <redamind-logo [size]="30"></redamind-logo>
    <span class="logo-text">RedalMind</span>
    <!-- Botão de fechar, visível apenas no menu hambúrguer mobile -->
    <button class="mobile-close-btn" type="button" aria-label="Fechar menu" (click)="closeMobile.emit()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>

  <!-- Nav -->
  <nav class="sidebar-nav">
    @for (item of navItems; track item.path) {
      <a
        [routerLink]="['/dashboard', item.path]"
        routerLinkActive="active"
        class="nav-item"
        [attr.title]="item.label"
        (click)="closeMobile.emit()"
      >
        <span class="nav-icon" [innerHTML]="item.icon"></span>
        <span class="nav-emoji" aria-hidden="true">{{ item.emoji }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </a>
    }
  </nav>

  <!-- Streak bottom bar -->
  <div class="sidebar-bottom">
    <div class="streak-card">
      <div class="streak-icon">🔥</div>
      <div class="streak-info">
        <span class="streak-value">Streak: {{ flashcardsService.streak() }} dia(s)</span>
        <span class="streak-hint">Continue assim para subir de nível!</span>
      </div>
    </div>
    <a routerLink="/dashboard/configuracoes" routerLinkActive="active" class="nav-item config-item" (click)="closeMobile.emit()">
      <span class="nav-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </span>
      <span class="nav-emoji" aria-hidden="true">⚙️</span>
      <span class="nav-label">Configurações</span>
    </a>
  </div>
</aside>
  `,
  styles: [`
.sidebar {
  width: var(--sidebar-w); min-height: 100vh; height: 100%;
  background: var(--bg-sidebar); display: flex; flex-direction: column;
  border-right: 1px solid var(--border-card); position: relative; flex-shrink: 0;
  padding: 20px 12px 12px;
}

.sidebar-logo {
  display: flex; align-items: center; gap: 10px;
  padding: 4px 8px 24px; border-bottom: 1px solid var(--border-card); margin-bottom: 8px;
}
.logo-text { font-weight: 700; font-size: 0.95rem; color: var(--text-primary); }
.mobile-close-btn {
  display: none; margin-left: auto; width: 30px; height: 30px; border-radius: 8px;
  background: rgba(255,255,255,0.04); border: 1px solid var(--border-card); color: var(--text-muted);
  align-items: center; justify-content: center;
}

.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 4px 0; }

.nav-item {
  display: flex; align-items: center; gap: 10px; padding: 9px 12px;
  border-radius: var(--radius-sm); color: var(--text-muted); font-size: 0.85rem; font-weight: 500;
  transition: background 0.15s, color 0.15s; cursor: pointer; text-decoration: none;
  &:hover { background: rgba(255,255,255,0.04); color: var(--text-secondary); }
  &.active {
    background: var(--accent-10); color: var(--accent);
    .nav-icon svg, .nav-icon { color: var(--accent); }
  }
}
.nav-icon { display: flex; align-items: center; flex-shrink: 0; opacity: 0.8; }
.nav-item.active .nav-icon { opacity: 1; }
/* O emoji fica escondido no desktop (já temos ícones em SVG combinando com o tema);
   no mobile, ele assume o lugar do ícone para reforçar o significado de cada opção
   num menu hambúrguer mais "touch-friendly". */
.nav-emoji { display: none; font-size: 1.05rem; flex-shrink: 0; }
.nav-badge {
  margin-left: auto; background: var(--accent); color: var(--bg-dark);
  font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 999px;
}

.sidebar-bottom {
  border-top: 1px solid var(--border-card); padding-top: 12px; display: flex; flex-direction: column; gap: 4px;
}
.streak-card {
  display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px;
  border-radius: var(--radius-sm); background: rgba(255,100,0,0.06);
  border: 1px solid rgba(255,100,0,0.12); margin-bottom: 4px;
}
.streak-icon { font-size: 1rem; flex-shrink: 0; }
.streak-info { display: flex; flex-direction: column; gap: 2px; }
.streak-value { font-size: 0.8rem; font-weight: 700; color: #ff8040; }
.streak-hint { font-size: 0.68rem; color: var(--text-muted); line-height: 1.3; }
.config-item { }

/* ===== Menu hambúrguer mobile =====
   Abaixo de 768px o sidebar vira uma gaveta (drawer) fixa que fica fora da tela
   (translateX -100%) até o usuário abrir pelo botão de hambúrguer no topbar.
   O dashboard-layout controla o estado via [mobileOpen] e escuta (closeMobile). */
@media (max-width: 768px) {
  .sidebar {
    position: fixed; top: 0; left: 0; z-index: 1000; width: 78vw; max-width: 300px;
    transform: translateX(-100%); transition: transform 0.28s ease;
    box-shadow: 0 0 40px rgba(0,0,0,0.5);
  }
  .sidebar.mobile-open { transform: translateX(0); }
  .mobile-close-btn { display: flex; }
  .nav-icon { display: none; }
  .nav-emoji { display: inline-flex; }
  .nav-item { padding: 12px; font-size: 0.92rem; }
}
  `]
})
export class SidebarComponent {
  /** Controla se a gaveta mobile está aberta (ignorado em telas de desktop). */
  @Input() mobileOpen = false;
  /** Disparado ao clicar no X, num item de navegação, ou no backdrop — o layout pai fecha o menu. */
  @Output() closeMobile = new EventEmitter<void>();

  navItems = [
    {
      path: 'visao-geral', label: 'Visão geral', emoji: '🏠',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
             </svg>`
    },
    {
      path: 'desafio-semanal', label: 'Desafio Semanal', emoji: '🏆',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
             </svg>`
    },
    {
      path: 'modulos', label: 'Módulos', emoji: '📘',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
             </svg>`
    },
    {
      path: 'flashcards', label: 'Flashcards', emoji: '🃏',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
             </svg>`
    },
    {
      path: 'evolucao', label: 'Evolução', emoji: '📈',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
             </svg>`
    },
    {
      path: 'metas', label: 'Metas', emoji: '🎯',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
             </svg>`
    },
    {
      path: 'ranking', label: 'Ranking', emoji: '🥇',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
              <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
             </svg>`
    },
  ];

  constructor(private authService: AuthService, public flashcardsService: FlashcardsService) {}
}

