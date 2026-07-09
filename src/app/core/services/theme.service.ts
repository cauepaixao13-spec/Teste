import { Injectable, effect } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * ThemeService — aplica de verdade o tema escolhido em Configurações.
 *
 * Sempre que `settings.theme` do usuário logado mudar, escrevemos o atributo
 * `data-theme` no `<html>`, que é o que os seletores `html[data-theme="..."]`
 * em `styles.scss` usam para sobrescrever as variáveis de cor. Ou seja: a
 * troca de tema não é só um botão bonito, ela realmente muda o app.
 *
 * É instanciado uma única vez, no `AppComponent` (root), pra rodar durante
 * toda a vida da aplicação.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  constructor(private auth: AuthService) {
    effect(() => {
      const theme = this.auth.currentUser()?.settings?.theme ?? 'dark';
      // "dark" é o padrão (mesmas variáveis do :root), então não precisa de atributo especial.
      if (theme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
    });
  }
}
