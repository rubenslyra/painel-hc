import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { runtimeConfig } from '@app/core/config/runtime-config';
import { firstValueFrom, tap } from 'rxjs';
import { AuthTokens, LoginRequest } from '@app/core/domain/models';

const STORAGE = 'painel.auth.v1';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = new HttpClient(inject(HttpBackend));
  private _tokens = signal<AuthTokens | null>(this.load());
  readonly tokens = this._tokens.asReadonly();
  readonly isAuthenticated = computed(() => !!this._tokens() && new Date(this._tokens()!.expiresAt) > new Date());

  private load(): AuthTokens | null {
    try { const raw = localStorage.getItem(STORAGE); return raw ? JSON.parse(raw) : null; } catch { return null; }
  }

  private persist(t: AuthTokens | null) {
    if (t) localStorage.setItem(STORAGE, JSON.stringify(t));
    else localStorage.removeItem(STORAGE);
    this._tokens.set(t);
  }

  async login(req: LoginRequest): Promise<void> {
    const t = await firstValueFrom(this.http.post<AuthTokens>(`${runtimeConfig.apiBaseUrl}/auth/login`, req));
    this.persist(t);
  }

  async refresh(): Promise<AuthTokens | null> {
    const cur = this._tokens();
    if (!cur) return null;
    try {
      const t = await firstValueFrom(this.http.post<AuthTokens>(`${runtimeConfig.apiBaseUrl}/auth/refresh`, { refreshToken: cur.refreshToken })
        .pipe(tap(t => this.persist(t))));
      return t;
    } catch { this.persist(null); return null; }
  }

  logout() {
    const cur = this._tokens();
    if (cur) firstValueFrom(this.http.post(`${runtimeConfig.apiBaseUrl}/auth/logout`, { refreshToken: cur.refreshToken })).catch(() => void 0);
    this.persist(null);
  }
}
