import { Injectable, inject, signal } from '@angular/core';
import { interval, Subscription, firstValueFrom } from 'rxjs';
import { runtimeConfig } from '@app/core/config/runtime-config';
import { WebhookInboxApi } from '@app/core/adapters/api';

export type SyncPhase = 'idle' | 'running' | 'success' | 'failed';
export interface SyncState { phase: SyncPhase; progress: number; step: string; finishedAt?: string; imported: number; updated: number; failed: number; }

@Injectable({ providedIn: 'root' })
export class SyncService {
  private inbox = inject(WebhookInboxApi);
  readonly state = signal<SyncState>({ phase: 'idle', progress: 0, step: 'Aguardando execução', imported: 0, updated: 0, failed: 0 });
  readonly pendingCount = signal(0);
  readonly lastPendingAt = signal<string | null>(null);
  private sub?: Subscription;
  private pendingSub?: Subscription;

  constructor() {
    this.refreshPending();
    this.pendingSub = interval(Math.max(runtimeConfig.syncPollingMs, 2000)).subscribe(() => this.refreshPending());
  }

  async refreshPending(): Promise<void> {
    try {
      const result = await firstValueFrom(this.inbox.pendingCount());
      this.pendingCount.set(result.count);
      this.lastPendingAt.set(result.lastReceivedAt ?? null);
    } catch {
      this.pendingCount.set(0);
      this.lastPendingAt.set(null);
    }
  }

  start() {
    const pendingAtStart = this.pendingCount();
    this.state.set({ phase: 'running', progress: 0, step: 'Iniciando sincronização', imported: 0, updated: 0, failed: 0 });
    const t0 = Date.now();
    this.sub?.unsubscribe();
    this.sub = interval(runtimeConfig.syncPollingMs).subscribe(async () => {
      const p = Math.min(100, Math.round((Date.now() - t0) / 42));
      const step = p < 25 ? 'Conectando ao ERP' : p < 60 ? 'Baixando apontamentos pendentes' : p < 90 ? 'Atualizando fila local' : 'Recalculando indicadores';
      this.state.update(s => ({ ...s, progress: p, step }));
      if (p >= 100) {
        this.sub?.unsubscribe();
        try {
          await firstValueFrom(this.inbox.acknowledge());
          this.pendingCount.set(0);
          this.lastPendingAt.set(null);
          this.state.update(s => ({ ...s, phase: 'success', step: 'Concluído', finishedAt: new Date().toISOString(), updated: pendingAtStart, imported: pendingAtStart }));
        } catch {
          this.state.update(s => ({ ...s, phase: 'failed', step: 'Falha ao baixar pendências', failed: pendingAtStart }));
        }
      }
    });
  }
}
