import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: [`
    :host { display: block; min-height: 100vh; }
  `]
})
export class AppComponent {
  // Injetado só para o ThemeService ser instanciado (e seu effect() começar a rodar)
  // assim que o app sobe — ele não precisa ser chamado diretamente daqui.
  constructor(private themeService: ThemeService) {}
}
