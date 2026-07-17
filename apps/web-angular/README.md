# HC Web — Angular 20 + Material v20 + Tailwind

Standalone components, Signals, `OnPush` implícito, rotas lazy e arquitetura
hexagonal alinhada ao BFF .NET 10.

## Rodar

Antes de subir o Angular, deixe rodando:

- ERP Mock: `http://localhost:18082`
- BFF: `http://localhost:5080`

```powershell
npm ci
npm start
```

Acesse `http://localhost:4200`.

Login local:

```text
Usuário: demo
Senha: demo
```

Para validar build e testes:

```powershell
npm run lint
npm test
npm run build
npm run e2e
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
