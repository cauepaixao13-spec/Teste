import { Component, OnInit, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LogoIconComponent } from '../../../shared/brand/logo-icon.component';
import { CarouselComponent } from '../../../shared/carousel/carousel.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule, LogoIconComponent, CarouselComponent],
  template: `
<!-- ====== NAVBAR ====== -->
<nav class="navbar" [class.scrolled]="scrolled()">
  <div class="nav-inner">
    <a routerLink="/" class="logo">
      <redamind-logo [size]="32"></redamind-logo>
      <span>RedalMind</span>
    </a>
    <ul class="nav-links" [class.open]="menuOpen()">
      <li><a href="#metodologia" (click)="menuOpen.set(false)">Metodologia</a></li>
      <li><a href="#recursos" (click)="menuOpen.set(false)">Recursos</a></li>
      <li><a href="#evolucao" (click)="menuOpen.set(false)">Evolução</a></li>
      <li><a href="#faq" (click)="menuOpen.set(false)">FAQ</a></li>
    </ul>
    <div class="nav-actions">
      <a routerLink="/login" class="btn-ghost">Entrar</a>
      <a routerLink="/registrar" class="btn-primary">Começar grátis →</a>
    </div>
    <button class="hamburger" (click)="menuOpen.set(!menuOpen())">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<!-- ====== HERO ====== -->
<section class="hero">
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>
  <div class="hero-grid"></div>

  <div class="hero-content">
    <div class="hero-badge badge-label">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
      IA educacional · Métodos científicos de aprendizagem
    </div>
    <h1 class="hero-title">
      Do <span class="highlight">0 ao 1000:</span><br>
      transforme sua <span class="highlight">escrita</span><br>
      em <span class="highlight">aprovação.</span>
    </h1>
    <p class="hero-sub">
      A plataforma inteligente que evolui sua redação para o ENEM e vestibulares
      semana a semana, com correção por IA, métodos científicos e gamificação.
    </p>
    <div class="hero-btns">
      <a routerLink="/registrar" class="btn-primary lg">Começar grátis →</a>
      <a href="#metodologia" class="btn-ghost lg">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
        Ver metodologia
      </a>
    </div>
    <div class="hero-stats">
      <div class="stat-item">
        <span class="stat-num">+12k</span>
        <span class="stat-lbl">estudantes</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num">98%</span>
        <span class="stat-lbl">satisfação</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num">+180</span>
        <span class="stat-lbl">pontos médios</span>
      </div>
    </div>
  </div>
</section>

<!-- ====== FEATURES ====== -->
<section class="features-section" id="recursos">
  <div class="section-container">
    <p class="section-eyebrow">RECURSOS</p>
    <h2 class="section-title">Tudo o que você precisa para<br><span class="highlight">evoluir</span></h2>
    <p class="section-sub">Uma plataforma que combina ciência da aprendizagem, IA e design intuitivo.</p>
    <div class="features-grid">
      @for (feature of features; track feature.id) {
        <div class="feature-card">
          <div class="feat-icon" [style.background]="feature.iconBg">
            <span [innerHTML]="feature.icon"></span>
          </div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.desc }}</p>
        </div>
      }
    </div>
  </div>
</section>

<!-- ====== METHODOLOGY ====== -->
<section class="method-section" id="metodologia">
  <div class="section-container">
    <p class="section-eyebrow">METODOLOGIA</p>
    <h2 class="section-title">Ciência da aprendizagem<br>aplicada à <span class="highlight">redação</span></h2>
    <div class="method-steps">
      @for (step of methodSteps; track step.num) {
        <div class="method-step">
          <div class="step-num">{{ step.num | number:'2.0' }}</div>
          <h3>{{ step.title }}</h3>
          <p>{{ step.desc }}</p>
        </div>
      }
    </div>
  </div>
</section>

<!-- ====== AI CORRECTION ====== -->
<section class="correction-section">
  <div class="section-container corr-layout">
    <div class="corr-text">
      <p class="section-eyebrow">IA EDUCACIONAL</p>
      <h2 class="section-title left">Correção automática<br>que <span class="highlight">ensina</span></h2>
      <p class="corr-sub">
        Receba feedback pedagógico imediato com nota simulada por IA,
        pontos fortes, melhorias e repertórios sugeridos para sua próxima redação.
      </p>
      <ul class="corr-list">
        <li>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Avaliação das 5 competências do ENEM
        </li>
        <li>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Sugestões de repertório sociocultural
        </li>
        <li>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Identificação de erros estruturais
        </li>
        <li>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Plano de estudo personalizado
        </li>
      </ul>
    </div>
    <div class="corr-card card">
      <div class="corr-header">
        <div class="corr-avatar">RM</div>
        <div>
          <div class="corr-name">Análise da RedalMind IA</div>
          <div class="corr-theme">Tema: Desafios da educação digital</div>
        </div>
        <div class="corr-score">
          <span class="score-num">920</span>
          <span class="score-max">/1000</span>
        </div>
      </div>
      <div class="competencias">
        @for (comp of competencias; track comp.label) {
          <div class="comp-row">
            <span class="comp-label">{{ comp.label }}</span>
            <div class="comp-bar-wrap">
              <div class="comp-bar" [style.width.%]="(comp.score / comp.max) * 100"
                   [style.background]="comp.score === comp.max ? 'var(--accent)' : 'linear-gradient(90deg,#0080d0,var(--accent))'"></div>
            </div>
            <span class="comp-score">{{ comp.score }}/{{ comp.max }}</span>
          </div>
        }
      </div>
      <div class="feedback-pills">
        <div class="pill pill-green">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Acertos fortes
        </div>
        <div class="pill pill-amber">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01" stroke="white" stroke-width="2"/></svg>
          Melhorar
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ====== TESTIMONIALS ====== -->
<section class="testimonials-section" id="evolucao">
  <div class="section-container">
    <p class="section-eyebrow">DEPOIMENTOS</p>
    <h2 class="section-title">Estudantes que <span class="highlight">conquistaram</span><br>a aprovação</h2>
    <redamind-carousel [items]="testimonials" [itemsPerView]="3" [secondsPerItem]="4.5">
      <ng-template let-t>
        <div class="testimonial-card card">
          <div class="stars">★★★★★</div>
          <p class="t-quote">"{{ t.quote }}"</p>
          <div class="t-author">
            <div class="t-avatar">{{ t.name[0] }}</div>
            <div>
              <div class="t-name">{{ t.name }}</div>
              <div class="t-detail">{{ t.detail }}</div>
            </div>
          </div>
        </div>
      </ng-template>
    </redamind-carousel>
  </div>
</section>

<!-- ====== FAQ ====== -->
<section class="faq-section" id="faq">
  <div class="section-container">
    <p class="section-eyebrow">FAQ</p>
    <h2 class="section-title">Perguntas frequentes</h2>
    <div class="faq-list">
      @for (item of faqItems; track item.q; let i = $index) {
        <div class="faq-item" [class.open]="openFaq() === i">
          <button class="faq-q" (click)="toggleFaq(i)">
            {{ item.q }}
            <svg class="faq-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <div class="faq-a">
            <p>{{ item.a }}</p>
          </div>
        </div>
      }
    </div>
  </div>
</section>

<!-- ====== CTA ====== -->
<section class="cta-section">
  <div class="cta-card">
    <h2>Comece sua <span class="highlight">evolução</span> hoje</h2>
    <p>Junte-se a milhares de estudantes evoluindo semana após semana.</p>
    <a routerLink="/registrar" class="btn-primary lg">Entrar na plataforma →</a>
  </div>
</section>

<!-- ====== FOOTER ====== -->
<footer class="footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <div class="logo">
        <redamind-logo [size]="32"></redamind-logo>
        <span>RedalMind</span>
      </div>
      <p>Transformando escrita em aprovação. A plataforma inteligente para evoluir sua redação com IA educacional e ciência da aprendizagem.</p>
    </div>
    <div class="footer-links">
      <div class="footer-col">
        <h4>Produto</h4>
        <ul>
          <li><a href="#metodologia">Metodologia</a></li>
          <li><a href="#recursos">Recursos</a></li>
          <li><a href="#evolucao">Evolução</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Empresa</h4>
        <ul>
          <li><a href="#">Sobre</a></li>
          <li><a href="#">Blog</a></li>
          <li><a href="#">Contato</a></li>
        </ul>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2024 RedalMind. Todos os direitos reservados.</span>
    <span>Feito com ciência da aprendizagem.</span>
  </div>
</footer>
  `,
  styles: [`
:host { display: block; background: var(--bg-main); }

/* ===== NAVBAR ===== */
.navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  padding: 0 24px;
  transition: background 0.3s, backdrop-filter 0.3s, border-color 0.3s;
  border-bottom: 1px solid transparent;
}
.navbar.scrolled {
  background: rgba(7, 12, 24, 0.92);
  backdrop-filter: blur(12px);
  border-color: var(--border-card);
}
.nav-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; align-items: center; gap: 32px; height: 68px;
}
.logo { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 1.1rem; color: var(--text-primary); flex-shrink: 0; }
.nav-links { display: flex; align-items: center; gap: 28px; margin-left: auto; }
.nav-links li a { color: var(--text-secondary); font-size: 0.9rem; font-weight: 500; transition: color 0.2s; }
.nav-links li a:hover { color: var(--text-primary); }
.nav-actions { display: flex; align-items: center; gap: 10px; margin-left: 12px; }
.nav-actions .btn-ghost, .nav-actions .btn-primary { padding: 8px 18px; font-size: 0.85rem; }
.hamburger { display: none; flex-direction: column; gap: 5px; background: none; padding: 4px; margin-left: auto; }
.hamburger span { display: block; width: 22px; height: 2px; background: var(--text-secondary); border-radius: 2px; }

/* ===== HERO ===== */
.hero {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  text-align: center; padding: 100px 24px 80px; position: relative; overflow: hidden;
  background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0, 50, 120, 0.5) 0%, transparent 70%),
              radial-gradient(ellipse 60% 80% at 80% 80%, rgba(0, 30, 80, 0.4) 0%, transparent 60%),
              var(--bg-deepest);
}
.orb {
  position: absolute; border-radius: 50%; pointer-events: none;
  filter: blur(80px); animation: floatOrb 12s ease-in-out infinite;
}
.orb-1 {
  width: 500px; height: 500px; top: -150px; left: -100px;
  background: radial-gradient(circle, rgba(0, 100, 200, 0.3) 0%, transparent 70%);
  animation-delay: 0s;
}
.orb-2 {
  width: 400px; height: 400px; top: 100px; right: -100px;
  background: radial-gradient(circle, rgba(0, 196, 255, 0.2) 0%, transparent 70%);
  animation-delay: -4s;
}
.orb-3 {
  width: 300px; height: 300px; bottom: 0; left: 30%;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%);
  animation-delay: -8s;
}
.hero-grid {
  position: absolute; inset: 0; pointer-events: none;
  background-image: linear-gradient(rgba(0,196,255,0.04) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,196,255,0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 80%);
}
.hero-content { position: relative; z-index: 2; max-width: 780px; animation: fadeInUp 0.8s ease both; }
.hero-badge { margin-bottom: 28px; animation: fadeInUp 0.6s ease 0.1s both; }
.hero-title {
  font-size: clamp(2.6rem, 6vw, 4.2rem); font-weight: 900; line-height: 1.12;
  letter-spacing: -0.02em; margin-bottom: 24px; animation: fadeInUp 0.7s ease 0.2s both;
}
.hero-sub {
  font-size: 1.05rem; color: var(--text-secondary); max-width: 560px; margin: 0 auto 36px;
  line-height: 1.7; animation: fadeInUp 0.7s ease 0.3s both;
}
.hero-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 52px; animation: fadeInUp 0.7s ease 0.4s both; }
.btn-primary.lg, .btn-ghost.lg { padding: 14px 28px; font-size: 0.95rem; }
.hero-stats {
  display: flex; align-items: center; justify-content: center; gap: 0;
  animation: fadeInUp 0.7s ease 0.5s both;
  background: rgba(255,255,255,0.03); border: 1px solid var(--border-card);
  border-radius: var(--radius-md); padding: 20px 40px; display: inline-flex;
}
.stat-item { text-align: center; padding: 0 32px; }
.stat-num { display: block; font-size: 1.8rem; font-weight: 800; color: var(--accent); line-height: 1.1; }
.stat-lbl { font-size: 0.78rem; color: var(--text-muted); font-weight: 500; }
.stat-divider { width: 1px; height: 40px; background: var(--border-card); }

/* ===== FEATURES ===== */
.features-section { padding: 100px 24px; }
.section-container { max-width: 1160px; margin: 0 auto; }
.section-title { font-size: clamp(1.8rem, 3.5vw, 2.6rem); font-weight: 800; line-height: 1.2; letter-spacing: -0.02em; margin: 12px 0 16px; }
.section-sub { color: var(--text-secondary); margin-bottom: 60px; font-size: 1rem; }
.section-title.left { text-align: left; }
.features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.feature-card {
  background: var(--bg-card); border: 1px solid var(--border-card); border-radius: var(--radius-lg);
  padding: 24px; transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
}
.feature-card:hover { border-color: var(--border); transform: translateY(-4px); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
.feat-icon {
  width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center;
  justify-content: center; margin-bottom: 16px; font-size: 1.2rem;
}
.feature-card h3 { font-size: 0.95rem; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); }
.feature-card p { font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5; }

/* ===== METHODOLOGY ===== */
.method-section { padding: 100px 24px; background: linear-gradient(180deg, transparent, rgba(0,30,80,0.2), transparent); }
.method-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-top: 56px; }
.method-step { padding: 32px 24px; }
.step-num { font-size: 2rem; font-weight: 900; color: var(--accent-dim); margin-bottom: 16px; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.method-step h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 10px; }
.method-step p { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; }

/* ===== CORRECTION ===== */
.correction-section { padding: 100px 24px; }
.corr-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.corr-sub { font-size: 0.95rem; color: var(--text-secondary); line-height: 1.7; margin: 20px 0 28px; }
.corr-list { list-style: none; display: flex; flex-direction: column; gap: 12px; }
.corr-list li { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; color: var(--text-secondary); }
.corr-list svg { color: var(--accent); flex-shrink: 0; }
.corr-card { padding: 28px; }
.corr-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.corr-avatar { width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, #0080d0, var(--accent)); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; color: white; flex-shrink: 0; }
.corr-name { font-size: 0.9rem; font-weight: 600; }
.corr-theme { font-size: 0.75rem; color: var(--text-muted); }
.corr-score { margin-left: auto; text-align: right; }
.score-num { font-size: 1.8rem; font-weight: 900; color: var(--accent); }
.score-max { font-size: 0.8rem; color: var(--text-muted); }
.competencias { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
.comp-row { display: grid; grid-template-columns: 80px 1fr 60px; align-items: center; gap: 12px; }
.comp-label { font-size: 0.75rem; color: var(--text-secondary); }
.comp-bar-wrap { height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
.comp-bar { height: 100%; border-radius: 2px; transition: width 1s var(--ease); }
.comp-score { font-size: 0.75rem; color: var(--text-muted); text-align: right; }
.feedback-pills { display: flex; gap: 8px; flex-wrap: wrap; }
.pill { display: flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 999px; font-size: 0.75rem; font-weight: 500; }
.pill-green { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: var(--green); }
.pill-amber { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); color: var(--amber); }

/* ===== TESTIMONIALS ===== */
.testimonials-section { padding: 100px 24px; }
redamind-carousel { display: block; margin-top: 56px; padding: 0 28px; }
.testimonial-card { padding: 28px; height: 100%; display: flex; flex-direction: column; }
.stars { color: var(--accent); font-size: 1rem; margin-bottom: 16px; letter-spacing: 2px; }
.t-quote { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 24px; font-style: italic; }
.t-author { display: flex; align-items: center; gap: 12px; }
.t-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--violet), var(--accent)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; color: white; flex-shrink: 0; }
.t-name { font-size: 0.88rem; font-weight: 600; }
.t-detail { font-size: 0.75rem; color: var(--text-muted); }

/* ===== FAQ ===== */
.faq-section { padding: 100px 24px; }
.faq-list { max-width: 720px; margin: 48px auto 0; display: flex; flex-direction: column; gap: 4px; }
.faq-item { border: 1px solid var(--border-card); border-radius: var(--radius-md); overflow: hidden; }
.faq-q {
  width: 100%; display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px; background: var(--bg-card); font-size: 0.95rem; font-weight: 500;
  color: var(--text-primary); cursor: pointer; transition: background 0.2s;
  border: none;
}
.faq-q:hover { background: var(--bg-card-hover); }
.faq-arrow { transition: transform 0.3s; flex-shrink: 0; color: var(--text-muted); }
.faq-item.open .faq-arrow { transform: rotate(180deg); }
.faq-a { max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding 0.3s; }
.faq-item.open .faq-a { max-height: 200px; }
.faq-a p { padding: 0 24px 20px; font-size: 0.88rem; color: var(--text-secondary); line-height: 1.7; }

/* ===== CTA ===== */
.cta-section { padding: 80px 24px; }
.cta-card {
  max-width: 740px; margin: 0 auto; text-align: center;
  background: linear-gradient(135deg, rgba(0,80,160,0.3), rgba(0,30,80,0.6));
  border: 1px solid var(--border); border-radius: var(--radius-xl);
  padding: 64px 48px;
}
.cta-card h2 { font-size: 2.2rem; font-weight: 800; margin-bottom: 16px; }
.cta-card p { color: var(--text-secondary); margin-bottom: 36px; font-size: 1rem; }

/* ===== FOOTER ===== */
.footer { padding: 64px 24px 32px; border-top: 1px solid var(--border-card); }
.footer-inner { max-width: 1160px; margin: 0 auto; display: grid; grid-template-columns: 1.5fr 1fr; gap: 64px; margin-bottom: 48px; }
.footer-brand .logo { margin-bottom: 16px; }
.footer-brand p { font-size: 0.85rem; color: var(--text-muted); line-height: 1.7; max-width: 320px; }
.footer-links { display: flex; gap: 64px; }
.footer-col h4 { font-size: 0.85rem; font-weight: 600; margin-bottom: 16px; color: var(--text-secondary); }
.footer-col ul { display: flex; flex-direction: column; gap: 10px; }
.footer-col li a { font-size: 0.85rem; color: var(--text-muted); transition: color 0.2s; }
.footer-col li a:hover { color: var(--accent); }
.footer-bottom {
  max-width: 1160px; margin: 0 auto;
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 24px; border-top: 1px solid var(--border-card);
  font-size: 0.78rem; color: var(--text-muted);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .features-grid { grid-template-columns: repeat(2, 1fr); }
  .method-steps { grid-template-columns: repeat(2, 1fr); }
  .corr-layout { grid-template-columns: 1fr; gap: 40px; }
}
@media (max-width: 768px) {
  .nav-links, .nav-actions { display: none; }
  .nav-links.open { display: flex; flex-direction: column; position: fixed; top: 68px; left: 0; right: 0; background: var(--bg-deepest); padding: 24px; border-bottom: 1px solid var(--border-card); z-index: 999; }
  .hamburger { display: flex; }
  .hero { padding: 120px 20px 60px; }
  .hero-title { font-size: 2.2rem; }
  .hero-stats { padding: 16px 20px; }
  .stat-item { padding: 0 16px; }
  .features-grid { grid-template-columns: 1fr 1fr; }
  .method-steps { grid-template-columns: 1fr; }
  .footer-inner { grid-template-columns: 1fr; gap: 32px; }
  .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
  .cta-card { padding: 40px 24px; }
}
@media (max-width: 480px) {
  .features-grid { grid-template-columns: 1fr; }
  .hero-btns { flex-direction: column; align-items: center; }
  .hero-stats { flex-direction: column; gap: 16px; }
  .stat-divider { display: none; }
}
  `]
})
export class LandingComponent implements OnInit {
  scrolled = signal(false);
  menuOpen = signal(false);
  openFaq = signal<number | null>(null);

  features = [
    { id: 1, title: 'IA Educacional', desc: 'Correção pedagógica com feedback motivador e mapeamento das 5 competências do ENEM.', icon: '🧠', iconBg: 'rgba(0,196,255,0.1)' },
    { id: 2, title: 'Repetição Espaçada', desc: 'Algoritmo inteligente que agenda revisões no momento ideal para fixação.', icon: '🔄', iconBg: 'rgba(124,58,237,0.1)' },
    { id: 3, title: 'Active Recall', desc: 'Guias ativos e flashcards científicos para consolidar o aprendizado.', icon: '⚡', iconBg: 'rgba(59,130,246,0.1)' },
    { id: 4, title: 'Desafio Semanal', desc: 'Tema novo toda semana com correção automática e plano personalizado.', icon: '🎯', iconBg: 'rgba(16,185,129,0.1)' },
    { id: 5, title: 'Microlearning', desc: 'Aulas de 5–12 minutos focadas e progressivas, encaixadas na sua rotina.', icon: '📚', iconBg: 'rgba(245,158,11,0.1)' },
    { id: 6, title: 'Gamificação', desc: 'XP, níveis, streaks e ranking para manter sua consistência e motivação.', icon: '🏆', iconBg: 'rgba(239,68,68,0.1)' },
    { id: 7, title: 'Evolução visual', desc: 'Gráficos de evolução por competência, redações ao tempo e estudado.', icon: '📈', iconBg: 'rgba(0,196,255,0.1)' },
    { id: 8, title: 'Método Feynman', desc: 'Aprenda explicando — exercícios que testam clareza argumentativa.', icon: '💡', iconBg: 'rgba(124,58,237,0.1)' },
  ];

  methodSteps = [
    { num: 1, title: 'Aprenda', desc: 'Módulos curtos baseados em microlearning, com vídeo, resumo e mapa mental.' },
    { num: 2, title: 'Pratique', desc: 'Gabarito de letras revisado, flashcards com repetição e exercícios Feynman.' },
    { num: 3, title: 'Escreva', desc: 'Editor com checklist ENEM, contador de palavras, modo foco e autossalve.' },
    { num: 4, title: 'Evolua', desc: 'IA analisa as 5 competências, gera feedback e plano semanal personalizado.' },
  ];

  competencias = [
    { label: 'C1 — Norma', score: 180, max: 200 },
    { label: 'C2 — Tema', score: 200, max: 200 },
    { label: 'C3 — Argum.', score: 180, max: 200 },
    { label: 'C4 — Coesão', score: 180, max: 200 },
    { label: 'C5 — Interv.', score: 180, max: 200 },
  ];

  testimonials = [
    { quote: 'Sai de 640 para 940 em 3 meses. O feedback da IA é absolutamente preciso.', name: 'Mariana Lopes', detail: 'Aprovada em Medicina — UFMG' },
    { quote: 'Os desafios semanais criaram uma rotina que eu nunca consegui ter sozinha.', name: 'Lucas Andrade', detail: 'Aprovado em Direito — USP' },
    { quote: 'O sistema de competências me ajudou a entender exatamente o que melhorar.', name: 'Júlia Tavares', detail: 'Aprovada em Engenharia — UFRJ' },
    { quote: 'Os flashcards de repertório salvaram minha redação sobre temas que eu não dominava.', name: 'Pedro Henrique Costa', detail: 'Aprovado em Administração — UFBA' },
    { quote: 'Nunca tinha visto uma correção tão detalhada competência por competência.', name: 'Beatriz Nogueira', detail: 'Aprovada em Psicologia — UFPE' },
    { quote: 'O ranking com os amigos virou motivação diária pra não perder o streak.', name: 'Rafael Souza', detail: 'Aprovado em Ciência da Computação — UFRGS' },
  ];

  faqItems = [
    { q: 'Como funciona a correção por IA?', a: 'Nossa IA analisa sua redação em tempo real avaliando as 5 competências do ENEM: domínio da norma culta, compreensão da proposta, argumentação, coesão/coerência e proposta de intervenção. O resultado inclui nota simulada, pontos fortes, erros estruturais e repertório sugerido.' },
    { q: 'Preciso pagar para começar?', a: 'Não! Você pode começar gratuitamente com acesso ao desafio semanal e aos primeiros módulos. O plano completo desbloqueia todos os módulos, flashcards ilimitados, histórico de correções e análise avançada de competências.' },
    { q: 'O RedalMind funciona para outros vestibulares além do ENEM?', a: 'Sim. Embora nosso foco principal seja o ENEM, as habilidades desenvolvidas — argumentação estruturada, repertório sociocultural e norma culta — são aplicáveis a Fuvest, UNICAMP, ESPM e outros processos seletivos.' },
    { q: 'Quanto tempo por dia preciso dedicar?', a: 'Recomendamos 20 a 40 minutos por dia. Nosso sistema de microlearning foi desenhado para caber na rotina real de um estudante. Com consistência, você verá resultados expressivos em semanas.' },
  ];

  ngOnInit() {
    this.scrolled.set(window.scrollY > 20);
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 20);
  }

  toggleFaq(i: number) {
    this.openFaq.set(this.openFaq() === i ? null : i);
  }
}
