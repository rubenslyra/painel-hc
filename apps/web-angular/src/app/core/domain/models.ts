/** Contratos TypeScript espelhando os DTOs do BFF (.NET). Fonte única de verdade tipada.
 *  Em produção, regenerar via `openapi-generator` a partir do Swagger do BFF. */

export type ProjectStatus = 'Healthy' | 'Attention' | 'Critical' | 'Inconsistent';

export interface ProjectIndicators {
  workedHours: number;
  remainingHours: number;
  plannedBalance: number;
  consumptionPercentage: number;
  progressGap: number;
  status: ProjectStatus;
  invalid: boolean;
}

export interface ProjectSummary {
  id: string;
  externalId: string;
  name: string;
  clientName: string;
  soldHours: number;
  plannedHours: number;
  workedHours: number;
  physicalProgressPercentage: number;
  expectedEndDate: string; // ISO date
  lastSynchronizedAt: string; // ISO datetime
  indicators: ProjectIndicators;
}

export interface Analyst { id: string; name: string; email: string; role: string; allocationPercentage: number; }
export interface TimeEntry { id: string; analystName: string; workDate: string; hours: number; description: string; source: string; }
export interface ProjectDetail { summary: ProjectSummary; analysts: Analyst[]; recentEntries: TimeEntry[]; }

export interface ThresholdConfig {
  consumptionAttention: number;
  gapAttentionMin: number;
  gapCriticalMin: number;
  daysUntilAttention: number;
}

export interface AuthTokens { accessToken: string; refreshToken: string; expiresAt: string; }
export interface LoginRequest { username: string; password: string; }

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  Healthy: 'Saudável',
  Attention: 'Atenção',
  Critical: 'Crítico',
  Inconsistent: 'Inconsistente'
};

export interface WebhookPendingCount { count: number; lastReceivedAt?: string | null; }

