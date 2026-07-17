import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ProjectsApi } from '@app/core/adapters/api';
import { ProjectSummary, ProjectStatus } from '@app/core/domain/models';
import { downloadCsv, toCsv } from '@app/core/utils/csv';
import { LoadingSplashComponent } from '@app/shared/ui/loading-splash.component';
import { PageHeaderComponent } from '@app/shared/ui/page-header.component';
import { StatusChipComponent } from '@app/shared/ui/status-chip.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, RouterLink, PageHeaderComponent, StatusChipComponent, LoadingSplashComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss'
})
export class DashboardPage {
  private api = inject(ProjectsApi);

  projects = toSignal(this.api.list());
  projectList = computed(() => this.projects() ?? []);
  loading = computed(() => this.projects() === undefined);
  cols = ['name', 'status', 'consumption', 'progress', 'remaining', 'deadline'];

  total = computed(() => this.projectList().length);
  critical = computed(() => this.countByStatus('Critical'));
  attention = computed(() => this.countByStatus('Attention'));
  healthy = computed(() => this.countByStatus('Healthy'));

  export(): void {
    const rows = this.projectList().map(p => ({
      projeto: p.name,
      cliente: p.clientName,
      status: p.indicators.status,
      consumo_pct: p.indicators.consumptionPercentage,
      avanco_pct: p.physicalProgressPercentage,
      saldo_contratual_h: p.indicators.remainingHours,
      prazo: p.expectedEndDate
    }));
    downloadCsv('portfolio-hc.csv', toCsv(rows));
  }

  trackProject(_: number, project: ProjectSummary): string { return project.id; }

  private countByStatus(status: ProjectStatus): number {
    return this.projectList().filter(project => project.indicators.status === status).length;
  }
}
