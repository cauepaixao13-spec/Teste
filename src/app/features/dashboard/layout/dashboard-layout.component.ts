import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../../../core/services/auth.service';
import { FlashcardsService } from '../../../core/services/flashcards.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent],
  template: `
<div class="dashboard-shell">
  <!-- Backdrop escurecido atrás da gaveta mobile; clicar nele fecha o menu -->
  @if (mobileNavOpen()) {
    <div class="mobile-backdrop" (click)="mobileNavOpen.set(false)"></div>
  }

  <app-sidebar [mobileOpen]="mobileNavOpen()" (closeMobile)="mobileNavOpen.set(false)" />

  <div class="main-area">
    <header class="topbar">
      <div class="topbar-left">
        <!-- Botão de hambúrguer: some no desktop, aparece só em telas pequenas (ver media query) -->
        <button class="hamburger-btn" type="button" aria-label="Abrir menu" (click)="mobileNavOpen.set(true)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <span class="topbar-greeting">Olá, {{ authService.currentUser()?.displayName || 'estudante' }} 👋</span>
      </div>
      <div class="topbar-right">
        <div class="xp-pill">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          {{ flashcardsService.totalXp() | number:'1.0-0' }} XP
        </div>
        <div class="level-pill">Lv. {{ flashcardsService.level() }}</div>
        <button class="logout-btn" (click)="logout()" title="Sair">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </header>
    <div class="page-content">
      <router-outlet />
    </div>
  </div>
</div>
  `,
  styles: [`
.dashboard-shell {
  display: flex; min-height: 100vh;
  background: var(--bg-main);
}
.main-area {
  flex: 1; display: flex; flex-direction: column; min-width: 0;
}
.topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 32px; border-bottom: 1px solid var(--border-card);
  background: rgba(7,12,24,0.6); backdrop-filter: blur(8px);
  position: sticky; top: 0; z-index: 100; height: 56px;
}
.topbar-left { display: flex; align-items: center; gap: 12px; }
.topbar-greeting { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; }
.topbar-right { display: flex; align-items: center; gap: 10px; }

.hamburger-btn {
  display: none; /* só aparece no mobile, ver media query abaixo */
  width: 34px; height: 34px; border-radius: 8px; background: rgba(255,255,255,0.04);
  border: 1px solid var(--border-card); color: var(--text-secondary);
  align-items: center; justify-content: center; flex-shrink: 0;
  &:hover { border-color: var(--border); color: var(--text-primary); }
}

.xp-pill {
  display: flex; align-items: center; gap: 5px;
  padding: 4px 12px; border-radius: 999px;
  background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2);
  color: var(--amber); font-size: 0.78rem; font-weight: 700;
}
.level-pill {
  padding: 4px 12px; border-radius: 999px;
  background: var(--accent-10); border: 1px solid var(--border);
  color: var(--accent); font-size: 0.78rem; font-weight: 700;
}
.logout-btn {
  width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.04);
  border: 1px solid var(--border-card); color: var(--text-muted);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  &:hover { border-color: var(--red); color: var(--red); background: rgba(239,68,68,0.08); }
}
.page-content { flex: 1; overflow-y: auto; padding: 32px; }

.mobile-backdrop {
  display: none;
}

@media (max-width: 768px) {
  .dashboard-shell { flex-direction: column; }
  /* app-sidebar não é mais escondido — ele agora é uma gaveta fixa controlada
     pelo próprio componente via [mobileOpen] (ver sidebar.component.ts) */
  .hamburger-btn { display: flex; }
  .level-pill { display: none; } /* topbar mais enxuta no mobile */
  .page-content { padding: 20px 16px; }

  .mobile-backdrop {
    display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    z-index: 999; animation: fadeIn 0.2s ease;
  }
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class DashboardLayoutComponent {
  /** Controla a gaveta de navegação mobile (irrelevante em telas de desktop). */
  mobileNavOpen = signal(false);

  constructor(public authService: AuthService, public flashcardsService: FlashcardsService, private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
