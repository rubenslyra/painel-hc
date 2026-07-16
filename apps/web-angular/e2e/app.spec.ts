import { test, expect, Page } from '@playwright/test';

const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
const authTokens = { accessToken: 'e2e-access-token', refreshToken: 'e2e-refresh-token', expiresAt };

const project = {
  id: 'p1',
  externalId: 'PRJ-DEMO-0001',
  name: 'Implantacao RM',
  clientName: 'Cliente Demo',
  soldHours: 500,
  plannedHours: 450,
  workedHours: 210,
  physicalProgressPercentage: 55,
  expectedEndDate: '2026-08-30',
  lastSynchronizedAt: '2026-07-13T14:30:00Z',
  indicators: {
    workedHours: 210,
    remainingHours: 290,
    plannedBalance: 240,
    consumptionPercentage: 42,
    progressGap: -13,
    status: 'Healthy',
    invalid: false
  }
};

async function mockApi(page: Page): Promise<void> {
  await page.route('**/api/v1/auth/login', route => route.fulfill({ json: authTokens }));
  await page.route('**/api/v1/auth/refresh', route => route.fulfill({ json: authTokens }));
  await page.route('**/api/v1/auth/logout', route => route.fulfill({ status: 204 }));
  await page.route('**/api/v1/projects/p1', route => route.fulfill({
    json: {
      summary: project,
      analysts: [{ id: 'a1', name: 'Ana Demo', email: 'ana@example.com', role: 'Analista Sr.', allocationPercentage: 80 }],
      recentEntries: [{ id: 't1', analystName: 'Ana Demo', workDate: '2026-07-13', hours: 6, description: 'Configuracao inicial', source: 'Erp' }]
    }
  }));
  await page.route('**/api/v1/projects', route => route.fulfill({ json: [project] }));
  await page.route('**/api/v1/thresholds', route => route.fulfill({
    json: { consumptionAttention: 80, gapAttentionMin: 10, gapCriticalMin: 25, daysUntilAttention: 15 }
  }));
}

async function authenticate(page: Page): Promise<void> {
  await page.addInitScript(tokens => localStorage.setItem('painel.auth.v1', JSON.stringify(tokens)), authTokens);
}

test('login, dashboard e detalhe do projeto', async ({ page }) => {
  await mockApi(page);

  await page.goto('/login');
  await page.getByLabel('Usuário').fill('demo');
  await page.getByLabel('Senha').fill('demo123');
  await page.getByRole('button', { name: /entrar/i }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: /portfólio/i })).toBeVisible();
  const projectLink = page.getByRole('link', { name: /Implantacao RM/i }).first();
  await expect(projectLink).toBeVisible();

  await projectLink.click();
  await expect(page.getByRole('heading', { name: /Implantacao RM/i })).toBeVisible();
  await expect(page.getByText('Ana Demo · Analista Sr.')).toBeVisible();
});

test('navegacao autenticada entre paginas principais', async ({ page }) => {
  await authenticate(page);
  await mockApi(page);

  await page.goto('/');
  await page.getByRole('link', { name: /integra/i }).first().click();
  await expect(page).toHaveURL(/integrations/);
  await page.getByRole('link', { name: /configura/i }).first().click();
  await expect(page).toHaveURL(/settings/);
});
