import { ProjectStatus, ThresholdConfig } from './models';

/** Cálculo canônico — replica exatamente a fórmula do BFF em C#. */
export function calcStatus(p: {
  soldHours: number; plannedHours: number; workedHours: number;
  physicalProgressPercentage: number; expectedEndDate: string;
}, t: ThresholdConfig): { status: ProjectStatus; consumption: number; gap: number; invalid: boolean } {
  if (p.soldHours <= 0) return { status: 'Critical', consumption: 0, gap: 0, invalid: true };
  const consumption = round2((p.workedHours / p.soldHours) * 100);
  const gap = round2(consumption - p.physicalProgressPercentage);
  const remaining = p.soldHours - p.workedHours;
  const overdue = new Date(p.expectedEndDate) < new Date() && p.physicalProgressPercentage < 100;
  const daysUntil = Math.ceil((new Date(p.expectedEndDate).getTime() - Date.now()) / 86400000);

  let status: ProjectStatus = 'Healthy';
  if (remaining < 0 || gap >= t.gapCriticalMin || overdue) status = 'Critical';
  else if (consumption >= t.consumptionAttention || (gap >= t.gapAttentionMin && gap < t.gapCriticalMin) || daysUntil <= t.daysUntilAttention) status = 'Attention';
  return { status, consumption, gap, invalid: false };
}

const round2 = (n: number) => Math.round(n * 100) / 100;
