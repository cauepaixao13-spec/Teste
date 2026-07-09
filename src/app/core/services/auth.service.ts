import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { hashPassword } from '../utils/password.util';
import {
  UserRecord, PublicUser, PlanId, UserSettings, DEFAULT_SETTINGS, toPublicUser
} from '../models/user.model';

/** Dados vindos do formulário de cadastro. */
export interface RegisterPayload {
  fullName: string;
  displayName: string;
  email: string;
  emailConfirm: string;
  password: string;
  passwordConfirm: string;
  lgpdAccepted: boolean;
  plan: PlanId;
}

/** Resultado de uma tentativa de registro/login — em vez de lançar exceções, devolvemos isso pra UI decidir o que mostrar. */
export interface AuthResult {
  success: boolean;
  error?: string;
}

const USERS_KEY = 'users';       // guarda a lista inteira de UserRecord (nosso "banco de usuários")
const SESSION_KEY = 'session';   // guarda só o id do usuário logado no momento

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Usuário autenticado no momento (sem a senha) — `null` se ninguém estiver logado. */
  currentUser = signal<PublicUser | null>(null);
  /** Facilita o uso em *ngIf / guard sem precisar checar `currentUser() !== null` toda vez. */
  isAuthenticated = signal<boolean>(false);

  constructor(private storage: StorageService, private router: Router) {
    this.restoreSession();
  }

  // ---------------------------------------------------------------------
  // Sessão
  // ---------------------------------------------------------------------

  /** Ao iniciar o app, tenta recuperar quem estava logado antes de recarregar a página. */
  private restoreSession() {
    const sessionUserId = this.storage.get<string | null>(SESSION_KEY, null);
    if (!sessionUserId) return;

    const user = this.findUserById(sessionUserId);
    if (user) {
      this.currentUser.set(toPublicUser(user));
      this.isAuthenticated.set(true);
    } else {
      // Sessão apontava pra um usuário que não existe mais (conta excluída, storage editado à mão etc).
      this.storage.remove(SESSION_KEY);
    }
  }

  private getUsers(): UserRecord[] {
    return this.storage.get<UserRecord[]>(USERS_KEY, []);
  }

  private saveUsers(users: UserRecord[]) {
    this.storage.set(USERS_KEY, users);
  }

  private findUserById(id: string): UserRecord | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  private findUserByEmail(email: string): UserRecord | undefined {
    const normalized = email.trim().toLowerCase();
    return this.getUsers().find(u => u.email.toLowerCase() === normalized);
  }

  // ---------------------------------------------------------------------
  // Registro
  // ---------------------------------------------------------------------

  register(payload: RegisterPayload): AuthResult {
    const validation = this.validateRegister(payload);
    if (!validation.success) return validation;

    const now = new Date().toISOString();
    const user: UserRecord = {
      id: crypto.randomUUID(),
      fullName: payload.fullName.trim(),
      displayName: payload.displayName.trim(),
      email: payload.email.trim().toLowerCase(),
      passwordHash: hashPassword(payload.password),
      plan: payload.plan,
      lgpdAcceptedAt: now,
      createdAt: now,
      settings: { ...DEFAULT_SETTINGS },
    };

    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);

    this.startSession(user);
    return { success: true };
  }

  /** Todas as validações do formulário de cadastro, centralizadas aqui (não na UI) pra poderem ser reaproveitadas/testadas. */
  private validateRegister(payload: RegisterPayload): AuthResult {
    if (!payload.fullName.trim() || !payload.displayName.trim()) {
      return { success: false, error: 'Preencha seu nome completo e como quer ser chamado(a).' };
    }
    if (!payload.email.trim() || !payload.email.includes('@')) {
      return { success: false, error: 'Informe um e-mail válido.' };
    }
    if (payload.email.trim().toLowerCase() !== payload.emailConfirm.trim().toLowerCase()) {
      return { success: false, error: 'Os e-mails informados não coincidem.' };
    }
    if (payload.password.length < 8) {
      return { success: false, error: 'A senha precisa ter pelo menos 8 caracteres.' };
    }
    if (payload.password !== payload.passwordConfirm) {
      return { success: false, error: 'As senhas informadas não coincidem.' };
    }
    if (!payload.lgpdAccepted) {
      return { success: false, error: 'É necessário aceitar os termos da LGPD para continuar.' };
    }
    if (this.findUserByEmail(payload.email)) {
      return { success: false, error: 'Já existe uma conta cadastrada com este e-mail.' };
    }
    return { success: true };
  }

  // ---------------------------------------------------------------------
  // Login / logout
  // ---------------------------------------------------------------------

  login(email: string, password: string): AuthResult {
    const user = this.findUserByEmail(email);
    if (!user || user.passwordHash !== hashPassword(password)) {
      return { success: false, error: 'E-mail ou senha incorretos.' };
    }
    this.startSession(user);
    return { success: true };
  }

  private startSession(user: UserRecord) {
    this.storage.set(SESSION_KEY, user.id);
    this.currentUser.set(toPublicUser(user));
    this.isAuthenticated.set(true);
  }

  logout(): void {
    this.storage.remove(SESSION_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/']);
  }

  // ---------------------------------------------------------------------
  // Configurações do usuário (persistidas junto do próprio registro do usuário)
  // ---------------------------------------------------------------------

  /** Aplica um patch parcial nas configurações do usuário logado, salva e já reflete no signal `currentUser`. */
  updateSettings(patch: Partial<UserSettings>): void {
    const current = this.currentUser();
    if (!current) return;

    const users = this.getUsers();
    const index = users.findIndex(u => u.id === current.id);
    if (index === -1) return;

    users[index].settings = { ...users[index].settings, ...patch };
    this.saveUsers(users);
    this.currentUser.set(toPublicUser(users[index]));
  }

  updatePlan(plan: PlanId): void {
    const current = this.currentUser();
    if (!current) return;

    const users = this.getUsers();
    const index = users.findIndex(u => u.id === current.id);
    if (index === -1) return;

    users[index].plan = plan;
    this.saveUsers(users);
    this.currentUser.set(toPublicUser(users[index]));
  }

  // ---------------------------------------------------------------------
  // Zona de perigo (Configurações)
  // ---------------------------------------------------------------------

  /**
   * Apaga permanentemente a conta do usuário logado: remove o registro de
   * `users`, apaga os dados vinculados a ele (flashcards, sessões de estudo,
   * metas) e encerra a sessão. Não há como desfazer isso.
   *
   * Nota de design: em vez de o AuthService injetar FlashcardsService/
   * GoalsService (o que criaria uma dependência circular, já que ambos
   * dependem do AuthService pra saber QUEM está logado), ele só conhece o
   * padrão de nome das chaves (`flashcards:<id>`, etc.) e remove direto pelo
   * StorageService. É um pequeno acoplamento por convenção, documentado aqui.
   */
  deleteAccount(): void {
    const current = this.currentUser();
    if (!current) return;

    const users = this.getUsers().filter(u => u.id !== current.id);
    this.saveUsers(users);

    this.storage.remove(`flashcards:${current.id}`);
    this.storage.remove(`study-sessions:${current.id}`);
    this.storage.remove(`goals:${current.id}`);

    this.logout();
  }
}
