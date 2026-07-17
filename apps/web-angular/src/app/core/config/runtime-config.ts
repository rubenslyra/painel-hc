import { environment } from '@env/environment';

export interface RuntimeConfig {
  apiBaseUrl: string;
  erpBaseUrl: string;
  syncPollingMs: number;
}

const STORAGE_KEY = 'painel.runtime-config.v1';

export const runtimeConfig: RuntimeConfig = {
  apiBaseUrl: environment.apiBaseUrl,
  erpBaseUrl: 'http://localhost:18082',
  syncPollingMs: environment.syncPollingMs
};

export async function loadRuntimeConfig(): Promise<void> {
  try {
    const response = await fetch('/assets/app-config.json', { cache: 'no-store' });
    if (response.ok) {
      Object.assign(runtimeConfig, await response.json());
    }
  } catch {
    // Mantém fallback compilado quando o arquivo não existir ou estiver indisponível.
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    Object.assign(runtimeConfig, JSON.parse(saved));
  }
}

export function saveRuntimeConfig(next: Partial<RuntimeConfig>): void {
  Object.assign(runtimeConfig, next);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runtimeConfig));
}
