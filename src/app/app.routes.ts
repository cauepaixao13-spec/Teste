import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/public/landing/landing.component').then(m => m.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'registrar',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'visao-geral', pathMatch: 'full' },
      {
        path: 'visao-geral',
        loadComponent: () =>
          import('./features/dashboard/pages/visao-geral/visao-geral.component').then(m => m.VisaoGeralComponent),
      },
      {
        path: 'desafio-semanal',
        loadComponent: () =>
          import('./features/dashboard/pages/desafio-semanal/desafio-semanal.component').then(m => m.DesafioSemanalComponent),
      },
      {
        path: 'modulos',
        loadComponent: () =>
          import('./features/dashboard/pages/modulos/modulos.component').then(m => m.ModulosComponent),
      },
      {
        path: 'flashcards',
        loadComponent: () =>
          import('./features/dashboard/pages/flashcards/flashcards.component').then(m => m.FlashcardsComponent),
      },
      {
        path: 'evolucao',
        loadComponent: () =>
          import('./features/dashboard/pages/evolucao/evolucao.component').then(m => m.EvolucaoComponent),
      },
      {
        path: 'metas',
        loadComponent: () =>
          import('./features/dashboard/pages/metas/metas.component').then(m => m.MetasComponent),
      },
      {
        path: 'ranking',
        loadComponent: () =>
          import('./features/dashboard/pages/ranking/ranking.component').then(m => m.RankingComponent),
      },
      {
        path: 'configuracoes',
        loadComponent: () =>
          import('./features/dashboard/pages/configuracoes/configuracoes.component').then(m => m.ConfiguracoesComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
