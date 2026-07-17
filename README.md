# HC - Health Check de Projetos

Monorepo do case técnico PVT para o módulo **Painel de Projetos**. O objetivo da entrega é demonstrar raciocínio de arquitetura, modelagem de domínio, regras de negócio e uma pequena fatia implementada do fluxo.

O nome **HC** significa **Health Check**.

## Visão Geral

O HC é um painel para acompanhamento da saúde de projetos a partir de clientes, horas vendidas, horas planejadas, apontamentos realizados, avanço físico e prazos.

A decisão central da arquitetura é manter o dashboard independente do ERP em tempo real. Para isso, o BFF possui uma base local e consulta o ERP Mock apenas em sincronizações e health checks externos.

```text
Usuário
  |
  v
Angular 20
  |
  | HTTPS / JSON
  v
BFF ASP.NET Core .NET 10
  |
  +--> PostgreSQL local do painel
  |
  +--> HTTP via Refit
          |
          v
      Spring Boot ERP Mock
          |
          v
      Banco independente do ERP Mock
```

## Screenshots

### Login

![Tela de login](.github/screenshots/login.png)

### Dashboard de Projetos

![Dashboard de projetos](.github/screenshots/dashboard.png)

### Detalhe do Projeto

![Detalhe do projeto](.github/screenshots/project-detail.png)

### Integrações

![Tela de integrações](.github/screenshots/integrations.png)

## Aplicações

```text
apps/
├── api-springboot/   # ERP Mock externo: Java 21 + Spring Boot
├── bff-dotnet/       # BFF: ASP.NET Core + .NET 10
└── web-angular/      # SPA: Angular 20 + Angular Material + Tailwind
```

## Como Rodar a Stack Local

Este é o fluxo mais simples para avaliadores rodarem a aplicação inteira em ambiente local.

### Pré-requisitos

- Java 21.
- .NET SDK 10.
- Node.js 20.19.0 ou superior.
- PowerShell, Bash ou terminal equivalente.

Não é obrigatório subir PostgreSQL para teste local. Em `Development`, se a connection string do BFF estiver vazia, o BFF usa banco em memória.

### Portas usadas

| App | Porta | URL |
| --- | --- | --- |
| ERP Mock Spring Boot | `18082` | `http://localhost:18082/swagger` |
| BFF .NET | `5080` | `http://localhost:5080/swagger` |
| Angular | `4200` | `http://localhost:4200` |

### 1. Subir e manter rodando a API externa Spring Boot

Esta aplicação é o **ERP Mock**, ou seja, a API externa simulada que o BFF consulta via HTTP. Ela precisa ficar rodando durante todo o teste local.

Abra o primeiro terminal na raiz do repositório e execute:

```powershell
cd apps/api-springboot
.\mvnw.cmd spring-boot:run
```

Em Linux/macOS:

```bash
cd apps/api-springboot
./mvnw spring-boot:run
```

Deixe esse terminal aberto. Quando a aplicação estiver pronta, o log deve indicar que o Tomcat iniciou na porta `18082`. Não feche esse terminal enquanto estiver usando o BFF ou o Angular. Enquanto a API estiver rodando, o comando não volta para o prompt; isso é esperado.

Verifique no navegador:

```text
http://localhost:18082/swagger
http://localhost:18082/actuator/health
```

Se `http://localhost:18082/actuator/health` responder `UP`, a API externa está pronta para o BFF consumir.

### 2. Subir o BFF

Abra outro terminal na raiz do repositório:

```powershell
cd apps/bff-dotnet
dotnet restore Painel.sln
dotnet run --project src/Painel.Bff
```

Verifique se respondeu:

```text
http://localhost:5080/swagger
```

O BFF busca os dados do ERP Mock em `http://localhost:18082`. Por isso, deixe o Spring Boot rodando antes de abrir o dashboard.

### 3. Subir o Angular

Abra um terceiro terminal na raiz do repositório:

```powershell
cd apps/web-angular
npm ci
npm start
```

Acesse:

```text
http://localhost:4200
```

Login local:

```text
Usuário: demo
Senha: demo
```

O login é mockado para desenvolvimento. Qualquer usuário não vazio com senha de pelo menos 4 caracteres também passa.

### Checklist rápido

Antes de abrir o Angular, confirme:

- `http://localhost:18082/actuator/health` retorna o health do ERP Mock.
- `http://localhost:5080/swagger` abre o Swagger do BFF.
- O terminal do BFF não mostra erro de conexão com `localhost:18082`.

### Problemas comuns

- Spring Boot falhou com `Port 18082 was already in use`: já existe outro processo usando a porta da API externa. No Windows, descubra o PID com `netstat -ano | findstr :18082`, confira com `Get-Process -Id <PID>` e pare o processo se for uma instância antiga da própria API. Depois rode `.\mvnw.cmd spring-boot:run` novamente.
- Porta ocupada em outra app: encerre o processo que está usando `5080` ou `4200`, ou ajuste a porta na configuração da app correspondente.
- Dashboard vazio ou erro no Angular: confirme que o ERP Mock e o BFF estão rodando. O Angular chama somente o BFF.
- Erro de CORS: use `http://localhost:4200`; esta origem já está liberada no BFF.
- Erro no `npm ci`: remova `node_modules` e garanta que a versão do Node seja 20.19.0 ou superior.
- Erro de Java: confirme `java -version` apontando para Java 21.
- Erro de .NET: confirme `dotnet --version` com SDK 10 instalado.

## Regras Arquiteturais

- O Angular chama apenas o BFF.
- O dashboard lê dados do banco local do BFF.
- O ERP Mock é acessado pelo BFF somente via HTTP, em sincronizações e health checks.
- O BFF não acessa o banco do ERP Mock.
- O ERP Mock não acessa o banco do BFF.
- A regra oficial de saúde de projeto pertence ao BFF.
- O Angular apenas apresenta os indicadores retornados pela API.
- Thresholds ficam em configuração nesta fase; não há edição dinâmica como requisito inicial.

## Tecnologias

### Angular

O Angular foi escolhido por ser uma habilidade desejada na vaga e também por ser uma ferramenta que gosto de usar. Para este tipo de painel, ele oferece uma base consistente para componentes, rotas, interceptors, formulários, testes e organização por funcionalidades.

### .NET / C#

O BFF usa .NET e C# para centralizar API, autenticação, regra de saúde, tratamento de erros, integração HTTP e acesso ao banco local. A linguagem favorece modelagem tipada e testes unitários claros para regras de negócio.

### Java / Spring Boot

O ERP Mock usa Java e Spring Boot para representar um sistema corporativo externo. A intenção é simular uma integração realista, com contrato próprio e evolução possível para JPA, Flyway, Datafaker e Testcontainers.

## Parte 2 Implementada

A fatia implementada como bônus é a calculadora oficial de saúde de projetos no BFF .NET.

Ela demonstra a decisão mais importante do design: a regra de saúde fica no backend, usa tipos adequados para horas e percentuais, recebe uma data de referência explícita e retorna status e motivos para o Angular apenas apresentar.

Cenários cobertos pelos testes:

- projeto saudável;
- atenção por consumo;
- atenção por desvio de progresso;
- atenção por saldo planejado negativo;
- crítico por saldo contratual negativo;
- crítico por desvio de progresso;
- crítico por atraso;
- inconsistente por horas vendidas zeradas com horas trabalhadas;
- precedência entre status;
- arredondamento de percentuais.

Validação executada em 16/07/2026:

```powershell
cd apps/bff-dotnet
dotnet restore Painel.sln
dotnet build Painel.sln -c Release --no-restore
dotnet test Painel.sln -c Release --no-build
```

Resultado: build com sucesso e **10 testes aprovados**.

## Como Validar Build e Testes

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

```powershell
cd apps/bff-dotnet
dotnet restore Painel.sln
dotnet build Painel.sln -c Release --no-restore
dotnet test Painel.sln -c Release --no-build
```

### Angular

```powershell
cd apps/web-angular
npm ci
npm run lint
npm test
npm run build
npm run e2e
```

## CI

O repositório possui workflows para validar:

- Spring Boot com Maven Wrapper;
- BFF .NET com restore, build e testes;
- Angular com `npm ci`, lint, testes, build e E2E;
- padrão de commits com Conventional Commits.

## Status Atual

O projeto ainda está em refatoração incremental. A fase atual prioriza deixar o monorepo executável, com CI básico confiável, antes de avançar para persistência local completa, sincronização idempotente, seed determinístico e integração final do Angular com os indicadores oficiais do BFF.

## Fluxo de Trabalho

- Issues orientam as tasks por fase.
- Commits seguem Conventional Commits.
- Tags seguem SemVer no formato `vMAJOR.MINOR.PATCH`.
- Secrets reais não devem ser versionados.
