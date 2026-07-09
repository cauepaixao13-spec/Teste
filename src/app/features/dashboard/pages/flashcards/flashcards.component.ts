import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlashcardsService } from '../../../../core/services/flashcards.service';
import { FlashcardRecord } from '../../../../core/models/flashcard.model';

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <p class="eyebrow">REPETIÇÃO ESPAÇADA</p>
      <h1>Flashcards de <span class="highlight">redação</span></h1>
      <p class="page-sub">Active recall + algoritmo de repetição espaçada para fixação duradoura.</p>
    </div>
  </div>

  @if (!sessionActive()) {
    <!-- Tela de configuração: escolhe os assuntos e quantos cards quer revisar -->
    <div class="session-setup card">
      <h2>O que vamos revisar hoje?</h2>
      <p class="setup-sub">Selecione os assuntos e a quantidade de flashcards.</p>

      <div class="categories-setup">
        <h3>Assuntos:</h3>
        <div class="category-checkboxes">
          @for (cat of categories(); track cat) {
            <label class="cat-checkbox" [class.selected]="selectedCategories().has(cat)">
              <input type="checkbox" [checked]="selectedCategories().has(cat)" (change)="toggleCategory(cat)" />
              {{ cat }}
            </label>
          }
        </div>
      </div>

      <div class="quantity-setup" *ngIf="availableCardsCount() > 0">
        <h3>Quantidade:</h3>
        <div class="quantity-options">
          @for (qty of quantityOptions(); track qty) {
            <button class="qty-btn" [class.active]="desiredCount === qty" (click)="desiredCount = qty">
              {{ qty === availableCardsCount() ? 'Todos (' + qty + ')' : qty }}
            </button>
          }
        </div>

        <div class="quantity-slider">
          <input type="range" min="1" [max]="availableCardsCount()" [(ngModel)]="desiredCount" name="desiredCount" />
          <span class="slider-value">{{ desiredCount }} card(s)</span>
        </div>
      </div>
      <div *ngIf="availableCardsCount() === 0" class="no-cards-msg">
        Nenhum flashcard disponível para os assuntos selecionados.
      </div>

      <button class="btn-primary" [disabled]="availableCardsCount() === 0" (click)="startSession()">Começar revisão →</button>
    </div>
  } @else if (!finished()) {
    <div class="cards-layout">
      <div class="card-progress-wrap">
        <div class="card-counter">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
          Card {{ currentIndex() + 1 }} de {{ sessionCards().length }}
        </div>
        <div class="card-progress-bar">
          <div class="card-progress-fill" [style.width.%]="(currentIndex() / sessionCards().length) * 100"></div>
        </div>
      </div>

      <div class="flashcard-container" [class.flipped]="showAnswer()">
        <div class="flashcard" (click)="!showAnswer() && revealAnswer()">
          <div class="card-face card-front">
            <span class="face-label">PERGUNTA</span>
            <p class="card-text">{{ currentCard().question }}</p>
            @if (!showAnswer()) {
              <button class="reveal-btn" (click)="revealAnswer()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                Mostrar resposta
              </button>
            }
          </div>

          <div class="card-face card-back">
            <span class="face-label answer">RESPOSTA</span>
            <p class="card-text">{{ currentCard().answer }}</p>
            <div class="rating-btns">
              <button class="rate-btn hard" (click)="rateCard('hard')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Difícil
              </button>
              <button class="rate-btn easy" (click)="rateCard('easy')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Acertei!
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mini-stats">
        <div class="mini-stat"><span class="mini-val easy-val">{{ easyCount() }}</span><span class="mini-lbl">Acertadas</span></div>
        <div class="mini-stat"><span class="mini-val hard-val">{{ hardCount() }}</span><span class="mini-lbl">Difíceis</span></div>
        <div class="mini-stat"><span class="mini-val">{{ sessionCards().length - currentIndex() }}</span><span class="mini-lbl">Restantes</span></div>
      </div>
    </div>
  } @else {
    <div class="session-complete">
      <div class="complete-icon">🎉</div>
      <h2>Sessão concluída!</h2>
      <p>Você revisou {{ sessionCards().length }} flashcard(s).</p>
      <div class="complete-stats">
        <div class="c-stat ok"><span class="c-val">{{ easyCount() }}</span><span class="c-lbl">Acertadas</span></div>
        <div class="c-stat warn"><span class="c-val">{{ hardCount() }}</span><span class="c-lbl">Para revisar</span></div>
      </div>
      <button class="btn-primary" (click)="backToSetup()">Nova sessão →</button>
    </div>
  }
</div>
  `,
  styles: [`
.page { max-width: 900px; margin: 0 auto; animation: fadeIn 0.4s ease; }
.eyebrow { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; color: var(--accent); text-transform: uppercase; margin-bottom: 8px; }
h1 { font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em; }
.page-sub { font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; }
.page-header { margin-bottom: 20px; }

.session-setup { padding: 40px 32px; display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; max-width: 520px; margin: 0 auto; }
.session-setup h2 { font-size: 1.3rem; font-weight: 800; }
.setup-sub { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px; }

.categories-setup { width: 100%; margin-bottom: 24px; }
.categories-setup h3 { font-size: 0.9rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px; text-align: left; }
.category-checkboxes { display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-start; }
.cat-checkbox {
  display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 8px;
  background: rgba(255,255,255,0.04); border: 1px solid var(--border-card);
  cursor: pointer; font-size: 0.85rem; color: var(--text-secondary); transition: all 0.2s;
  user-select: none;
}
.cat-checkbox:hover { border-color: var(--border); }
.cat-checkbox.selected { background: var(--accent-10); border-color: var(--accent); color: var(--accent); }
.cat-checkbox input { display: none; }

.quantity-setup { width: 100%; display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; }
.quantity-setup h3 { font-size: 0.9rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px; width: 100%; text-align: left; }
.quantity-options { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 20px; width: 100%; }
.qty-btn {
  padding: 8px 18px; border-radius: 999px; font-size: 0.85rem; font-weight: 600;
  background: rgba(255,255,255,0.04); border: 1px solid var(--border-card); color: var(--text-secondary);
  cursor: pointer; transition: all 0.2s;
  &:hover { border-color: var(--border); }
  &.active { background: var(--accent-10); border-color: var(--accent); color: var(--accent); }
}
.quantity-slider { display: flex; align-items: center; gap: 12px; width: 100%; }
.quantity-slider input[type="range"] { flex: 1; accent-color: var(--accent); }
.slider-value { font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); white-space: nowrap; min-width: 70px; text-align: right; }
.no-cards-msg { color: var(--amber); font-size: 0.85rem; margin-bottom: 20px; }

.cards-layout { display: flex; flex-direction: column; gap: 24px; align-items: center; }
.card-progress-wrap { width: 100%; display: flex; flex-direction: column; gap: 8px; }
.card-counter { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: var(--text-muted); font-weight: 500; }
.card-progress-bar { width: 100%; height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
.card-progress-fill { height: 100%; background: linear-gradient(90deg,#0080d0,var(--accent)); border-radius: 2px; transition: width 0.4s; }

.flashcard-container { width: 100%; max-width: 600px; height: 260px; perspective: 1000px; cursor: pointer; }
.flashcard { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transition: transform 0.5s cubic-bezier(0.4,0,0.2,1); }
.flashcard-container.flipped .flashcard { transform: rotateY(180deg); cursor: default; }
.card-face {
  position: absolute; inset: 0; backface-visibility: hidden;
  background: var(--bg-card); border: 1px solid var(--border-card); border-radius: var(--radius-lg);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 36px; text-align: center; gap: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}
.card-back { transform: rotateY(180deg); background: var(--bg-card-hover); border-color: var(--border); }
.face-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.12em; color: var(--text-muted); text-transform: uppercase; &.answer { color: var(--accent); } }
.card-text { font-size: 1.2rem; font-weight: 600; color: var(--text-primary); line-height: 1.5; }
.reveal-btn {
  display: flex; align-items: center; gap: 7px; padding: 9px 20px;
  background: linear-gradient(135deg, #0080d0, var(--accent)); color: white;
  border: none; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: box-shadow 0.2s;
  &:hover { box-shadow: 0 0 20px var(--accent-glow); }
}
.rating-btns { display: flex; gap: 12px; }
.rate-btn {
  display: flex; align-items: center; gap: 7px; padding: 10px 24px; border-radius: 8px;
  font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
  &.hard { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: var(--red); &:hover { background: rgba(239,68,68,0.2); } }
  &.easy { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: var(--green); &:hover { background: rgba(16,185,129,0.2); } }
}

.mini-stats { display: flex; gap: 32px; }
.mini-stat { text-align: center; }
.mini-val { display: block; font-size: 1.4rem; font-weight: 800; color: var(--text-secondary); line-height: 1.1; }
.easy-val { color: var(--green); }
.hard-val { color: var(--red); }
.mini-lbl { font-size: 0.72rem; color: var(--text-muted); }

.session-complete {
  display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 64px 32px; text-align: center;
  background: var(--bg-card); border: 1px solid var(--border-card); border-radius: var(--radius-xl);
}
.complete-icon { font-size: 3rem; }
.session-complete h2 { font-size: 1.8rem; font-weight: 800; }
.session-complete p { color: var(--text-muted); font-size: 0.95rem; }
.complete-stats { display: flex; gap: 32px; }
.c-stat { padding: 16px 28px; border-radius: var(--radius-md); text-align: center; }
.c-stat.ok { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); }
.c-stat.warn { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); }
.c-val { display: block; font-size: 2rem; font-weight: 900; }
.c-stat.ok .c-val { color: var(--green); }
.c-stat.warn .c-val { color: var(--amber); }
.c-lbl { font-size: 0.78rem; color: var(--text-muted); }
  `]
})
export class FlashcardsComponent implements OnInit, OnDestroy {
  sessionActive = signal(false);
  desiredCount = 10;
  selectedCategories = signal<Set<string>>(new Set());

  sessionCards = signal<FlashcardRecord[]>([]);
  currentIndex = signal(0);
  showAnswer = signal(false);
  easyCount = signal(0);
  hardCount = signal(0);
  private sessionStartedAt = 0;

  allCards = computed(() => this.flashcardsService.cards$());
  categories = computed(() => this.flashcardsService.categories());
  currentCard = computed(() => this.sessionCards()[this.currentIndex()]);
  finished = computed(() => this.sessionCards().length > 0 && this.currentIndex() >= this.sessionCards().length);

  availableCardsCount = computed(() => {
    const selected = this.selectedCategories();
    if (selected.size === 0) return this.allCards().length;
    return this.allCards().filter(c => selected.has(c.category)).length;
  });

  quantityOptions = computed(() => {
    const total = this.availableCardsCount();
    const base = [10, 20, 30].filter(n => n < total);
    return [...base, total];
  });

  constructor(public flashcardsService: FlashcardsService) {
    // When the component is instantiated, initialize desiredCount to 10 or the max available if fewer
    effect(() => {
      if (!this.sessionActive()) {
        const total = this.availableCardsCount();
        if (this.desiredCount > total && total > 0) {
           this.desiredCount = total;
        } else if (this.desiredCount === 0 && total > 0) {
           this.desiredCount = Math.min(10, total);
        }
      }
    });
  }

  ngOnInit() {
    // Select all categories by default
    this.selectedCategories.set(new Set(this.categories()));
    const total = this.availableCardsCount();
    this.desiredCount = Math.min(10, total) || 1;
  }

  ngOnDestroy() {
    if (this.sessionActive() && this.currentIndex() > 0 && !this.finished()) {
      this.logCurrentSession();
    }
  }

  toggleCategory(cat: string) {
    const current = new Set(this.selectedCategories());
    if (current.has(cat)) {
      current.delete(cat);
    } else {
      current.add(cat);
    }
    this.selectedCategories.set(current);
  }

  startSession() {
    const selected = this.selectedCategories();
    let cardsToReview = this.allCards();
    if (selected.size > 0) {
      cardsToReview = cardsToReview.filter(c => selected.has(c.category));
    }

    const shuffled = [...cardsToReview].sort(() => Math.random() - 0.5);
    const count = Math.max(1, Math.min(this.desiredCount, shuffled.length));

    this.sessionCards.set(shuffled.slice(0, count));
    this.currentIndex.set(0);
    this.showAnswer.set(false);
    this.easyCount.set(0);
    this.hardCount.set(0);
    this.sessionStartedAt = Date.now();
    this.sessionActive.set(true);
  }

  backToSetup() {
    this.sessionActive.set(false);
  }

  revealAnswer() { this.showAnswer.set(true); }

  rateCard(rating: 'easy' | 'hard') {
    const card = this.currentCard();
    if (card) this.flashcardsService.recordCardReview(card.id, rating);

    if (rating === 'easy') this.easyCount.update(v => v + 1);
    else this.hardCount.update(v => v + 1);

    setTimeout(() => {
      this.showAnswer.set(false);
      this.currentIndex.update(i => i + 1);
      if (this.finished()) this.logCurrentSession();
    }, 300);
  }

  private logCurrentSession() {
    const minutes = Math.max(1, Math.round((Date.now() - this.sessionStartedAt) / 60000));
    this.flashcardsService.logSession(this.currentIndex(), this.easyCount(), this.hardCount(), minutes);
  }
}
