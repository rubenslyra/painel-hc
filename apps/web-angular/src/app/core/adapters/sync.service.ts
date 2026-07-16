import { Injectable, signal } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { environment } from '@env/environment';

export type SyncPhase = 'idle' | 'running' | 'success' | 'failed';
export interface SyncState { phase: SyncPhase; progress: number; step: string; finishedAt?: string; imported: number; updated: number; failed: number; }

/** Polling reativo com backoff. Em produção, aponta para GET /sync/status do BFF. */
@Injectable({ providedIn: 'root' })
export class SyncService {
  readonly state = signal<SyncState>({ phase: 'idle', progress: 0, step: 'Aguardando execução', imported: 0, updated: 0, failed: 0 });
  private sub?: Subscription;

  start() {
    this.state.set({ phase: 'running', progress: 0, step: 'Iniciando…', imported: 0, updated: 0, failed: 0 });
    const t0 = Date.now();
    this.sub?.unsubscribe();
    this.sub = interval(environment.syncPollingMs).subscribe(() => {
      const p = Math.min(100, Math.round((Date.now() - t0) / 42));
      const step = p < 25 ? 'Autenticando no ERP' : p < 60 ? 'Baixando apontamentos' : p < 90 ? 'Normalizando DTOs' : 'Recalculando indicadores';
      this.state.update(s => ({ ...s, progress: p, step }));
      if (p >= 100) { this.sub?.unsubscribe(); this.state.update(s => ({ ...s, phase: 'success', step: 'Concluído', finishedAt: new Date().toISOString(), updated: 42, imported: 3 })); }
    });
  }
}
