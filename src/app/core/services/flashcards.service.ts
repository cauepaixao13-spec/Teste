import { Injectable, Signal, computed, effect, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { FlashcardRecord, StudySession } from '../models/flashcard.model';

interface CardProgress {
  timesReviewed: number;
  timesEasy: number;
  timesHard: number;
  lastReviewedAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class FlashcardsService {
  private baseCards = signal<FlashcardRecord[]>([]);
  private sessions = signal<StudySession[]>([]);

  readonly cards$: Signal<FlashcardRecord[]> = this.baseCards.asReadonly();
  readonly sessions$: Signal<StudySession[]> = this.sessions.asReadonly();

  readonly categories = computed(() => {
    const set = new Set(this.cards$().map(c => c.category).filter(Boolean));
    return Array.from(set).sort();
  });

  readonly cardsReviewedToday = computed(() => {
    const today = this.todayKey();
    return this.sessions()
      .filter(s => s.date === today)
      .reduce((sum, s) => sum + s.cardsReviewed, 0);
  });

  readonly studyMinutesThisWeek = computed(() => {
    const { start } = this.currentWeekRange();
    return this.sessions()
      .filter(s => new Date(s.date) >= start)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
  });

  readonly streak = computed(() => {
    const days = new Set(this.sessions().map(s => s.date));
    let count = 0;
    const cursor = new Date();

    if (!days.has(this.formatDate(cursor))) cursor.setDate(cursor.getDate() - 1);

    while (days.has(this.formatDate(cursor))) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  });

  readonly totalReviews = computed(() =>
    this.cards$().reduce((sum, c) => sum + c.stats.timesReviewed, 0)
  );

  readonly totalXp = computed(() =>
    this.cards$().reduce((sum, c) => sum + c.stats.timesEasy * 15 + c.stats.timesHard * 5, 0)
  );

  readonly level = computed(() => Math.floor(this.totalXp() / 500) + 1);

  constructor(private storage: StorageService, private auth: AuthService) {
    effect(() => {
      const userId = this.auth.currentUser()?.id ?? null;
      this.loadForUser(userId);
    });
  }

  private progressKey(userId: string) { return `flashcards-progress:${userId}`; }
  private sessionsKey(userId: string) { return `study-sessions:${userId}`; }

  private loadForUser(userId: string | null) {
    if (!userId) {
      this.baseCards.set([]);
      this.sessions.set([]);
      return;
    }

    const predefined = this.getPredefinedCards();
    const progressMap = this.storage.get<Record<string, CardProgress>>(this.progressKey(userId), {});

    const mergedCards = predefined.map(c => {
      const savedStats = progressMap[c.id];
      if (savedStats) {
        c.stats = savedStats;
      }
      return c;
    });

    this.baseCards.set(mergedCards);
    this.sessions.set(this.storage.get<StudySession[]>(this.sessionsKey(userId), []));
  }

  private persistProgress() {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    const progressMap: Record<string, CardProgress> = {};
    for (const c of this.cards$()) {
      progressMap[c.id] = c.stats;
    }
    this.storage.set(this.progressKey(userId), progressMap);
  }

  private persistSessions() {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    this.storage.set(this.sessionsKey(userId), this.sessions());
  }

  private getPredefinedCards(): FlashcardRecord[] {
    const now = new Date().toISOString();
    const seeds: [string, string, string, string][] = [
      ['c_est_01', 'O que é a tese na redação do ENEM?', 'É o posicionamento central do autor sobre o tema, que será defendido ao longo do texto.', 'Estrutura'],
      ['c_est_02', 'Quantos parágrafos são recomendados para a redação do ENEM?', 'O ideal são 4 parágrafos: 1 de introdução, 2 de desenvolvimento e 1 de conclusão.', 'Estrutura'],
      ['c_est_03', 'Qual o objetivo da introdução?', 'Apresentar o tema (contextualização) e a tese (ponto de vista a ser defendido).', 'Estrutura'],
      ['c_est_04', 'O que é o tópico frasal?', 'A frase inicial do parágrafo de desenvolvimento que resume a ideia principal que será discutida nele.', 'Estrutura'],
      ['c_est_05', 'Como deve ser a conclusão?', 'Deve retomar brevemente a tese e apresentar a proposta de intervenção completa.', 'Estrutura'],
      ['c_est_06', 'Qual a função do desenvolvimento 1 (D1)?', 'Defender o primeiro argumento apontado na tese, trazendo fundamentação e reflexão.', 'Estrutura'],
      ['c_est_07', 'Qual a função do desenvolvimento 2 (D2)?', 'Defender o segundo argumento da tese, somando à discussão sem contradizer o D1.', 'Estrutura'],
      ['c_est_08', 'Pode apresentar argumento novo na conclusão?', 'Não. A conclusão serve para fechar as ideias já apresentadas e propor a intervenção.', 'Estrutura'],
      ['c_est_09', 'O que é projeto de texto estratégico?', 'É o planejamento prévio que garante que todas as partes do texto estejam conectadas e a tese seja provada.', 'Estrutura'],
      ['c_est_10', 'Como estruturar um parágrafo de desenvolvimento?', 'Tópico frasal + Repertório/Fundamentação + Análise/Argumentação + Fechamento.', 'Estrutura'],
      ['c_coe_01', 'O que é coesão textual?', 'É a conexão lógica entre frases e parágrafos usando conectivos, pronomes e sinônimos.', 'Coesão'],
      ['c_coe_02', 'Cite conectivos para iniciar o D1.', 'Em primeiro lugar, Sob esse viés, Mormente, Primeiramente.', 'Coesão'],
      ['c_coe_03', 'Cite conectivos para iniciar o D2 (adição/soma).', 'Ademais, Além disso, Outrossim, Somado a isso.', 'Coesão'],
      ['c_coe_04', 'Cite conectivos para iniciar a conclusão.', 'Portanto, Por conseguinte, Infere-se, portanto, que, Dessa forma.', 'Coesão'],
      ['c_coe_05', 'Qual a diferença entre "mas" e "mais"?', '"Mas" indica oposição (porém); "mais" indica quantidade/adição.', 'Coesão'],
      ['c_coe_06', 'O que é coesão referencial?', 'Uso de pronomes ou sinônimos para evitar a repetição da mesma palavra no texto.', 'Coesão'],
      ['c_coe_07', 'Como evitar a repetição de palavras?', 'Usando sinônimos, hiperônimos, hipônimos ou pronomes relativos.', 'Coesão'],
      ['c_coe_08', 'O que é coesão sequencial?', 'Uso de conjunções e conectivos para dar progressão às ideias e ligar os parágrafos.', 'Coesão'],
      ['c_coe_09', 'É obrigatório usar conectivos no início dos parágrafos?', 'Sim, pelo menos dois parágrafos de desenvolvimento e a conclusão devem começar com operadores interparágrafos.', 'Coesão'],
      ['c_coe_10', 'Qual o perigo do gerúndio excessivo?', 'Pode causar ambiguidade, empobrecer a coesão ou gerar gerundismo. Use com moderação.', 'Coesão'],
      ['c_pro_01', 'Quais são os 5 elementos obrigatórios da Proposta de Intervenção?', 'Agente, Ação, Modo/Meio, Finalidade e Detalhamento.', 'Proposta de Intervenção'],
      ['c_pro_02', 'O que é o Agente na proposta de intervenção?', 'Quem vai executar a ação para solucionar ou mitigar o problema (ex: Estado, Escolas, Mídia).', 'Proposta de Intervenção'],
      ['c_pro_03', 'O que é a Ação na proposta de intervenção?', 'O que deve ser feito de forma prática para resolver o problema.', 'Proposta de Intervenção'],
      ['c_pro_04', 'O que é o Modo/Meio na proposta de intervenção?', 'Como a ação será realizada, por qual caminho (ex: por meio de verbas governamentais, mediante campanhas).', 'Proposta de Intervenção'],
      ['c_pro_05', 'O que é a Finalidade na proposta de intervenção?', 'Para que a ação será feita, o objetivo final (ex: a fim de reduzir a desigualdade).', 'Proposta de Intervenção'],
      ['c_pro_06', 'O que é o Detalhamento na proposta de intervenção?', 'Uma informação extra explicativa sobre o agente, a ação, o meio ou a finalidade.', 'Proposta de Intervenção'],
      ['c_pro_07', 'O que é "GOMIFES"?', 'Mnemônico para agentes: Governo, ONGs, Mídia, Indústria, Família, Escola, Sociedade.', 'Proposta de Intervenção'],
      ['c_pro_08', 'Pode ter mais de uma proposta de intervenção?', 'Sim, mas apenas UMA será avaliada em sua completude. Foque em fazer uma 100% completa.', 'Proposta de Intervenção'],
      ['c_pro_09', 'Por que a proposta não pode ferir os Direitos Humanos?', 'Desrespeitar os Direitos Humanos (ex: apoiar tortura, censura) zera a Competência 5.', 'Proposta de Intervenção'],
      ['c_pro_10', 'A proposta precisa resolver todo o problema do Brasil?', 'Não, ela precisa apenas ser viável e estar diretamente relacionada aos argumentos apresentados no texto.', 'Proposta de Intervenção'],
      ['c_rep_01', 'O que é repertório legitimado?', 'Informação respaldada por áreas do conhecimento (ciência, filosofia, história, artes).', 'Repertório'],
      ['c_rep_02', 'O que é repertório pertinente?', 'Aquele que tem relação direta com pelo menos um dos elementos do tema da redação.', 'Repertório'],
      ['c_rep_03', 'O que é repertório produtivo?', 'Quando o repertório não é apenas jogado no texto, mas sim relacionado e analisado junto ao argumento.', 'Repertório'],
      ['c_rep_04', 'Cite um repertório coringa sobre direitos/leis.', 'Constituição Federal de 1988, que garante direitos básicos como saúde, educação e igualdade.', 'Repertório'],
      ['c_rep_05', 'O que defende a teoria de Zygmunt Bauman (Modernidade Líquida)?', 'As relações e instituições da sociedade contemporânea são fluidas, passageiras e sem solidez.', 'Repertório'],
      ['c_rep_06', 'Filmes, séries e músicas podem ser usados como repertório?', 'Sim! A cultura pop é uma excelente área do conhecimento, desde que conectada de forma produtiva à argumentação.', 'Repertório'],
      ['c_rep_07', 'Como usar alusão histórica?', 'Citando um fato ou contexto do passado e comparando (por semelhança ou contraste) com a situação atual do problema.', 'Repertório'],
      ['c_rep_08', 'Posso inventar um dado estatístico?', 'Nunca. Dados inventados ou sem fonte confiável não são legitimados e prejudicam muito a nota.', 'Repertório'],
      ['c_rep_09', 'Quem são os contratualistas (como Hobbes e Locke) e o que defendem?', 'Eles defendem que o Estado deve garantir direitos e proteção aos cidadãos em troca da submissão às leis.', 'Repertório'],
      ['c_rep_10', 'Cite um repertório pertinente sobre invisibilidade social.', '"Cidadão de Papel", do jornalista Gilberto Dimenstein, onde os direitos existem apenas na lei e não na prática.', 'Repertório'],
      ['c_err_01', 'O que avalia a Competência 1 do ENEM?', 'O domínio da norma-padrão da língua escrita (ortografia, concordância, regência, crase, pontuação).', 'Competências e Erros'],
      ['c_err_02', 'O que avalia a Competência 2 do ENEM?', 'Compreensão da proposta de redação, estrutura do texto dissertativo-argumentativo e uso de repertório sociocultural.', 'Competências e Erros'],
      ['c_err_03', 'O que avalia a Competência 3 do ENEM?', 'Seleção, relação, organização e interpretação de fatos e opiniões em defesa de um ponto de vista (projeto de texto).', 'Competências e Erros'],
      ['c_err_04', 'O que avalia a Competência 4 do ENEM?', 'Demonstração de conhecimento dos mecanismos linguísticos (coesão) necessários para a argumentação.', 'Competências e Erros'],
      ['c_err_05', 'O que avalia a Competência 5 do ENEM?', 'Elaboração de proposta de intervenção viável para o problema abordado, respeitando os direitos humanos.', 'Competências e Erros'],
      ['c_err_06', 'O que é tangenciar o tema?', 'Abordar apenas o assunto geral, sem focar na delimitação específica ou no problema central proposto na frase-tema.', 'Competências e Erros'],
      ['c_err_07', 'O que significa fugir do tema na redação?', 'Escrever sobre um assunto totalmente diferente do exigido pela proposta (acarreta nota zero na redação).', 'Competências e Erros'],
      ['c_err_08', 'Posso usar a primeira pessoa (eu/nós) na redação?', 'Evite "eu" sempre. "Nós" pode ser tolerado, mas o ideal é manter a impessoalidade (ex: "nota-se", "é preciso").', 'Competências e Erros'],
      ['c_err_09', 'Posso copiar os textos motivadores na íntegra?', 'Não. Cópias puras são desconsideradas da contagem de linhas e prejudicam severamente a avaliação.', 'Competências e Erros'],
      ['c_err_10', 'O que são marcas de oralidade?', 'Expressões típicas da fala informal (ex: "pra", "né", "tá", "um monte", gírias), que diminuem a nota na Competência 1.', 'Competências e Erros']
    ];

    return seeds.map(([id, question, answer, category]) => ({
      id,
      question,
      answer,
      category,
      favorite: false,
      createdAt: now,
      updatedAt: now,
      stats: { timesReviewed: 0, timesEasy: 0, timesHard: 0, lastReviewedAt: null },
    }));
  }

  recordCardReview(id: string, rating: 'easy' | 'hard'): void {
    this.baseCards.update(list => list.map(c => {
      if (c.id !== id) return c;
      return {
        ...c,
        stats: {
          timesReviewed: c.stats.timesReviewed + 1,
          timesEasy: c.stats.timesEasy + (rating === 'easy' ? 1 : 0),
          timesHard: c.stats.timesHard + (rating === 'hard' ? 1 : 0),
          lastReviewedAt: new Date().toISOString(),
        },
      };
    }));
    this.persistProgress();
  }

  logSession(cardsReviewed: number, easyCount: number, hardCount: number, durationMinutes: number): void {
    const session: StudySession = {
      id: crypto.randomUUID(),
      date: this.todayKey(),
      cardsReviewed, easyCount, hardCount, durationMinutes,
      completedAt: new Date().toISOString(),
    };
    this.sessions.update(list => [...list, session]);
    this.persistSessions();
  }

  resetProgress(): void {
    this.baseCards.update(list => list.map(c => ({
      ...c,
      stats: { timesReviewed: 0, timesEasy: 0, timesHard: 0, lastReviewedAt: null },
    })));
    this.sessions.set([]);
    this.persistProgress();
    this.persistSessions();
  }

  studyMinutesByDay(days: number): { date: Date; minutes: number }[] {
    const byDate = new Map<string, number>();
    for (const s of this.sessions()) {
      byDate.set(s.date, (byDate.get(s.date) ?? 0) + s.durationMinutes);
    }

    const result: { date: Date; minutes: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push({ date: d, minutes: byDate.get(this.formatDate(d)) ?? 0 });
    }
    return result;
  }

  private formatDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  private todayKey(): string {
    return this.formatDate(new Date());
  }

  private currentWeekRange(): { start: Date; end: Date } {
    const now = new Date();
    const day = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  }
}
