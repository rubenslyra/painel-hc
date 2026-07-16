import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProjectsApi } from '@app/core/adapters/api';
import { downloadCsv, toCsv } from '@app/core/utils/csv';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, RouterLink],
  template: `
  <header class="flex items-center gap-3 mb-4">
    <h1 class="text-xl md:text-2xl font-semibold flex-1">Portfólio de Projetos</h1>
    <button mat-stroked-button (click)="export()"><mat-icon>download</mat-icon>Exportar CSV</button>
  </header>

  @if (projects()) {
    <div class="hidden md:block panel overflow-x-auto">
      <table mat-table [dataSource]="projects()!" class="w-full">
        <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Projeto</th><td mat-cell *matCellDef="let p"><a [routerLink]="['/projects', p.id]" class="text-primary">{{ p.name }}</a><div class="text-xs text-muted-foreground">{{ p.clientName }}</div></td></ng-container>
        <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let p"><span [class]="'status-' + p.indicators.status.toLowerCase()">{{ p.indicators.status }}</span></td></ng-container>
        <ng-container matColumnDef="cons"><th mat-header-cell *matHeaderCellDef class="text-right">Consumo</th><td mat-cell *matCellDef="let p" class="text-right num">{{ p.indicators.consumptionPercentage }}%</td></ng-container>
        <ng-container matColumnDef="prog"><th mat-header-cell *matHeaderCellDef class="text-right">Avanço</th><td mat-cell *matCellDef="let p" class="text-right num">{{ p.physicalProgressPercentage }}%</td></ng-container>
        <ng-container matColumnDef="rem"><th mat-header-cell *matHeaderCellDef class="text-right">Restam</th><td mat-cell *matCellDef="let p" class="text-right num">{{ p.indicators.remainingHours }} h</td></ng-container>
        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row; columns: cols;"></tr>
      </table>
    </div>

    <div class="md:hidden grid gap-3">
      @for (p of projects()!; track p.id) {
        <a [routerLink]="['/projects', p.id]" class="panel block">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0"><h2 class="font-medium truncate">{{ p.name }}</h2><p class="text-xs text-muted-foreground truncate">{{ p.clientName }}</p></div>
            <span [class]="'status-' + p.indicators.status.toLowerCase()">{{ p.indicators.status }}</span>
          </div>
          <div class="mt-3 grid grid-cols-3 gap-2 text-xs num">
            <div><div class="text-muted-foreground">Consumo</div><div class="font-medium">{{ p.indicators.consumptionPercentage }}%</div></div>
            <div><div class="text-muted-foreground">Avanço</div><div class="font-medium">{{ p.physicalProgressPercentage }}%</div></div>
            <div><div class="text-muted-foreground">Restam</div><div class="font-medium">{{ p.indicators.remainingHours }} h</div></div>
          </div>
        </a>
      }
    </div>
  } @else { <p class="text-sm text-muted-foreground">Carregando…</p> }
  `
})
export class DashboardPage {
  private api = inject(ProjectsApi);
  projects = toSignal(this.api.list());
  cols = ['name', 'status', 'cons', 'prog', 'rem'];

  export() {
    const rows = (this.projects() ?? []).map(p => ({
      projeto: p.name, cliente: p.clientName, status: p.indicators.status,
      consumo_pct: p.indicators.consumptionPercentage, avanco_pct: p.physicalProgressPercentage,
      restam_h: p.indicators.remainingHours, prazo: p.expectedEndDate
    }));
    downloadCsv('portfolio.csv', toCsv(rows));
  }
}
