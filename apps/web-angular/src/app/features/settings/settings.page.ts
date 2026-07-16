import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';
import { ThresholdsApi } from '@app/core/adapters/api';
import { ThresholdConfig } from '@app/core/domain/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h1 class="text-xl md:text-2xl font-semibold mb-4">Configurações de status</h1>
    <form class="panel grid grid-cols-1 md:grid-cols-2 gap-4" (submit)="save($event)">
      <mat-form-field appearance="outline"><mat-label>Consumo p/ atenção (%)</mat-label><input matInput type="number" [(ngModel)]="cfg.consumptionAttention" name="c" /></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Gap min. atenção (pp)</mat-label><input matInput type="number" [(ngModel)]="cfg.gapAttentionMin" name="ga" /></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Gap min. crítico (pp)</mat-label><input matInput type="number" [(ngModel)]="cfg.gapCriticalMin" name="gc" /></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Dias até fim p/ atenção</mat-label><input matInput type="number" [(ngModel)]="cfg.daysUntilAttention" name="d" /></mat-form-field>
      <div class="md:col-span-2 flex justify-end"><button mat-flat-button color="primary" [disabled]="saving()">{{ saving() ? 'Salvando…' : 'Salvar' }}</button></div>
    </form>
  `
})
export class SettingsPage {
  private api = inject(ThresholdsApi);
  cfg: ThresholdConfig = { consumptionAttention: 80, gapAttentionMin: 10, gapCriticalMin: 25, daysUntilAttention: 30 };
  saving = signal(false);

  constructor() { this.api.get().subscribe(c => this.cfg = c); }
  async save(ev: Event) { ev.preventDefault(); this.saving.set(true); try { await firstValueFrom(this.api.save(this.cfg)); } finally { this.saving.set(false); } }
}
