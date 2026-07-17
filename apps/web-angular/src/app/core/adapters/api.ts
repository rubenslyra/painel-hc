import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { runtimeConfig } from '@app/core/config/runtime-config';
import { ProjectDetail, ProjectSummary, ThresholdConfig, WebhookPendingCount } from '@app/core/domain/models';

@Injectable({ providedIn: 'root' })
export class ProjectsApi {
  private http = inject(HttpClient);
  list() { return this.http.get<ProjectSummary[]>(`${runtimeConfig.apiBaseUrl}/projects`); }
  detail(id: string) { return this.http.get<ProjectDetail>(`${runtimeConfig.apiBaseUrl}/projects/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class ThresholdsApi {
  private http = inject(HttpClient);
  get() { return this.http.get<ThresholdConfig>(`${runtimeConfig.apiBaseUrl}/thresholds`); }
  save(c: ThresholdConfig) { return this.http.put<void>(`${runtimeConfig.apiBaseUrl}/thresholds`, c); }
}


@Injectable({ providedIn: 'root' })
export class WebhookInboxApi {
  private http = inject(HttpClient);
  pendingCount() { return this.http.get<WebhookPendingCount>(`${runtimeConfig.apiBaseUrl}/erp-webhooks/pending-count`); }
  acknowledge() { return this.http.post<WebhookPendingCount>(`${runtimeConfig.apiBaseUrl}/erp-webhooks/acknowledge`, {}); }
}
