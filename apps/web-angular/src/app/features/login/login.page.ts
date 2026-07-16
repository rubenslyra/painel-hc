import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '@app/core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
  <div class="min-h-screen grid place-items-center bg-muted p-4">
    <form class="panel w-full max-w-sm flex flex-col gap-4" (submit)="submit($event)">
      <h1 class="text-xl font-semibold">Entrar no HC</h1>
      <mat-form-field appearance="outline"><mat-label>Usuário</mat-label><input matInput name="u" [(ngModel)]="username" required /></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Senha</mat-label><input matInput type="password" name="p" [(ngModel)]="password" required minlength="4" /></mat-form-field>
      @if (error()) { <p class="text-critical text-sm">{{ error() }}</p> }
      <button mat-flat-button color="primary" [disabled]="loading()">{{ loading() ? 'Entrando…' : 'Entrar' }}</button>
    </form>
  </div>`
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  username = 'demo'; password = 'demo';
  loading = signal(false); error = signal<string | null>(null);

  async submit(ev: Event) {
    ev.preventDefault();
    this.loading.set(true); this.error.set(null);
    try { await this.auth.login({ username: this.username, password: this.password }); this.router.navigate(['/']); }
    catch { this.error.set('Credenciais inválidas'); }
    finally { this.loading.set(false); }
  }
}
