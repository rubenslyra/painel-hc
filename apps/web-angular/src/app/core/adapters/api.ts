import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { ProjectDetail, ProjectSummary, ThresholdConfig } from '@app/core/domain/models';

@Injectable({ providedIn: 'root' })
export class ProjectsApi {
  private http = inject(HttpClient);
  list() { return this.http.get<ProjectSummary[]>(`${environment.apiBaseUrl}/projects`); }
  detail(id: string) { return this.http.get<ProjectDetail>(`${environment.apiBaseUrl}/projects/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class ThresholdsApi {
  private http = inject(HttpClient);
  get() { return this.http.get<ThresholdConfig>(`${environment.apiBaseUrl}/thresholds`); }
  save(c: ThresholdConfig) { return this.http.put<void>(`${environment.apiBaseUrl}/thresholds`, c); }
}
