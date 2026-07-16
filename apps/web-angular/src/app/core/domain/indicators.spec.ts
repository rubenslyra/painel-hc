import { calcStatus } from './indicators';

describe('indicators', () => {
  const t = { consumptionAttention: 80, gapAttentionMin: 10, gapCriticalMin: 25, daysUntilAttention: 30 };

  it('marca crítico quando consumo > vendido', () => {
    const r = calcStatus({ soldHours: 100, plannedHours: 100, workedHours: 120, physicalProgressPercentage: 90, expectedEndDate: '2099-12-31' }, t);
    expect(r.status).toBe('Critical');
  });

  it('marca saudável abaixo dos limites', () => {
    const r = calcStatus({ soldHours: 500, plannedHours: 500, workedHours: 200, physicalProgressPercentage: 45, expectedEndDate: '2099-12-31' }, t);
    expect(r.status).toBe('Healthy');
  });
});
