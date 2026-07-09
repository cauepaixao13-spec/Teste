import { Component, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { LogoIconComponent } from '../../../shared/brand/logo-icon.component';
import { PLANOS, PlanId } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, LogoIconComponent],
  template: `
<div class="register-page">
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="grid-bg"></div>

  <a routerLink="/" class="back-link">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
    Voltar
  </a>

  <div class="register-card">
    <div class="register-logo">
      <redamind-logo [size]="32"></redamind-logo>
      <span>RedalMind</span>
    </div>

    <h1>Crie sua conta</h1>
    <p class="register-sub">Leva menos de um minuto — e é grátis pra começar.</p>

    <form class="register-form" (ngSubmit)="onSubmit()">
      <div class="fields-grid">
        <div class="field-group">
          <label for="fullName">Nome completo</label>
          <input id="fullName" type="text" placeholder="Seu nome completo" [(ngModel)]="fullName" name="fullName" autocomplete="name" />
        </div>

        <div class="field-group">
          <label for="displayName">Como quer ser chamado(a)?</label>
          <input id="displayName" type="text" placeholder="Ex: Cauê" [(ngModel)]="displayName" name="displayName" />
        </div>

        <div class="field-group">
          <label for="email">E-mail</label>
          <input id="email" type="email" placeholder="seu@email.com" [(ngModel)]="email" name="email" autocomplete="email" />
        </div>

        <div class="field-group">
          <label for="emailConfirm">Confirme o e-mail</label>
          <input id="emailConfirm" type="email" placeholder="Repita o e-mail" [(ngModel)]="emailConfirm" name="emailConfirm" />
        </div>

        <div class="field-group">
          <label for="password">Senha</label>
          <input id="password" type="password" placeholder="Mínimo 8 caracteres" [(ngModel)]="password" name="password" autocomplete="new-password" />
        </div>

        <div class="field-group">
          <label for="passwordConfirm">Confirme a senha</label>
          <input id="passwordConfirm" type="password" placeholder="Repita a senha" [(ngModel)]="passwordConfirm" name="passwordConfirm" autocomplete="new-password" />
        </div>
      </div>

      <!-- Seleção de plano -->
      <div class="plan-section">
        <span class="plan-title">Escolha um plano</span>
        <div class="plan-grid">
          @for (plano of planos; track plano.id) {
            <div class="plan-card" [class.active]="plan === plano.id" (click)="plan = plano.id">
              <div class="plan-card-head">
                <span class="plan-name">{{ plano.label }}</span>
                @if (plan === plano.id) {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                }
              </div>
              <p class="plan-tagline">{{ plano.tagline }}</p>
              <ul class="plan-perks">
                @for (perk of plano.perks; track perk) {
                  <li>{{ perk }}</li>
                }
              </ul>
            </div>
          }
        </div>
      </div>

      <!-- LGPD -->
      <label class="lgpd-check">
        <input type="checkbox" [(ngModel)]="lgpdAccepted" name="lgpdAccepted" />
        <span>
          Li e aceito a <a href="javascript:void(0)" (click)="showLgpd.set(!showLgpd())">Política de Privacidade (LGPD)</a>
          e concordo com o tratamento dos meus dados pessoais para fins de uso da plataforma.
        </span>
      </label>

      @if (showLgpd()) {
        <div class="lgpd-details">
          Seus dados (nome, e-mail e progresso de estudo) ficam salvos apenas no armazenamento local do
          seu próprio navegador (LocalStorage) — não enviamos essas informações para nenhum servidor
          externo. Você pode solicitar a exclusão completa da sua conta a qualquer momento na tela de
          Configurações.
        </div>
      }

      @if (errorMsg()) {
        <div class="error-msg">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke="white" stroke-width="2"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="white" stroke-width="2"/>
          </svg>
          {{ errorMsg() }}
        </div>
      }

      <button type="submit" class="btn-submit" [class.loading]="loading()">
        @if (loading()) {
          <span class="spinner"></span>
          Criando conta...
        } @else {
          Criar minha conta →
        }
      </button>
    </form>

    <p class="login-hint">
      Já tem conta? <a routerLink="/login">Entrar</a>
    </p>
  </div>
</div>
  `,
  styles: [`
:host { display: block; }

.register-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  padding: 40px 24px; position: relative; overflow: hidden;
  background: radial-gradient(ellipse 60% 80% at 30% 40%, rgba(0, 60, 150, 0.4) 0%, transparent 60%),
              radial-gradient(ellipse 50% 70% at 80% 70%, rgba(0, 30, 100, 0.3) 0%, transparent 60%),
              var(--bg-deepest);
}
.orb { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(80px); animation: floatOrb 10s ease-in-out infinite; }
.orb-1 { width: 400px; height: 400px; top: -100px; right: 10%; background: radial-gradient(circle, rgba(0,196,255,0.2) 0%, transparent 70%); }
.orb-2 { width: 300px; height: 300px; bottom: -50px; left: 10%; background: radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%); animation-delay: -5s; }
.grid-bg {
  position: absolute; inset: 0; pointer-events: none;
  background-image: linear-gradient(rgba(0,196,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,196,255,0.03) 1px, transparent 1px);
  background-size: 48px 48px;
}
.back-link {
  position: fixed; top: 24px; left: 24px; z-index: 10;
  display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--text-muted);
  transition: color 0.2s;
  &:hover { color: var(--accent); }
}

.register-card {
  position: relative; z-index: 2; width: 100%; max-width: 640px;
  background: rgba(13, 21, 38, 0.85); backdrop-filter: blur(20px);
  border: 1px solid var(--border-card); border-radius: var(--radius-xl);
  padding: 44px 40px; animation: fadeInUp 0.5s ease both;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
}
.register-logo { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 1.1rem; margin-bottom: 28px; justify-content: center; }

h1 { font-size: 1.5rem; font-weight: 800; text-align: center; margin-bottom: 8px; }
.register-sub { color: var(--text-muted); text-align: center; font-size: 0.9rem; margin-bottom: 32px; }

.register-form { display: flex; flex-direction: column; gap: 24px; }
.fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 20px; }
.field-group { display: flex; flex-direction: column; gap: 6px; }
.field-group label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); }
.field-group input {
  background: rgba(255,255,255,0.04); border: 1px solid var(--border-card); border-radius: var(--radius-sm);
  padding: 11px 13px; font-size: 0.88rem; color: var(--text-primary);
  transition: border-color 0.2s, box-shadow 0.2s;
  &:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-10); outline: none; }
  &::placeholder { color: var(--text-muted); }
}

.plan-section { display: flex; flex-direction: column; gap: 12px; }
.plan-title { font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); }
.plan-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.plan-card {
  padding: 14px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-card);
  cursor: pointer; transition: all 0.2s; background: rgba(255,255,255,0.02);
  &:hover { border-color: var(--border); }
  &.active { border-color: var(--accent); background: var(--accent-10); }
}
.plan-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; color: var(--accent); }
.plan-name { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }
.plan-tagline { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px; }
.plan-perks { display: flex; flex-direction: column; gap: 3px; padding-left: 16px; }
.plan-perks li { font-size: 0.72rem; color: var(--text-secondary); }

.lgpd-check {
  display: flex; align-items: flex-start; gap: 10px; font-size: 0.8rem; color: var(--text-muted); cursor: pointer;
  input { margin-top: 3px; flex-shrink: 0; }
  a { color: var(--accent); font-weight: 600; }
}
.lgpd-details {
  font-size: 0.76rem; color: var(--text-muted); line-height: 1.5; padding: 12px 14px;
  background: rgba(255,255,255,0.03); border: 1px solid var(--border-card); border-radius: var(--radius-sm);
}

.error-msg {
  display: flex; align-items: center; gap: 8px; padding: 10px 14px;
  background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: var(--radius-sm); color: var(--red); font-size: 0.83rem;
}

.btn-submit {
  padding: 14px; border-radius: var(--radius-sm); font-size: 0.95rem; font-weight: 700;
  background: linear-gradient(135deg, #0080d0, var(--accent)); color: white; border: none;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: box-shadow 0.2s, transform 0.2s;
  &:hover { box-shadow: 0 0 24px var(--accent-glow); transform: translateY(-1px); }
  &.loading { opacity: 0.8; pointer-events: none; }
}
.spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; animation: spin 0.8s linear infinite; }

.login-hint { margin-top: 24px; text-align: center; font-size: 0.85rem; color: var(--text-muted); }
.login-hint a { color: var(--accent); font-weight: 600; }

@media (max-width: 640px) {
  .register-card { padding: 32px 22px; }
  .fields-grid { grid-template-columns: 1fr; }
  .plan-grid { grid-template-columns: 1fr; }
}
  `]
})
export class RegisterComponent {
  fullName = '';
  displayName = '';
  email = '';
  emailConfirm = '';
  password = '';
  passwordConfirm = '';
  lgpdAccepted = false;
  plan: PlanId = 'free';

  planos = PLANOS;
  showLgpd = signal(false);
  errorMsg = signal('');
  loading = signal(false);

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit() {
    this.loading.set(true);
    this.errorMsg.set('');

    setTimeout(() => {
      const result = this.authService.register({
        fullName: this.fullName,
        displayName: this.displayName,
        email: this.email,
        emailConfirm: this.emailConfirm,
        password: this.password,
        passwordConfirm: this.passwordConfirm,
        lgpdAccepted: this.lgpdAccepted,
        plan: this.plan,
      });
      this.loading.set(false);

      if (result.success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMsg.set(result.error ?? 'Não foi possível criar sua conta.');
      }
    }, 500);
  }
}
