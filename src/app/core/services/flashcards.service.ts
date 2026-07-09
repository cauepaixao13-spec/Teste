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
    const customCards = this.storage.get<FlashcardRecord[]>(`custom-flashcards:${userId}`, []);
    const progressMap = this.storage.get<Record<string, CardProgress>>(this.progressKey(userId), {});

    const mergedCards = [...predefined, ...customCards].map(c => {
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

  addCustomCard(question: string, answer: string, category: string = 'Personalizado'): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;

    const now = new Date().toISOString();
    const newCard: FlashcardRecord = {
      id: `custom_${crypto.randomUUID()}`,
      question,
      answer,
      category,
      favorite: false,
      createdAt: now,
      updatedAt: now,
      stats: { timesReviewed: 0, timesEasy: 0, timesHard: 0, lastReviewedAt: null }
    };

    // Obter cards customizados atuais
    const customKey = `custom-flashcards:${userId}`;
    const customCards = this.storage.get<FlashcardRecord[]>(customKey, []);
    customCards.push(newCard);
    
    // Salvar e atualizar a base
    this.storage.set(customKey, customCards);
    this.baseCards.update(list => [...list, newCard]);
  }

  deleteCustomCard(cardId: string): void {
    if (!cardId.startsWith('custom_')) return; // Protege cards predefinidos
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;

    const customKey = `custom-flashcards:${userId}`;
    const customCards = this.storage.get<FlashcardRecord[]>(customKey, []);
    const filtered = customCards.filter(c => c.id !== cardId);
    this.storage.set(customKey, filtered);

    // Remover do progresso salvo
    const progressMap = this.storage.get<Record<string, CardProgress>>(this.progressKey(userId), {});
    delete progressMap[cardId];
    this.storage.set(this.progressKey(userId), progressMap);

    this.baseCards.update(list => list.filter(c => c.id !== cardId));
  }

  isCustomCard(cardId: string): boolean {
    return cardId.startsWith('custom_');
  }

  private getPredefinedCards(): FlashcardRecord[] {
    const now = new Date().toISOString();
    const seeds: [string, string, string, string][] = [
      // Tópico 1: Estrutura do Texto (Introdução, Desenvolvimento, Conclusão)
      ['t1_1', 'O que deve conter na Introdução do ENEM?', 'Contextualização (apresentação do tema), ponte para o assunto e a Tese (posicionamento crítico).', '1. Estrutura do Texto'],
      ['t1_2', 'Qual a função do Tópico Frasal?', 'É a frase inicial do parágrafo de desenvolvimento que declara a ideia central (argumento) que será defendida ali.', '1. Estrutura do Texto'],
      ['t1_3', 'Como deve ser a estrutura ideal de um Desenvolvimento?', 'Tópico Frasal + Repertório/Fundamentação + Argumentação/Análise crítica + Fechamento do parágrafo.', '1. Estrutura do Texto'],
      ['t1_4', 'Qual a diferença entre Desenvolvimento 1 e 2?', 'O D1 foca no primeiro argumento (ex: causa) e o D2 no segundo argumento (ex: consequência), de forma complementar.', '1. Estrutura do Texto'],
      ['t1_5', 'A conclusão pode apresentar um novo argumento?', 'Não. A conclusão tem a função exclusiva de retomar a tese e apresentar a Proposta de Intervenção.', '1. Estrutura do Texto'],
      ['t1_6', 'Quantas linhas e parágrafos a redação costuma ter?', 'O modelo de excelência possui 4 parágrafos (1 Intro, 2 Desenv, 1 Conclusão) variando entre 6 e 8 linhas cada.', '1. Estrutura do Texto'],

      // Tópico 2: Proposta de Intervenção (Os 5 elementos obrigatórios da C5)
      ['t2_1', 'O que é o Agente na Proposta de Intervenção?', 'É o órgão, instituição ou indivíduo responsável por executar a ação (Dica: GOMIFES - Governo, ONGs, Mídia...).', '2. Proposta de Intervenção'],
      ['t2_2', 'O que caracteriza a Ação na Proposta?', 'É o verbo de ação que indica claramente o que será feito para solucionar ou mitigar o problema.', '2. Proposta de Intervenção'],
      ['t2_3', 'O que significa o Modo/Meio na Proposta?', 'Indica COMO a ação será realizada. Geralmente introduzido por "por meio de", "mediante", "através de".', '2. Proposta de Intervenção'],
      ['t2_4', 'O que é o Efeito/Finalidade na Proposta?', 'É o resultado esperado da ação. Ex: "a fim de mitigar a desigualdade", "com o intuito de...".', '2. Proposta de Intervenção'],
      ['t2_5', 'O que é o Detalhamento e onde se aplica?', 'É uma informação extra que especifica e explica melhor um dos 4 elementos (Agente, Ação, Modo ou Efeito).', '2. Proposta de Intervenção'],
      ['t2_6', 'A proposta pode ferir os Direitos Humanos?', 'Não! Sugerir censura, tortura ou restrição de direitos fundamentais zera a Competência 5.', '2. Proposta de Intervenção'],

      // Tópico 3: As 5 Competências de Avaliação do ENEM
      ['t3_1', 'O que é avaliado na Competência 1?', 'Domínio da modalidade escrita formal: ausência de erros de gramática, crase, vírgula e ortografia.', '3. As 5 Competências'],
      ['t3_2', 'O que é avaliado na Competência 2?', 'Compreensão do tema, estrutura dissertativo-argumentativa e uso de repertório sociocultural legitimado.', '3. As 5 Competências'],
      ['t3_3', 'O que a Competência 3 avalia?', 'Projeto de Texto. A capacidade de selecionar, relacionar e interpretar informações em defesa da tese.', '3. As 5 Competências'],
      ['t3_4', 'O que significa "Projeto de Texto" na C3?', 'O planejamento prévio: introduzir argumentos na introdução, desenvolvê-los no D1/D2, e resolvê-los na Conclusão.', '3. As 5 Competências'],
      ['t3_5', 'O que a Competência 4 avalia?', 'Mecanismos de Coesão. O uso correto e diversificado de conectivos inter e intraparágrafos.', '3. As 5 Competências'],
      ['t3_6', 'O que zera a Competência 5?', 'Ausência de proposta, proposta que não resolve o problema abordado ou que desrespeita os Direitos Humanos.', '3. As 5 Competências'],
      ['t3_7', 'Quantos pontos vale cada competência?', 'Cada uma vale 200 pontos (avaliadas de 40 em 40), totalizando 1000 pontos na redação.', '3. As 5 Competências'],

      // Tópico 4: Coesão e Coerência (Uso de conectivos e progressão textual)
      ['t4_1', 'O que é Coesão Interparágrafos?', 'O uso de conectivos no INÍCIO dos parágrafos para ligá-los ao anterior (Ex: "Nesse contexto", "Além disso").', '4. Coesão e Coerência'],
      ['t4_2', 'Quais são bons conectivos para iniciar o D1?', '"Sob esse viés", "Em primeiro plano", "Primeiramente", "Diante desse cenário".', '4. Coesão e Coerência'],
      ['t4_3', 'Quais são bons conectivos para iniciar o D2?', '"Ademais", "Outrossim", "Além disso", "Somado a isso".', '4. Coesão e Coerência'],
      ['t4_4', 'Quais são bons conectivos para a Conclusão?', '"Portanto", "Desse modo", "Evidencia-se, assim, que", "Logo".', '4. Coesão e Coerência'],
      ['t4_5', 'O que é Coesão Referencial?', 'O uso de pronomes ou sinônimos para evitar a repetição da mesma palavra no texto.', '4. Coesão e Coerência'],
      ['t4_6', 'Qual a diferença entre Coesão e Coerência?', 'Coesão é a ligação lógica das palavras/frases. Coerência é a lógica de sentido, sem contradições argumentativas.', '4. Coesão e Coerência'],

      // Tópico 5: Repertório Sociocultural Coringa
      ['t5_1', 'Bauman e a "Modernidade Líquida"', 'Relações, instituições e valores atuais são fluidos e superficiais. (Temas: redes sociais, consumo, relações).', '5. Repertório Sociocultural'],
      ['t5_2', 'Bourdieu e o "Capital Cultural"', 'Acúmulo de conhecimento transmitido socialmente. A falta dele explica a manutenção da desigualdade intergeracional.', '5. Repertório Sociocultural'],
      ['t5_3', 'Arendt e a "Banalidade do Mal"', 'Quando atitudes cruéis ou preconceitos se tornam normalizados e rotineiros (as pessoas param de refletir sobre as ações).', '5. Repertório Sociocultural'],
      ['t5_4', 'Bauman e as "Instituições Zumbis"', 'Instituições (Estado, família) que existem na teoria, mas na prática não cumprem seu papel. (Temas: Omissão estatal).', '5. Repertório Sociocultural'],
      ['t5_5', 'Dimenstein e o "Cidadão de Papel"', 'Ineficácia das leis no Brasil: direitos constitucionais existem no papel, mas não na realidade de muitos.', '5. Repertório Sociocultural'],
      ['t5_6', 'Constituição de 1988 como Coringa', 'O Artigo 6º garante direitos (saúde, educação, moradia). Cita-se para contrastar com a falha estatal em garanti-los.', '5. Repertório Sociocultural'],
      ['t5_7', 'O Contratualismo (Locke, Hobbes)', 'Cidadãos abdicam de liberdades em troca de proteção do Estado. A quebra desse Contrato Social gera os problemas.', '5. Repertório Sociocultural'],

      // Tópico 6: Estratégias Argumentativas
      ['t6_1', 'O que é argumentação por "Causa e Consequência"?', 'Expor no D1 a causa do problema (ex: omissão) e no D2 a consequência para a sociedade (ex: criminalidade).', '6. Estratégias Argumentativas'],
      ['t6_2', 'Como usar Dados Estatísticos produtivamente?', 'Nunca cite apenas o dado. Você deve interpretar o que ele significa e como comprova a sua tese.', '6. Estratégias Argumentativas'],
      ['t6_3', 'O que é Alusão Histórica?', 'Traçar paralelo entre um fato histórico e o presente, mostrando que o problema persiste ou como mudou.', '6. Estratégias Argumentativas'],
      ['t6_4', 'Argumentação por Exemplificação', 'Usar um caso real e notório (notícia ampla) para materializar que o problema existe na prática.', '6. Estratégias Argumentativas'],
      ['t6_5', 'Como evitar o argumento baseado em "Senso Comum"?', 'Baseando sua opinião em fatos, ciência ou história. Em vez de xingar o governo, explique COMO e POR QUE é ineficaz.', '6. Estratégias Argumentativas'],
      ['t6_6', 'Argumento por Autoridade', 'Citar a visão de especialista, pensador ou instituição renomada para respaldar o ponto de vista.', '6. Estratégias Argumentativas'],

      // Tópico 7: Gramática Aplicada à Redação
      ['t7_1', 'Quando é obrigatório o uso da Crase?', 'Na junção da preposição "a" exigida pelo termo anterior com o artigo feminino "a" do termo seguinte.', '7. Gramática Aplicada'],
      ['t7_2', 'A crase pode ocorrer antes de verbo?', 'Nunca! Também não ocorre antes de palavras masculinas ou pronome indefinido ("acesso a todos").', '7. Gramática Aplicada'],
      ['t7_3', 'Regra básica da vírgula entre Sujeito e Verbo', 'Nunca se deve separar o Sujeito do seu Verbo por vírgula, nem o Verbo do seu Complemento direto.', '7. Gramática Aplicada'],
      ['t7_4', 'Adjunto adverbial deslocado', 'Se for longo e deslocado pro início da frase, a vírgula é obrigatória (Ex: "No Brasil do século XXI, ...").', '7. Gramática Aplicada'],
      ['t7_5', 'Regência do verbo Assistir', 'No sentido de ver (TV), exige preposição (assistem a séries). Sentido de dar suporte não exige preposição.', '7. Gramática Aplicada'],
      ['t7_6', 'Concordância do verbo Fazer', 'O verbo "fazer" indicando tempo não vai para o plural. O correto é "Faz dez anos", e nunca "Fazem".', '7. Gramática Aplicada'],

      // Tópico 8: Eixos Temáticos Principais
      ['t8_1', 'Eixo: Tecnologia e Redes Sociais', 'Foque em impactos comportamentais (ansiedade), bolhas sociais (algoritmos) ou exclusão digital na periferia.', '8. Eixos Temáticos Principais'],
      ['t8_2', 'Eixo: Meio Ambiente', 'Relacionar com o capitalismo, exploração irracional pelo lucro e a omissão/falta de fiscalização governamental.', '8. Eixos Temáticos Principais'],
      ['t8_3', 'Eixo: Saúde Pública', 'Aborde a desigualdade de acesso (infraestrutura precária na periferia) ou a estigmatização de doenças mentais.', '8. Eixos Temáticos Principais'],
      ['t8_4', 'Eixo: Minorias e Grupos Vulneráveis', 'Foque no preconceito histórico enraizado (estrutural) e na falta de empatia e garantias civis da sociedade.', '8. Eixos Temáticos Principais'],
      ['t8_5', 'Eixo: Educação', 'Destaque a educação pública sucateada, evasão escolar para o subemprego e falta de infraestrutura.', '8. Eixos Temáticos Principais'],
      ['t8_6', 'Causa transversal (A Omissão Estatal)', 'A negligência do Estado em elaborar ou executar políticas públicas eficazes é a raiz de quase todos os temas.', '8. Eixos Temáticos Principais']
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
