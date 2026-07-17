# Task Paralela 2 — Deploy, Docker, Screenshots e Branch Strategy

**Data:** 2026-07-16

## Atividades realizadas

### 1. Dockerfiles (3 apps)

| App | Dockerfile | Estratégia |
|---|---|---|
| `api-springboot` | Multi-stage: Maven wrapper → JRE Alpine, porta 18082 | H2 em runtime para Docker (mock, regera dados) |
| `bff-dotnet` | Multi-stage: `dotnet publish` → `aspnet:10.0`, porta 8080 | Entrypoint que converte `DATABASE_URL` (URI) → `ConnectionStrings__Painel` (Npgsql) |
| `web-angular` | Multi-stage: Node 20 build → nginx:alpine, porta 80 | Entrypoint gera `app-config.json` com `API_BASE_URL` de env var |

### 2. Entrypoints

- `bff-dotnet/docker-entrypoint.sh`: Parseia `postgres://user:pass@host:port/db` e exporta `ConnectionStrings__Painel`
- `web-angular/docker-entrypoint.sh`: Gera `app-config.json` via heredoc com `${API_BASE_URL}`, `${ERP_BASE_URL}`, `${SYNC_POLLING_MS}`

### 3. .dockerignore (3 apps)

Cada app com seu `.dockerignore` excluindo `target/`, `bin/`, `obj/`, `node_modules/`, `dist/`, etc.

### 4. render.yaml

- Repo corrigido para `rubenslyra/painel-hc`
- 3 serviços Docker com `branch: main` explícito
- 1 PostgreSQL gratuito (`pvt-db`) para o BFF
- ERP Mock usa H2 em memória
- CORS configurado para `https://pvt-web.onrender.com`

### 5. Branch strategy

| Branch | Padrão | Proteção |
|---|---|---|
| `develop` | ✅ Sim | Status checks obrigatórios, sem PR obrigatório |
| `main` | ❌ Não | Status checks + PR obrigatório + enforce admins |

### 6. Correção Docker build (Render)

- `bff-dotnet/Dockerfile` fazia `dotnet restore Painel.sln` mas `tests/` não estava no contexto
- Corrigido: restore/publish direto pelo `.csproj` do BFF

### 7. Screenshots

4 screenshots capturadas com Playwright (stack local rodando):
- `login.png` (1.1 MB)
- `dashboard.png` (44 KB)
- `project-detail.png` (44 KB)
- `integrations.png` (55 KB)

## Decisões técnicas

- **H2 no ERP Mock**: scope alterado de `test` para `runtime` — mock não precisa de persistência externa
- **app-config.json com heredoc**: em vez de `envsubst`, o entrypoint gera o JSON inteiro, evitando dependência de `gettext` na imagem nginx
- **BFF entrypoint**: parseia `DATABASE_URL` (formato URI) para connection string Npgsql (formato chave-valor), compatível com Render
