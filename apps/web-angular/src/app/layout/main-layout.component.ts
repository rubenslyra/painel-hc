import { Component, inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@app/core/auth/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [MatSidenavModule, MatToolbarModule, MatIconModule, MatButtonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen flex flex-col">
      <mat-toolbar class="!bg-white border-b border-border">
        <span class="font-semibold text-base">HC</span>
        <span class="flex-1"></span>
        <nav class="hidden md:flex gap-1">
          <a mat-button routerLink="/" routerLinkActive="!bg-muted" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
          <a mat-button routerLink="/integrations" routerLinkActive="!bg-muted">Integrações</a>
          <a mat-button routerLink="/settings" routerLinkActive="!bg-muted">Configurações</a>
        </nav>
        <button mat-icon-button (click)="logout()" aria-label="Sair"><mat-icon>logout</mat-icon></button>
      </mat-toolbar>

      <main class="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto pb-24 md:pb-6"><router-outlet /></main>

      <nav class="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-border grid grid-cols-3 z-10">
        <a routerLink="/" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="text-primary" class="flex flex-col items-center py-2 text-xs"><mat-icon>dashboard</mat-icon>Dashboard</a>
        <a routerLink="/integrations" routerLinkActive="text-primary" class="flex flex-col items-center py-2 text-xs"><mat-icon>sync</mat-icon>Integrações</a>
        <a routerLink="/settings" routerLinkActive="text-primary" class="flex flex-col items-center py-2 text-xs"><mat-icon>tune</mat-icon>Configurações</a>
      </nav>
    </div>
  `
})
export class MainLayoutComponent {
  private auth = inject(AuthService);
  logout() { this.auth.logout(); location.href = '/login'; }
}
