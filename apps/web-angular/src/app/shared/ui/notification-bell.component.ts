import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SyncService } from '@app/core/adapters/sync.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterLink],
  template: `
    <a mat-icon-button routerLink="/integrations" class="notification-bell" aria-label="Dados novos para sincronizar">
      <mat-icon>{{ sync.pendingCount() > 0 ? 'notifications_active' : 'notifications' }}</mat-icon>
      @if (sync.pendingCount() > 0) {
        <span class="badge">{{ sync.pendingCount() > 99 ? '99+' : sync.pendingCount() }}</span>
      }
    </a>
  `,
  styles: [`
    .notification-bell {
      position: relative;
    }

    .badge {
      align-items: center;
      background: hsl(var(--critical));
      border: 2px solid hsl(var(--surface));
      border-radius: 999px;
      color: white;
      display: inline-flex;
      font-size: 0.6875rem;
      font-weight: 760;
      justify-content: center;
      min-height: 1.125rem;
      min-width: 1.125rem;
      padding: 0 0.25rem;
      position: absolute;
      right: 0.125rem;
      top: 0.125rem;
    }
  `]
})
export class NotificationBellComponent {
  sync = inject(SyncService);
}
