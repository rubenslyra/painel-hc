import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { of, switchMap } from 'rxjs';
import { ProjectsApi } from '@app/core/adapters/api';
import { LoadingSplashComponent } from '@app/shared/ui/loading-splash.component';
import { PageHeaderComponent } from '@app/shared/ui/page-header.component';
import { StatusChipComponent } from '@app/shared/ui/status-chip.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, PageHeaderComponent, StatusChipComponent, LoadingSplashComponent],
  templateUrl: './project-detail.page.html',
  styleUrl: './project-detail.page.scss'
})
export class ProjectDetailPage {
  private api = inject(ProjectsApi);

  id = input.required<string>();
  data = toSignal(toObservable(this.id).pipe(switchMap(id => id ? this.api.detail(id) : of(null))));
}
