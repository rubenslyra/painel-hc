# Arquitetura de Referência

## Camadas

- **API Externa (Spring Boot)** — Simula o TOTVS RM/ERP externo. Expõe `/rm/projects`, `/rm/projects/{id}`, `/rm/projects/{id}/time-entries` e `/rm/analysts` com dados gerados via **DataFaker** (`net.datafaker`) em memória. Sem persistência. Na execução local, sobe em `http://localhost:18082`.
- **BFF (.NET 10)** — Consome a API externa via **Refit** (cliente HTTP tipado). O alvo arquitetural é persistir snapshot no PostgreSQL via **EF Core 10**; para execução local do case, se `ConnectionStrings: Painel` estiver vazia, usa **EF InMemory** para evitar dependência de banco externo. Expõe API REST versionada `/api/v1/*` documentada com **Swashbuckle/Swagger**. Autenticação **JWT** com access (15 min) e refresh (7 dias) rotativo; há um segredo local de teste versionado apenas para bootstrap, sobrescritível por `Jwt__Secret` em ambientes reais.
- **Front (Angular 20)** — SPA standalone com Signals, Angular Material v20, Tailwind 3 e mixins SCSS. Consome exclusivamente o BFF (`http://localhost:5080/api/v1` em dev). Persiste os tokens em `localStorage` para o ambiente de teste técnico; em produção, a recomendação é migrar refresh token para cookie httpOnly/secure.


## Execução local validada

A stack local usa portas fixas para reduzir ambiguidade durante avaliação:

| Componente | Porta | URL |
| --- | --- | --- |
| ERP Mock Spring Boot | `18082` | `http://localhost:18082/swagger` |
| BFF .NET | `5080` | `http://localhost:5080/swagger` |
| Angular | `4200` | `http://localhost:4200` |

O ERP Mock deve ser iniciado antes do BFF. O BFF aponta para `Erp:BaseUrl=http://localhost:18082`. Para o teste local simples, o BFF não exige PostgreSQL nem secret externo: usa EF InMemory quando a connection string está vazia e um `Jwt:Secret` local de teste, que deve ser substituído por variável de ambiente em qualquer ambiente real.

## Hexagonal (BFF)

```
Painel.Domain          # Entities, Value Objects, regras de negócio (puro C#, sem dependências)
Painel.Application     # Use cases, ports (interfaces), DTOs
Painel.Infrastructure  # Adapters: EF Core, Refit (ERP), JWT, Auditoria
Painel.Bff             # Web API, DI, middlewares (correlação, exceções, auditoria)
Painel.Tests           # xUnit + WebApplicationFactory
```

## Contratos tipados

- Os DTOs canônicos vivem em `Painel.Application/Contracts/*`.
- O Swagger é publicado em `/swagger` — o front usa `openapi-generator` (opcional) para
  regenerar `libs/api-client` a cada release.
- Enquanto isso, os tipos TypeScript em `apps/web-angular/src/app/core/domain/*` são a
  fonte tipada para desenvolvimento manual.

## Autenticação

- `POST /auth/login` → `{ accessToken, refreshToken, expiresAt }`
- `POST /auth/refresh` → rotaciona ambos os tokens (revoga o refresh anterior).
- `POST /auth/logout` → revoga refresh.
- Interceptor Angular anexa `Authorization: Bearer` e, em 401, tenta refresh **uma vez**;
  se falhar redireciona para `/login`.

## Observabilidade

- **Serilog** (BFF) com sinks Console (JSON) + arquivo rotativo.
- **Logback** (Spring) com `logstash-logback-encoder` para JSON.
- Header `X-Correlation-Id` propagado ponta a ponta; se ausente o BFF gera.
- Tabela `audit_events` (userId, action, entity, entityId, payload, at).
