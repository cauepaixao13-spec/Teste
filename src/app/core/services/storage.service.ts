import { Injectable } from '@angular/core';

/**
 * StorageService — única porta de entrada/saída para o LocalStorage no app.
 *
 * Por que centralizar isso num serviço em vez de chamar `localStorage` direto
 * em cada componente?
 * 1) Se um dia trocarmos LocalStorage por IndexedDB ou uma API real, só esse
 *    arquivo muda.
 * 2) `localStorage` pode lançar exceção (modo anônimo do Safari, quota
 *    excedida, SSR sem `window`, etc) — tratamos tudo num só lugar.
 * 3) Toda chave já sai prefixada com `redamind:`, evitando colisão com outras
 *    coisas que porventura estejam salvas no mesmo domínio.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly prefix = 'redamind:';

  /** Lê e faz o parse de JSON de uma chave. Se não existir ou der erro, devolve o `fallback`. */
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      // JSON corrompido ou localStorage indisponível — não derruba o app, só volta ao valor padrão.
      return fallback;
    }
  }

  /** Serializa e grava um valor. Retorna `false` silenciosamente se o storage estiver indisponível/cheio. */
  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch {
      /* noop */
    }
  }

  /** Lista todas as chaves (sem o prefixo) que começam com um determinado sufixo — útil para varrer registros por usuário. */
  keysStartingWith(partial: string): string[] {
    try {
      const out: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.prefix + partial)) out.push(k.slice(this.prefix.length));
      }
      return out;
    } catch {
      return [];
    }
  }
}
