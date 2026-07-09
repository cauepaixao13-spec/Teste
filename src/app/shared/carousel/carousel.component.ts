import {
  Component, Input, ContentChild, TemplateRef, HostBinding
} from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';

/**
 * Carrossel de rolagem contínua e infinita (estilo "marquee"), genérico e
 * reutilizável — funciona com qualquer lista de itens via content projection
 * (não é exclusivo de depoimentos).
 *
 * Como funciona o loop infinito: a lista de itens é renderizada duas vezes,
 * lado a lado, dentro de uma faixa (`.rc-track`) que desliza continuamente
 * de `translateX(0)` até `translateX(-50%)` via CSS puro (sem setInterval).
 * Como as duas metades são idênticas, quando a animação chega em -50% ela
 * está exatamente sobre o ponto de partida da segunda cópia — reinicia o
 * ciclo (`0%`) e ninguém percebe a costura. É por isso que o movimento nunca
 * "para" no fim da lista.
 *
 * Passar o mouse (ou tocar, no celular) pausa a animação exatamente onde
 * está (`animation-play-state: paused`); ao soltar, ela retoma sozinha do
 * mesmo ponto — não há "reinício do zero".
 *
 * Uso:
 * <redamind-carousel [items]="testimonials" [itemsPerView]="3">
 *   <ng-template let-item>
 *     <div class="my-card">{{ item.quote }}</div>
 *   </ng-template>
 * </redamind-carousel>
 */
@Component({
  selector: 'redamind-carousel',
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet],
  template: `
<div class="rc-marquee"
     (mouseenter)="paused = true" (mouseleave)="paused = false"
     (touchstart)="paused = true" (touchend)="paused = false">
  <div class="rc-track" [class.paused]="paused"
       [style.animationDuration]="durationSeconds + 's'"
       [style.--ipv]="effectiveItemsPerView">
    <!-- Primeira cópia (conteúdo real) -->
    @for (item of items; track $index) {
      <div class="rc-slide">
        <ng-container *ngTemplateOutlet="template; context: { $implicit: item }"></ng-container>
      </div>
    }
    <!-- Segunda cópia, idêntica, só pra fechar o loop visualmente (escondida de leitores de tela) -->
    @for (item of items; track $index) {
      <div class="rc-slide" aria-hidden="true">
        <ng-container *ngTemplateOutlet="template; context: { $implicit: item }"></ng-container>
      </div>
    }
  </div>
</div>
  `,
  styles: [`
.rc-marquee { overflow: hidden; width: 100%; -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 40px, #000 calc(100% - 40px), transparent 100%); mask-image: linear-gradient(90deg, transparent 0, #000 40px, #000 calc(100% - 40px), transparent 100%); }

.rc-track {
  display: flex; gap: 20px; width: max-content;
  animation-name: rc-scroll; animation-timing-function: linear; animation-iteration-count: infinite;
}
.rc-track.paused { animation-play-state: paused; }

@keyframes rc-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.rc-slide {
  /* Largura fixa dentro de uma faixa (clamp), baseada na viewport — não em % do
     pai, porque o pai (.rc-track) usa width:max-content (seu tamanho depende do
     total dos filhos), então "% do pai" viraria uma referência circular. */
  flex: 0 0 clamp(240px, calc(88vw / var(--ipv, 3)), 340px);
}

@media (max-width: 640px) {
  .rc-slide { flex-basis: 82vw; }
}
  `]
})
export class CarouselComponent<T = unknown> {
  @Input() items: T[] = [];
  /** Quantos cartões cabem lado a lado (aproximado — o marquee é fluido, não paginado). */
  @Input() itemsPerView = 3;
  /** Segundos que cada item leva pra atravessar a tela — controla a velocidade do movimento. */
  @Input() secondsPerItem = 4;

  @ContentChild(TemplateRef) template!: TemplateRef<any>;

  paused = false;

  get effectiveItemsPerView(): number {
    return Math.max(1, this.itemsPerView);
  }

  /** Duração total de um ciclo completo, proporcional à quantidade de itens (mantém a velocidade visual constante). */
  get durationSeconds(): number {
    return Math.max(1, this.items.length) * this.secondsPerItem;
  }
}
