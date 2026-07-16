import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { firstValueFrom, tap } from 'rxjs';
import { AuthTokens, LoginRequest } from '@app/core/domain/models';

const STORAGE = 'painel.auth.v1';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = new HttpClient(inject_HttpHandler());
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
    const t = await firstValueFrom(this.http.post<AuthTokens>(`${environment.apiBaseUrl}/auth/login`, req));
    this.persist(t);
  }

  async refresh(): Promise<AuthTokens | null> {
    const cur = this._tokens();
    if (!cur) return null;
    try {
      const t = await firstValueFrom(this.http.post<AuthTokens>(`${environment.apiBaseUrl}/auth/refresh`, { refreshToken: cur.refreshToken })
        .pipe(tap(t => this.persist(t))));
      return t;
    } catch { this.persist(null); return null; }
  }

  logout() {
    const cur = this._tokens();
    if (cur) firstValueFrom(this.http.post(`${environment.apiBaseUrl}/auth/logout`, { refreshToken: cur.refreshToken })).catch(() => void 0);
    this.persist(null);
  }
}

// Ergonomic helper to avoid circular DI when the service instantiates its own HttpClient (used only for auth endpoints, bypassing the interceptors).
import { HttpBackend, HttpHandler } from '@angular/common/http';
import { inject } from '@angular/core';
function inject_HttpHandler(): HttpHandler { return inject(HttpBackend) as unknown as HttpHandler; }
