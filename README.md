# HC - Health Check de Projetos

Monorepo do case tecnico PVT para o modulo Painel de Projetos. O foco da entrega e demonstrar arquitetura, modelagem, regras de negocio e uma fatia executavel do fluxo.

## Aplicacoes

```text
apps/
├── api-springboot/   # ERP Mock externo (Java 21 + Spring Boot)
├── bff-dotnet/       # BFF ASP.NET Core .NET 10
└── web-angular/      # SPA Angular 20 + Material + Tailwind
```

## Arquitetura alvo

```text
Angular 20 -> BFF .NET 10 -> PostgreSQL local do painel
                         -> Refit/HTTP -> Spring Boot ERP Mock -> banco independente do ERP
```

Regras principais:

- Angular chama apenas o BFF.
- O dashboard deve ler o banco local do BFF.
- O ERP Mock e acessado pelo BFF somente por HTTP, em sincronizacoes e health checks.
- A regra oficial de saude de projeto pertence ao BFF.
- Thresholds ficam em configuracao nesta fase; nao ha edicao dinamica como requisito inicial.

## Como validar a fase atual

### Spring Boot

```bash
cd apps/api-springboot
./mvnw test
```

No Windows:

```powershell
cd apps/api-springboot
.\mvnw.cmd test
```

### BFF .NET

```bash
cd apps/bff-dotnet
dotnet restore Painel.sln
dotnet build Painel.sln -c Release --no-restore
dotnet test Painel.sln -c Release --no-build
```

### Angular

```bash
cd apps/web-angular
npm ci
npm run lint
npm test
npm run build
npm run e2e
```

## Estado atual

O projeto ainda esta em refatoracao incremental. A Fase 1 prioriza deixar o monorepo executavel e o CI basico confiavel antes de avancar para dominio, persistencia local, sincronizacao e regra oficial de saude no BFF.


## Parte 2 opcional implementada

A fatia implementada e a calculadora oficial de saude de projetos no BFF .NET, com testes unitarios. Ela demonstra a decisao central do design: a regra de saude fica no backend, usa tipos adequados para horas/percentuais e retorna status e motivos para o Angular apenas apresentar.

Validacao executada em 16/07/2026:

```powershell
cd apps/bff-dotnet
dotnet restore Painel.sln
dotnet build Painel.sln -c Release --no-restore
dotnet test Painel.sln -c Release --no-build
```

Resultado: 10 testes aprovados.

## Fluxo de trabalho

- Issues guiam as tasks por fase.
- Commits seguem Conventional Commits.
- Tags seguem SemVer no formato `vMAJOR.MINOR.PATCH`.
- Nenhum commit, push ou tag deve ser feito sem autorizacao explicita.

## Documentacao

- `docs/architecture/design-and-architecture.md` - documento principal da Parte 1 do case.
- `docs/architecture/angular-architecture.md` - estrategia arquitetural do frontend Angular.
- `docs/operations/release-strategy.md` - estrategia de issues, commits e SemVer.
- `docs/arquitetura.md` - documentacao legada inicial.
- `docs/padroes.md` - padroes legados iniciais.

A estrutura documental completa sera expandida nas proximas fases.

