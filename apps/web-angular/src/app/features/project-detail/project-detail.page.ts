import { Component, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { of } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { ProjectsApi } from '@app/core/adapters/api';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  template: `
    @if (data(); as d) {
      <a href="/" class="text-sm text-primary">← Voltar</a>
      <h1 class="text-xl md:text-2xl font-semibold mt-2">{{ d.summary.name }}</h1>
      <p class="text-sm text-muted-foreground">{{ d.summary.clientName }} · {{ d.summary.externalId }}</p>

      <section class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="panel"><div class="text-xs text-muted-foreground">Consumo</div><div class="text-lg font-semibold num">{{ d.summary.indicators.consumptionPercentage }}%</div></div>
        <div class="panel"><div class="text-xs text-muted-foreground">Avanço</div><div class="text-lg font-semibold num">{{ d.summary.physicalProgressPercentage }}%</div></div>
        <div class="panel"><div class="text-xs text-muted-foreground">Restam</div><div class="text-lg font-semibold num">{{ d.summary.indicators.remainingHours }} h</div></div>
        <div class="panel"><div class="text-xs text-muted-foreground">Status</div><div class="mt-1"><span [class]="'status-' + d.summary.indicators.status.toLowerCase()">{{ d.summary.indicators.status }}</span></div></div>
      </section>

      <section class="mt-6 panel">
        <h2 class="font-semibold mb-2">Equipe</h2>
        <ul class="text-sm divide-y">
          @for (a of d.analysts; track a.id) { <li class="py-2 flex justify-between"><span>{{ a.name }} · {{ a.role }}</span><span class="num text-muted-foreground">{{ a.allocationPercentage }}%</span></li> }
        </ul>
      </section>

      <section class="mt-6 panel">
        <h2 class="font-semibold mb-2">Apontamentos recentes</h2>
        <ul class="text-sm divide-y">
          @for (e of d.recentEntries; track e.id) { <li class="py-2 flex justify-between gap-3"><span class="min-w-0 truncate">{{ e.workDate }} · {{ e.analystName }} · {{ e.description }}</span><span class="num shrink-0">{{ e.hours }} h</span></li> }
        </ul>
      </section>
    }
  `
})
export class ProjectDetailPage {
  private api = inject(ProjectsApi);
  id = input.required<string>();
  data = toSignal(toObservable(this.id).pipe(switchMap(id => id ? this.api.detail(id) : of(null))));
}
