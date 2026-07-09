import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlashcardsService } from '../../../../core/services/flashcards.service';
import { FlashcardRecord } from '../../../../core/models/flashcard.model';

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [
    trigger('listAnimation', [
      transition(':enter', [
        style({ opacity: 0, maxHeight: '0px', overflow: 'hidden' }),
        animate('250ms ease-out', style({ opacity: 1, maxHeight: '2000px' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, maxHeight: '0px' }))
      ])
    ])
  ],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <p class="eyebrow">REPETIÇÃO ESPAÇADA</p>
      <h1>Flashcards de <span class="highlight">redação</span></h1>
      <p class="page-sub">Active recall + algoritmo de repetição espaçada para fixação duradoura.</p>
    </div>
  </div>

  @if (creationMode()) {
    <div class="session-setup card">
      <h2>Criar Flashcard</h2>
      <p class="setup-sub">Adicione um novo cartão para suas revisões.</p>
      
      <div class="form-group" style="width: 100%; text-align: left; margin-bottom: 16px;">
        <label style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px; display: block;">Categoria</label>
        <input type="text" [(ngModel)]="newCardCategory" placeholder="Ex: Citações" style="width: 100%; padding: 10px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-card); color: white;" />
      </div>

      <div class="form-group" style="width: 100%; text-align: left; margin-bottom: 16px;">
        <label style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px; display: block;">Pergunta (Frente)</label>
        <textarea [(ngModel)]="newCardQuestion" placeholder="Qual a sua pergunta?" rows="2" style="width: 100%; padding: 10px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-card); color: white; resize: vertical;"></textarea>
      </div>

      <div class="form-group" style="width: 100%; text-align: left; margin-bottom: 24px;">
        <label style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px; display: block;">Resposta (Verso)</label>
        <textarea [(ngModel)]="newCardAnswer" placeholder="Qual a resposta correta?" rows="3" style="width: 100%; padding: 10px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-card); color: white; resize: vertical;"></textarea>
      </div>

      <div style="display: flex; gap: 12px; width: 100%;">
        <button class="qty-btn" style="flex: 1;" (click)="creationMode.set(false)">Cancelar</button>
        <button class="btn-primary" style="flex: 1;" [disabled]="!newCardQuestion || !newCardAnswer" (click)="saveCustomCard()">Salvar Card</button>
      </div>
    </div>
  } @else if (!sessionActive()) {
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

      <div style="display: flex; gap: 12px; width: 100%;">
        <button class="qty-btn" style="flex: 1; text-align: center; justify-content: center; background: rgba(255,255,255,0.02);" (click)="creationMode.set(true)">+ Criar Card</button>
        <button class="btn-primary" style="flex: 2;" [disabled]="availableCardsCount() === 0" (click)="startSession()">Começar revisão →</button>
      </div>
    </div>

    <!-- BIBLIOTECA DE FLASHCARDS -->
    <div class="library-section">
      <div class="library-header">
        <h2>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
          Meus Flashcards
        </h2>
        <span class="library-count">{{ allCards().length }} cards</span>
      </div>

      <!-- Filtro de busca -->
      <div class="library-search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" [ngModel]="searchFilter()" (ngModelChange)="searchFilter.set($event)" placeholder="Buscar flashcard..." />
      </div>

      <!-- Abas: Todos / Meus Cards -->
      <div class="library-tabs">
        <button class="tab-btn" [class.active]="libraryTab() === 'all'" (click)="libraryTab.set('all')">
          Todos ({{ allCards().length }})
        </button>
        <button class="tab-btn" [class.active]="libraryTab() === 'custom'" (click)="libraryTab.set('custom')">
          Meus Cards ({{ customCardsCount() }})
        </button>
      </div>

      @if (filteredLibraryCards().length === 0) {
        <div class="library-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.3;">
            <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
          <p>Nenhum flashcard encontrado.</p>
        </div>
      } @else {
        @for (group of groupedLibraryCards(); track group.category) {
          <div class="lib-category">
            <button class="lib-cat-header" (click)="toggleCategoryExpanded(group.category)">
              <span class="lib-cat-name">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                  [style.transform]="expandedCategories().has(group.category) ? 'rotate(90deg)' : 'rotate(0)'"
                  style="transition: transform 0.2s;">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
                {{ group.category }}
              </span>
              <span class="lib-cat-count">{{ group.cards.length }}</span>
            </button>

            @if (expandedCategories().has(group.category)) {
              <div class="lib-cards-list" @listAnimation>
                @for (card of group.cards; track card.id) {
                  <div class="lib-card-item" [class.custom]="flashcardsService.isCustomCard(card.id)">
                    <div class="lib-card-content" (click)="togglePreview(card.id)">
                      <div class="lib-card-question">
                        <span class="lib-q-label">Q</span>
                        {{ card.question }}
                      </div>
                      @if (previewCardId() === card.id) {
                        <div class="lib-card-answer">
                          <span class="lib-a-label">R</span>
                          {{ card.answer }}
                        </div>
                      }
                    </div>
                    <div class="lib-card-actions">
                      @if (card.stats.timesReviewed > 0) {
                        <span class="lib-card-stat" [title]="'Revisado ' + card.stats.timesReviewed + ' vezes'">
                          {{ card.stats.timesReviewed }}×
                        </span>
                      }
                      @if (flashcardsService.isCustomCard(card.id)) {
                        <button class="lib-delete-btn" title="Apagar flashcard" (click)="confirmDelete(card); $event.stopPropagation()">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      }
    </div>

    <!-- Modal de confirmação de exclusão -->
    @if (deletingCard()) {
      <div class="delete-overlay" (click)="deletingCard.set(null)">
        <div class="delete-modal" (click)="$event.stopPropagation()">
          <div class="delete-modal-icon">🗑️</div>
          <h3>Apagar flashcard?</h3>
          <p class="delete-modal-question">"{{ deletingCard()!.question }}"</p>
          <p class="delete-modal-sub">Essa ação não pode ser desfeita.</p>
          <div class="delete-modal-actions">
            <button class="qty-btn" (click)="deletingCard.set(null)">Cancelar</button>
            <button class="btn-danger" (click)="executeDelete()">Apagar</button>
          </div>
        </div>
      </div>
    }
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

/* ===== LIBRARY SECTION ===== */
.library-section {
  margin-top: 32px; padding: 24px; border-radius: var(--radius-lg);
  background: var(--bg-card); border: 1px solid var(--border-card);
}
.library-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
}
.library-header h2 {
  font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; gap: 8px;
}
.library-count {
  font-size: 0.78rem; color: var(--text-muted); font-weight: 600;
  padding: 4px 10px; border-radius: 999px; background: rgba(255,255,255,0.05);
}
.library-search {
  display: flex; align-items: center; gap: 8px; padding: 9px 14px; border-radius: 8px;
  background: rgba(255,255,255,0.04); border: 1px solid var(--border-card); margin-bottom: 12px;
}
.library-search svg { color: var(--text-muted); flex-shrink: 0; }
.library-search input {
  flex: 1; background: transparent; border: none; outline: none;
  color: var(--text-primary); font-size: 0.85rem;
}
.library-search input::placeholder { color: var(--text-muted); }

.library-tabs {
  display: flex; gap: 4px; margin-bottom: 16px; background: rgba(255,255,255,0.03);
  border-radius: 8px; padding: 3px;
}
.tab-btn {
  flex: 1; padding: 7px 14px; border-radius: 6px; font-size: 0.8rem; font-weight: 600;
  background: transparent; border: none; color: var(--text-muted); cursor: pointer;
  transition: all 0.2s;
  &:hover { color: var(--text-secondary); }
  &.active { background: rgba(255,255,255,0.08); color: var(--text-primary); }
}

.library-empty {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 40px; text-align: center;
}
.library-empty p { font-size: 0.85rem; color: var(--text-muted); }

.lib-category { margin-bottom: 4px; }
.lib-cat-header {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 10px 12px; border-radius: 8px; background: rgba(255,255,255,0.03);
  border: none; color: var(--text-secondary); cursor: pointer; transition: all 0.15s;
  &:hover { background: rgba(255,255,255,0.06); }
}
.lib-cat-name {
  display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 600;
}
.lib-cat-count {
  font-size: 0.75rem; color: var(--text-muted); font-weight: 700;
  background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 999px;
}

.lib-cards-list {
  display: flex; flex-direction: column; gap: 2px; padding: 4px 0 8px 0;
  overflow: hidden;
}
.lib-card-item {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 10px 12px; border-radius: 6px; gap: 12px;
  transition: background 0.15s;
  &:hover { background: rgba(255,255,255,0.03); }
  &.custom { border-left: 2px solid var(--accent); }
}
.lib-card-content {
  flex: 1; cursor: pointer; display: flex; flex-direction: column; gap: 8px; min-width: 0;
}
.lib-card-question {
  font-size: 0.84rem; color: var(--text-secondary); line-height: 1.4;
  display: flex; gap: 8px; align-items: flex-start;
}
.lib-q-label {
  flex-shrink: 0; width: 20px; height: 20px; border-radius: 4px; display: flex;
  align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 800;
  background: rgba(96,165,250,0.15); color: #60a5fa;
}
.lib-card-answer {
  font-size: 0.82rem; color: var(--text-muted); line-height: 1.4;
  display: flex; gap: 8px; align-items: flex-start; padding-top: 4px;
  border-top: 1px solid rgba(255,255,255,0.04);
  animation: fadeIn 0.2s ease;
}
.lib-a-label {
  flex-shrink: 0; width: 20px; height: 20px; border-radius: 4px; display: flex;
  align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 800;
  background: rgba(16,185,129,0.15); color: #10b981;
}
.lib-card-actions {
  display: flex; align-items: center; gap: 8px; flex-shrink: 0;
}
.lib-card-stat {
  font-size: 0.72rem; color: var(--text-muted); font-weight: 600;
}
.lib-delete-btn {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 6px;
  background: transparent; border: 1px solid transparent;
  color: var(--text-muted); cursor: pointer; transition: all 0.15s;
  &:hover { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.2); color: var(--red); }
}

/* Delete modal */
.delete-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
  animation: fadeIn 0.15s ease;
}
.delete-modal {
  background: var(--bg-card); border: 1px solid var(--border-card); border-radius: var(--radius-lg);
  padding: 32px; max-width: 400px; width: 90%; text-align: center;
  display: flex; flex-direction: column; gap: 12px; align-items: center;
  box-shadow: 0 16px 48px rgba(0,0,0,0.5);
}
.delete-modal-icon { font-size: 2rem; }
.delete-modal h3 { font-size: 1.1rem; font-weight: 700; }
.delete-modal-question {
  font-size: 0.85rem; color: var(--text-muted); font-style: italic;
  max-width: 300px; line-height: 1.4;
}
.delete-modal-sub { font-size: 0.78rem; color: var(--red); opacity: 0.8; }
.delete-modal-actions { display: flex; gap: 12px; width: 100%; margin-top: 8px; }
.delete-modal-actions .qty-btn { flex: 1; text-align: center; justify-content: center; }
.btn-danger {
  flex: 1; padding: 10px 20px; border-radius: 999px; font-size: 0.85rem; font-weight: 600;
  background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: var(--red);
  cursor: pointer; transition: all 0.2s;
  &:hover { background: rgba(239,68,68,0.25); }
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class FlashcardsComponent implements OnInit, OnDestroy {
  sessionActive = signal(false);
  creationMode = signal(false);
  desiredCount = 10;
  selectedCategories = signal<Set<string>>(new Set());

  // Form for custom cards
  newCardQuestion = '';
  newCardAnswer = '';
  newCardCategory = 'Personalizado';

  // Library state
  searchFilter = signal('');
  libraryTab = signal<'all' | 'custom'>('all');
  expandedCategories = signal<Set<string>>(new Set());
  previewCardId = signal<string | null>(null);
  deletingCard = signal<FlashcardRecord | null>(null);

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

  customCardsCount = computed(() =>
    this.allCards().filter(c => this.flashcardsService.isCustomCard(c.id)).length
  );

  filteredLibraryCards = computed(() => {
    let cards = this.allCards();
    if (this.libraryTab() === 'custom') {
      cards = cards.filter(c => this.flashcardsService.isCustomCard(c.id));
    }
    const filter = this.searchFilter().toLowerCase().trim();
    if (filter) {
      cards = cards.filter(c =>
        c.question.toLowerCase().includes(filter) ||
        c.answer.toLowerCase().includes(filter) ||
        c.category.toLowerCase().includes(filter)
      );
    }
    return cards;
  });

  groupedLibraryCards = computed(() => {
    const cards = this.filteredLibraryCards();
    const map = new Map<string, FlashcardRecord[]>();
    for (const c of cards) {
      const group = map.get(c.category) || [];
      group.push(c);
      map.set(c.category, group);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, cards]) => ({ category, cards }));
  });

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

    // Auto-expand library categories whenever new categories appear (e.g. after service loads)
    effect(() => {
      const cats = this.categories();
      if (cats.length > 0) {
        this.expandedCategories.set(new Set(cats));
      }
    });
  }

  ngOnInit() {
    // Select all categories by default
    this.selectedCategories.set(new Set(this.categories()));
    // Expand all categories in the library so cards are visible immediately
    this.expandedCategories.set(new Set(this.categories()));
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

  saveCustomCard() {
    if (!this.newCardQuestion.trim() || !this.newCardAnswer.trim()) return;
    this.flashcardsService.addCustomCard(this.newCardQuestion, this.newCardAnswer, this.newCardCategory);
    this.newCardQuestion = '';
    this.newCardAnswer = '';
    this.creationMode.set(false);
  }

  toggleCategoryExpanded(cat: string) {
    const current = new Set(this.expandedCategories());
    if (current.has(cat)) {
      current.delete(cat);
    } else {
      current.add(cat);
    }
    this.expandedCategories.set(current);
  }

  togglePreview(cardId: string) {
    this.previewCardId.set(this.previewCardId() === cardId ? null : cardId);
  }

  confirmDelete(card: FlashcardRecord) {
    this.deletingCard.set(card);
  }

  executeDelete() {
    const card = this.deletingCard();
    if (card) {
      this.flashcardsService.deleteCustomCard(card.id);
      this.deletingCard.set(null);
    }
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
