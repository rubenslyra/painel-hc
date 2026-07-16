import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SyncService } from '@app/core/adapters/sync.service';

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule],
  template: `
    <h1 class="text-xl md:text-2xl font-semibold mb-4">Integrações · TOTVS RM</h1>
    <div class="panel">
      <div class="flex items-center gap-3">
        <button mat-flat-button color="primary" (click)="sync.start()" [disabled]="sync.state().phase === 'running'"><mat-icon>sync</mat-icon>Sincronizar agora</button>
        <span class="text-sm">{{ sync.state().step }}</span>
      </div>
      @if (sync.state().phase === 'running') { <mat-progress-bar mode="determinate" [value]="sync.state().progress" class="mt-3"></mat-progress-bar> }
      @if (sync.state().finishedAt) { <p class="text-xs text-muted-foreground mt-3">Última execução: {{ sync.state().finishedAt }} · {{ sync.state().updated }} atualizados, {{ sync.state().imported }} importados</p> }
    </div>
  `
})
export class IntegrationsPage { sync = inject(SyncService); }
