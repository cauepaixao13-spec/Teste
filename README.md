# RedalMind — Plataforma de Redação ENEM

SPA completa em Angular 17 com Landing Page pública, autenticação real (LocalStorage), flashcards com CRUD completo, metas, configurações persistentes e dashboard com dados reais de uso.

---

## 🚀 Como executar

### Pré-requisitos
- Node.js **18+** instalado → https://nodejs.org

### Instalação e execução

```bash
# 1. Entre na pasta do projeto
cd teste

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm start
```

O browser abrirá automaticamente em **http://localhost:4200**

> ⚠️ **Sempre rode `npm install` depois de puxar uma atualização deste projeto.**
> Sempre que uma dependência nova for adicionada (por exemplo, o Chart.js), o
> `node_modules` da sua cópia local fica desatualizado até você rodar
> `npm install` de novo. Esquecer esse passo é a causa mais comum de "o projeto
> não abre"/"trava" ao rodar `ng serve` depois de atualizar os arquivos.

### Build de produção

```bash
npm run build
```

Os arquivos ficam em `dist/redamind-app/browser/`. Este comando foi testado e
gera build limpo (sem erros) antes da entrega.

---

## 🔑 Acesso

Não existe mais login fixo/fake. Crie sua conta em **/registrar** (nome, e-mail,
senha e plano) — os dados ficam salvos no LocalStorage do seu navegador. Depois
é só entrar em **/login** com o e-mail e senha cadastrados.

---

## 🗺️ Estrutura de rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing Page pública |
| `/login` | Entrar com e-mail/senha |
| `/registrar` | Criar conta (nome, e-mail, senha, plano, LGPD) |
| `/dashboard` | Redireciona para Visão Geral |
| `/dashboard/visao-geral` | Dashboard principal (streak/XP/nível reais + gráficos) |
| `/dashboard/desafio-semanal` | Editor de redação com checklist ENEM |
| `/dashboard/modulos` | Grid de módulos com progresso |
| `/dashboard/flashcards` | Revisão (repetição espaçada) + CRUD completo ("Meus Flashcards") |
| `/dashboard/evolucao` | Gráficos de evolução (tempo estudado é real; nota é exemplo — ver nota abaixo) |
| `/dashboard/metas` | Metas automáticas (reais) + metas personalizadas (CRUD) |
| `/dashboard/ranking` | Ranking semanal gamificado |
| `/dashboard/configuracoes` | Perfil, plano, notificações, tema, metas de estudo, zona de perigo |

---

## 🏗️ Arquitetura Angular 17

```
src/app/
├── core/
│   ├── guards/auth.guard.ts          ← Protege rotas do dashboard
│   ├── models/                       ← Interfaces de dados (User, Flashcard, Goal)
│   ├── utils/password.util.ts        ← Hash simples de senha (ver comentário no arquivo)
│   └── services/
│       ├── storage.service.ts        ← Única porta de entrada/saída do LocalStorage
│       ├── auth.service.ts           ← Registro/login/sessão/configurações do usuário
│       ├── flashcards.service.ts     ← CRUD de flashcards + sessões de estudo + streak/XP
│       ├── goals.service.ts          ← CRUD de metas personalizadas
│       ├── theme.service.ts          ← Aplica o tema escolhido de verdade (data-theme)
│       └── data.service.ts           ← Dados de EXEMPLO (nota/competências — sem motor de correção de IA)
├── shared/
│   ├── charts/                       ← Biblioteca de gráficos (wrapper sobre Chart.js)
│   ├── carousel/                     ← Carrossel genérico (marquee contínuo via CSS)
│   └── brand/                        ← Logo/ícone reutilizável
├── features/
│   ├── public/landing/               ← Landing Page
│   ├── auth/login/ e auth/register/  ← Autenticação real
│   └── dashboard/                    ← Área interna (layout + sidebar + páginas)
├── app.component.ts                  ← Root com <router-outlet>
├── app.config.ts                     ← Providers (router, animations, http)
└── app.routes.ts                     ← Lazy loading de todas as rotas
```

### Decisões de arquitetura

- **Standalone Components** — Angular 17, sem NgModules
- **Lazy Loading** — todos os componentes carregados sob demanda
- **Signals** — estado reativo com `signal()`/`computed()`/`effect()`
- **AuthGuard funcional** — `CanActivateFn` protege `/dashboard/**`
- **Chart.js** — todos os gráficos (linha, barra, multi-linha, radar, donut) via uma camada de componentes reutilizáveis em `shared/charts/`
- **LocalStorage como "banco de dados"** — isolado por usuário (cada registro é prefixado com o id do usuário logado); ver `storage.service.ts`
- **CSS Custom Properties** — design system centralizado em `styles.scss`, incluindo os 3 temas (`dark`/`midnight`/`navy`)
- **Mobile First** — responsivo, com menu hambúrguer real no dashboard abaixo de 768px

### ⚠️ Limitação conhecida (sem dados fictícios "escondidos")

Este projeto não tem um motor de correção de redação por IA. Por isso, o
**histórico de notas** e o **radar de competências** (em Visão Geral/Evolução)
continuam sendo dados de exemplo (`data.service.ts`) — não haveria como
gerá-los de verdade sem uma redação real sendo corrigida por algum modelo.
Todo o resto (streak, XP, nível, flashcards revisados, tempo estudado, metas)
já é 100% calculado a partir da atividade real registrada no navegador.

---

## 🎨 Design System

| Token | Valor |
|-------|-------|
| `--bg-deepest` | `#04070f` |
| `--bg-dark` | `#070c18` |
| `--bg-card` | `#0d1526` |
| `--accent` | `#00c4ff` |
| `--violet` | `#7c3aed` |
| `--sidebar-w` | `220px` |

Temas alternativos (`midnight`, `navy`) sobrescrevem esses tokens — ver
`styles.scss` e `theme.service.ts`.
