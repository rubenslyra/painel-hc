# task-paralela-1 — Setup dos bancos PostgreSQL para api-springboot e bff-dotnet

**Data:** 16/07/2026
**Status:** Concluído

---

## O que foi feito

### 1. Bancos de dados criados no PostgreSQL (Docker)

| Banco | API | User | Senha |
|---|---|---|---|
| `painel_hc_rm` | api-springboot | painel | painel |
| `painel` | bff-dotnet | postgres | Local@123456789 |

### 2. Permissões concedidas

```sql
-- Para painel_hc_rm
GRANT ALL ON SCHEMA public TO painel;
ALTER DATABASE painel_hc_rm OWNER TO painel;

-- Para painel (default já ok com postgres)
```

### 3. Configurações alteradas

#### `apps/bff-dotnet/src/Painel.Bff/appsettings.json`
- ConnectionString Painel preenchida:
  `Host=localhost;Port=5432;Database=painel;Username=postgres;Password=Local@123456789`

#### `apps/bff-dotnet/src/Painel.Bff/Program.cs`
- Linha 16: `AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true)`
  - Corrige erro `DateTimeOffset with Offset=-03:00:00` ao salvar webhooks no PostgreSQL

### 4. Serviços rodando

| Serviço | Porta | Status |
|---|---|---|
| api-springboot | 18082 | UP — `/actuator/health` → `{"status":"UP"}` |
| bff-dotnet | 5080 | UP — webhooks recebendo (202 Accepted) |

### 5. Tabelas criadas

**painel_hc_rm** (Spring Boot / Hibernate ddl-auto=update):
- `rm_analysts`, `rm_events`, `rm_project_analysts`, `rm_projects`, `rm_time_entries`
- Dados mockados inseridos: 20 projetos, ~48 analistas

**painel** (BFF .NET / EnsureCreated):
- `AuditEvents`, `Thresholds`, `WebhookInbox`
- Webhooks com `time_entry.created` já persistidos

### 6. Como retomar

```powershell
# Spring Boot
cd apps\api-springboot
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/painel_hc_rm"
$env:SPRING_DATASOURCE_USERNAME="painel"
$env:SPRING_DATASOURCE_PASSWORD="painel"
$env:SERVER_PORT="18082"
./mvnw spring-boot:run

# BFF .NET
cd apps\bff-dotnet\src\Painel.Bff
dotnet run --urls "http://localhost:5080"
```
