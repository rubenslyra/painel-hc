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

```bash
dotnet restore
dotnet run --project src/Painel.Bff   # http://localhost:5080/swagger
dotnet test
```

## Segurança
- JWT (HS256) via `Microsoft.AspNetCore.Authentication.JwtBearer`.
- Refresh rotativo (memória — trocar por store persistido em produção).
- CORS restrito por ambiente (`appsettings.*`).
- FluentValidation nos DTOs de entrada.
- Auditoria em `audit_events` (EF Core).

## Contratos
- Swagger em `/swagger` — gere o client TypeScript com `openapi-generator` no
  pipeline de release (`libs/api-client`).
