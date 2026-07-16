# HC Web — Angular 20 + Material v20 + Tailwind

Standalone components, Signals, `OnPush` implícito, rotas lazy e arquitetura
hexagonal alinhada ao BFF .NET 10.

## Rodar

```bash
npm install
npm start          # http://localhost:4200
npm test           # unit (Karma/Jasmine)
npm run e2e        # e2e (Playwright — desktop + mobile)
```

## Estrutura

```
src/app/
├── core/            # domain, ports, adapters (api, sync), auth, http (interceptors), utils
├── shared/          # componentes/pipes reutilizáveis
├── features/        # login, dashboard, project-detail, integrations, settings
└── layout/          # main-layout (header desktop + bottom-nav mobile)
```

## Design system
- Tokens CSS em `styles.scss` — sem cores hardcoded.
- Mixins SCSS: `panel`, `status-pill($h)`, `touch-target`.
- Material M3 usando `mat.theme` sobre a mesma paleta.

## JWT
- `AuthService` guarda tokens em `localStorage` (dev). Interceptor anexa Bearer
  e faz refresh **uma vez** em 401 antes de redirecionar para `/login`.
