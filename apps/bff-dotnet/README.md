# BFF .NET 10 — HC

Arquitetura hexagonal (Ports & Adapters) sobre .NET 10.

```
src/
├── Painel.Domain           # Entidades, VOs, regras (Indicators)
├── Painel.Application      # Use cases + ports + DTOs
├── Painel.Infrastructure   # Refit (ERP), EF Core, JWT, Auditoria
└── Painel.Bff              # Web API, middlewares, Swagger
tests/Painel.Tests          # xUnit + WebApplicationFactory
```

## Rodar

Suba primeiro o ERP Mock em `http://localhost:18082`.

```powershell
dotnet restore Painel.sln
dotnet run --project src/Painel.Bff
```

URLs úteis:

- Swagger: `http://localhost:5080/swagger`
- API base: `http://localhost:5080/api/v1`

Em `Development`, se `ConnectionStrings__Painel` não estiver configurada, o BFF usa banco em memória. Para o teste local simples, não precisa subir PostgreSQL.

Para validar build e testes:

```powershell
dotnet build Painel.sln -c Release
dotnet test Painel.sln -c Release
```


## Webhook do ERP Mock

O Spring Boot publica eventos em:

```text
POST http://localhost:5080/api/v1/erp-webhooks/rm-events
```

O BFF salva cada evento em `WebhookInbox` com status `Pending`, formando uma fila local persistida. Eventos duplicados pelo mesmo `eventId` não são inseridos novamente. Para consultar os últimos eventos recebidos, use o endpoint autenticado:

```text
GET /api/v1/erp-webhooks/inbox
```

Para usar PostgreSQL no BFF local:

```powershell
$env:ConnectionStrings__Painel="Host=localhost;Port=5432;Database=painel_hc_bff;Username=painel;Password=painel"
```
## Segurança
- JWT (HS256) via `Microsoft.AspNetCore.Authentication.JwtBearer`.
- O `appsettings.json` traz um `Jwt:Secret` local apenas para teste técnico, evitando falha de bootstrap em `dotnet run`. Em ambiente real, sobrescreva com `Jwt__Secret` por variável de ambiente ou secret manager.
- Refresh rotativo (memória — trocar por store persistido em produção).
- CORS restrito por ambiente (`appsettings.*`).
- FluentValidation nos DTOs de entrada.
- Auditoria em `audit_events` (EF Core).

## Contratos
- Swagger em `/swagger` — gere o client TypeScript com `openapi-generator` no
  pipeline de release (`libs/api-client`).

