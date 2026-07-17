# HC - Painel de Saúde de Projetos

## Documento de Design e Arquitetura

Candidato: Rubens Lyra
Case técnico: Processo Seletivo Dev JR - PVT
Data: 16/07/2026

## 1. Resumo executivo

O HC, sigla para Health Check, é uma proposta de painel para acompanhamento da saúde de projetos. A solução foi pensada para um contexto de gestão de clientes, projetos e apontamentos de horas, em que a coordenação precisa identificar rapidamente riscos de consumo, prazo e evolução física.

A ideia principal não foi criar um ERP completo, mas desenhar uma solução de painel que seja clara, resiliente e evolutiva. Por isso, a arquitetura separa o sistema de visualização e decisão do sistema externo de origem dos dados. O BFF mantém uma base local, calcula os indicadores oficiais e entrega ao frontend informações prontas para apresentação.

Essa decisão permite que o dashboard continue disponível mesmo quando o ERP estiver indisponível. Nessa situação, o painel pode operar com a última carga válida, indicando ao usuário que os dados podem estar defasados. Para o escopo do case, essa escolha demonstra uma preocupação prática com disponibilidade, consistência de regras e separação de responsabilidades.

## 2. Objetivo do projeto

O objetivo do HC é apoiar a tomada de decisão sobre a saúde dos projetos. O painel deve ajudar a responder perguntas como:

- quais projetos estão saudáveis;
- quais projetos exigem atenção;
- quais projetos estão em situação crítica;
- quais projetos consumiram horas mais rápido que o avanço físico;
- quais projetos já ultrapassaram as horas vendidas;
- quais projetos estão próximos do prazo final ou atrasados;
- quando ocorreu a última sincronização com o ERP;
- se os dados exibidos estão atualizados ou em estado degradado.

O projeto foi dividido em duas entregas:

- Parte 1: documento de design e arquitetura, cobrindo modelagem, desenho da solução, API, regras de negócio, requisitos e decisões técnicas.
- Parte 2: uma pequena fatia implementada, focada na regra oficial de saúde de projetos no BFF, com testes unitários.

## 3. Requisitos funcionais

Os requisitos funcionais abaixo nortearam o desenho da solução.

| Código | Requisito | Justificativa |
| --- | --- | --- |
| RF01 | Listar projetos com indicadores de saúde | É a principal função do painel e apoia a visão executiva da coordenação. |
| RF02 | Exibir detalhe de um projeto | Permite investigar os motivos de um status de atenção ou crítico. |
| RF03 | Calcular saldo contratual de horas | Indica se o projeto consumiu mais horas do que foi vendido. |
| RF04 | Calcular saldo planejado de horas | Ajuda a comparar execução real com planejamento interno. |
| RF05 | Calcular percentual de consumo | Mostra o quanto do contrato já foi consumido. |
| RF06 | Comparar consumo de horas com avanço físico | Detecta projetos que consomem horas mais rápido do que evoluem. |
| RF07 | Classificar projeto como Healthy, Attention, Critical ou Inconsistent | Cria uma linguagem simples para priorização operacional. |
| RF08 | Registrar motivos do status de saúde | Permite explicar por que um projeto está em atenção ou crítico. |
| RF09 | Considerar apenas apontamentos aprovados nos indicadores | Evita que horas pendentes, rejeitadas ou canceladas distorçam a gestão. |
| RF10 | Sincronizar dados do ERP externo | Mantém o painel atualizado a partir da origem de dados simulada. |
| RF11 | Registrar execuções de integração | Cria rastreabilidade sobre cargas realizadas, sucessos e falhas. |
| RF12 | Registrar erros individuais de integração | Permite continuar uma carga mesmo que um registro isolado seja inválido. |
| RF13 | Consultar o dashboard sem depender do ERP em tempo real | Mantém o painel utilizável mesmo em indisponibilidade do ERP. |
| RF14 | Autenticar usuários no painel | Protege acesso aos dados e prepara o sistema para perfis de uso. |
| RF15 | Expor API documentada para o frontend | Facilita integração, testes e evolução do contrato entre frontend e BFF. |

## 4. Requisitos não funcionais

| Código | Requisito | Justificativa |
| --- | --- | --- |
| RNF01 | Disponibilidade do dashboard mesmo com ERP indisponível | O painel deve apoiar decisões operacionais e não pode depender de uma integração externa a cada leitura. |
| RNF02 | Consistência da regra de saúde | A regra oficial deve existir em um único lugar, evitando divergências entre clientes. |
| RNF03 | Testabilidade | Regras críticas, como saúde do projeto, devem ser cobertas por testes automatizados. |
| RNF04 | Resiliência na integração | Falhas no ERP ou em registros específicos não devem apagar a última carga válida. |
| RNF05 | Observabilidade mínima | Execuções, erros e correlações ajudam a diagnosticar problemas. |
| RNF06 | Segurança | Endpoints sensíveis devem exigir autenticação. Secrets reais não devem ser versionados; o secret JWT presente na entrega é apenas valor local de teste para bootstrap. |
| RNF07 | Manutenibilidade | A solução deve separar domínio, aplicação, infraestrutura e apresentação. |
| RNF08 | Evolução incremental | O case deve ser desenvolvido por fases, sem tentar resolver tudo de uma vez. |
| RNF09 | Precisão numérica | Horas e percentuais devem usar tipos decimais, evitando erros de ponto flutuante. |
| RNF10 | Performance adequada para dashboard | Leitura deve usar paginação, projeções e evitar dependência de chamadas externas em tempo real. |
| RNF11 | Contratos explícitos | O contrato legado do ERP não deve contaminar o domínio interno nem a API pública do BFF. |
| RNF12 | Acessibilidade e usabilidade no frontend | O painel precisa ser claro, navegável e compreensível para uso recorrente. |

## 5. Arquitetura proposta

A arquitetura proposta é composta por Angular, BFF .NET, persistência local do painel e ERP Mock em Spring Boot como API externa isolada. O alvo do BFF é PostgreSQL; a entrega local usa EF InMemory. O ERP Mock usa dados em memória com seed determinístico, com banco próprio previsto como evolução.

Usuário → Angular 20 → BFF ASP.NET Core .NET 10 → persistência local do HC
BFF ASP.NET Core .NET 10 → HTTP via Refit → Spring Boot ERP Mock com dados em memória

A regra principal é que o Angular chama apenas o BFF. O frontend não acessa o ERP diretamente. O BFF também não acessa o banco do ERP, e o ERP não acessa o banco do BFF. A comunicação entre BFF e ERP ocorre somente por HTTP.

Diagrama de arquitetura:

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
  +--> Persistência local do HC
  |
  +--> HTTP via Refit
          |
          v
      Spring Boot ERP Mock
          |
          v
      Dados em memória com seed determinístico
```

Fluxo de leitura do dashboard:

```text
Usuário -> Angular -> BFF -> persistência local do HC
                         |
                         v
                  Calcula saúde
                         |
                         v
Angular <- DTOs com status, indicadores e motivos <- BFF
```

Fluxo de sincronização:

```text
Coordenador/Admin
  |
  v
POST /api/v1/integrations/erp/synchronizations
  |
  v
BFF cria IntegrationExecution Running
  |
  v
BFF consulta ERP Mock por páginas
  |
  v
BFF normaliza, valida e mapeia contratos legados
  |
  +--> Upsert no banco local por ExternalId
  |
  +--> Registra IntegrationError para registros inválidos
  |
  v
BFF finaliza IntegrationExecution
```
Essa separação reduz acoplamento, facilita testes e representa melhor um cenário real, em que o painel precisa conviver com sistemas externos sem assumir controle sobre eles.


## 5.1 Estado executável da entrega

Para que a avaliação consiga executar a stack sem dependências implícitas, a entrega atual define portas e defaults locais explícitos:

| Componente | Porta local | Observação |
| --- | --- | --- |
| ERP Mock Spring Boot | `18082` | API externa simulada. Deve subir antes do BFF. |
| BFF ASP.NET Core | `5080` | API do painel e Swagger em `/swagger`. |
| Angular | `4200` | Frontend que consome apenas o BFF. |

A porta do ERP Mock foi movida para `18082` para evitar conflitos com serviços comuns em `8080`, `8081` e `8082`. O BFF consome o ERP Mock por `Erp:BaseUrl=http://localhost:18082`.

A execução local não exige PostgreSQL. Se `ConnectionStrings: Painel` estiver vazia, o BFF usa EF Core InMemory. O desenho-alvo continua prevendo PostgreSQL para persistência local durável, mas o banco em memória reduz risco operacional durante o teste técnico.

O BFF também possui um `Jwt:Secret` local de teste para impedir falha de inicialização em `dotnet run`. Esse valor não é secret real. Em ambiente real, deve ser sobrescrito por `Jwt__Secret` via variável de ambiente ou secret manager.

## 6. Justificativa das tecnologias

## 6.1 .NET / C# no BFF

Escolhi .NET com C# para o BFF porque ele é uma boa opção para construir APIs robustas, tipadas e com boa produtividade. O BFF concentra as regras do painel, autenticação, tratamento de erros, integração com banco local e integração HTTP com o ERP Mock.

C# favorece a modelagem de domínio com tipos claros, enums, records/classes e testes unitários objetivos. Para este case, isso foi importante principalmente na regra de saúde de projetos, em que precisão numérica, clareza de cálculo e previsibilidade são fundamentais.

Além disso, ASP.NET Core oferece recursos maduros para APIs REST, injeção de dependência, autenticação JWT, OpenAPI, health checks, middlewares e ProblemDetails. Isso torna o BFF uma camada adequada para centralizar decisões que não deveriam ficar espalhadas no frontend.

## 6.2 Java / Spring Boot no ERP Mock

Usei Java com Spring Boot para representar o ERP Mock porque é uma combinação muito comum em sistemas corporativos. A intenção foi simular um sistema externo realista, com contrato próprio, dados isolados do BFF e possibilidade de expor dados em formato legado. Banco próprio fica como evolução natural do mock.

Essa escolha ajuda a demonstrar uma fronteira clara entre sistemas. O ERP Mock não é apenas uma lista em memória; ele representa uma origem externa que pode ter seus próprios nomes de campos, formatos de data, formatos numéricos e regras internas.

Na arquitetura, o Spring Boot também permite evoluir o mock com Spring Data JPA, Bean Validation, Actuator, Flyway, Datafaker e Testcontainers. Isso deixa o ambiente mais próximo de uma integração real, sem depender de um ERP verdadeiro.

## 6.3 Angular no frontend

Escolhi Angular para o frontend porque ele era uma habilidade desejada na descrição da vaga e também porque é uma ferramenta com a qual gosto muito de trabalhar. Para este tipo de painel, Angular é uma escolha forte por oferecer uma estrutura consistente para aplicações corporativas: roteamento, componentes, injeção de dependência, formulários, interceptors, testes e integração com bibliotecas como Angular Material.

A proposta não é apenas “usar Angular”, mas organizar o frontend de forma intencional. O desenho prevê organização por funcionalidades, componentes standalone, rotas lazy, separação entre apresentação, estado e acesso a dados, Signals para estado síncrono e RxJS para fluxos assíncronos como HTTP, debounce, cancelamento e polling.

Essa combinação é defensável porque evita exagero arquitetural. Não introduzi NgRx global como padrão inicial, pois o escopo do case pode ser atendido com stores por feature, repositories e serviços bem tipados. O Angular fica responsável por apresentar os dados, lidar com estados de tela e oferecer uma boa experiência de uso, mas não recalcula a regra oficial de saúde.

## 7. Decisões arquiteturais principais

| Decisão | Justificativa |
| --- | --- |
| Angular chama apenas o BFF | Evita acoplamento do frontend com o ERP e centraliza regras e segurança. |
| BFF mantém persistência local própria | Permite dashboard disponível mesmo quando o ERP está fora. O alvo é PostgreSQL; localmente, a entrega usa EF InMemory quando não há connection string. |
| ERP Mock é isolado do BFF | Simula uma fronteira real entre sistemas. A entrega atual usa dados em memória com seed determinístico; banco próprio é evolução prevista. |
| Saúde do projeto fica no BFF | Evita duplicidade de regra entre frontend e backend. |
| Refit fica na infraestrutura | Mantém integração HTTP fora do domínio. |
| IDs internos são separados de ExternalId | Evita depender da chave do ERP como identidade local. |
| Horas usam decimal/BigDecimal | Evita imprecisão em cálculos gerenciais. |
| Thresholds começam por configuração | Mantém a primeira versão simples e proporcional ao case. |
| Angular por features | Facilita manutenção, lazy loading e evolução do frontend. |

## 8. Modelagem de domínio

As principais entidades propostas são:

- Client: cliente dono dos projetos.
- Project: projeto monitorado pelo painel, com horas vendidas, horas planejadas, avanço físico e status de ciclo de vida.
- Analyst: profissional que pode ser alocado em projetos.
- Allocation: relação planejada entre analista e projeto.
- TimeEntry: apontamento de horas. Apenas apontamentos aprovados entram nos indicadores.
- IntegrationExecution: execução de integração com o ERP.
- IntegrationError: erro individual de importação.


Modelo conceitual resumido:

```text
Client 1 ---- N Project
Project 1 --- N Allocation
Analyst 1 --- N Allocation
Project 1 --- N TimeEntry
Analyst 1 --- N TimeEntry
Allocation 0..1 --- N TimeEntry
IntegrationExecution 1 --- N IntegrationError
```

Estrutura de dependência entre modelos:

```text
Contrato legado do ERP
        |
        v
External DTO
        |
        v
Import Model validado
        |
        v
Entidade de domínio do HC
        |
        v
DTO público do BFF
        |
        v
Angular apresenta os dados
```
Enums principais:

- ProjectLifecycleStatus: Planned, InProgress, Completed, Cancelled.
- ProjectHealthStatus: Healthy, Attention, Critical, Inconsistent.
- TimeEntrySource: Portal, Erp, Import.
- TimeEntryStatus: Pending, Approved, Rejected, Cancelled.
- IntegrationType: Full, Incremental, Manual.
- IntegrationExecutionStatus: Running, Succeeded, PartiallySucceeded, Failed, Cancelled.

## 9. Regra de saúde de projetos

A regra de saúde é a parte mais crítica do domínio. Ela foi colocada no BFF para garantir uma única fonte de verdade.

Entradas consideradas:

- horas vendidas;
- horas planejadas;
- horas trabalhadas aprovadas;
- avanço físico;
- data prevista de término;
- status de ciclo de vida;
- thresholds configurados;
- data de referência.

Fórmulas:

WorkedHours = soma de TimeEntry.Hours onde Status == Approved
ContractBalanceHours = SoldHours - WorkedHours
PlannedBalanceHours = PlannedHours - WorkedHours
ConsumptionPercentage = WorkedHours / SoldHours * 100
ProgressGapPercentagePoints = ConsumptionPercentage - PhysicalProgressPercentage

Um projeto está atrasado quando a data prevista de término é menor que a data de referência, o ciclo de vida não é Completed e o avanço físico é menor que 100%.

Prioridade de status:

1. Inconsistent
2. Critical
3. Attention
4. Healthy

Condições principais:

- Inconsistent: dados impossíveis de calcular, como horas vendidas zeradas com horas trabalhadas.
- Critical: saldo contratual negativo, desvio crítico ou projeto atrasado.
- Attention: consumo alto, desvio moderado, saldo planejado negativo ou prazo próximo.
- Healthy: nenhuma condição de atenção, criticidade ou inconsistência.

## 10. API proposta do BFF

Base path: /api/v1

Projetos:

- GET /projects
- GET /projects/{id}
- GET /projects/{id}/health
- GET /projects/{id}/allocations
- GET /projects/{id}/time-entries

Apontamentos:

- POST /time-entries
- GET /time-entries/{id}
- POST /time-entries/{id}/approval
- POST /time-entries/{id}/rejection
- DELETE /time-entries/{id}

Integração ERP:

- POST /integrations/erp/synchronizations
- GET /integrations/erp/synchronizations/latest
- GET /integrations/erp/synchronizations/{id}
- GET /integrations/erp/health

A API deve usar JSON em camelCase, datas em ISO 8601, paginação, CancellationToken e ProblemDetails para erros.

## 11. Integração com ERP Mock

O ERP Mock expõe contratos legados paginados. Um exemplo de payload externo seria:

{
  "CODPROJETO": "PRJ-DEMO-0001",
  "NOMEPROJETO": " Implantação RM ",
  "CODCLIENTE": "CLI-DEMO-0001",
  "HORASVENDIDAS": "500,00",
  "HORASPLANEJADAS": "450,00",
  "AVANCOFISICO": "55",
  "DTINICIO": "15/01/2026",
  "DTFIMPREV": "30/08/2026",
  "SITUACAO": "E",
  "DTALTERACAO": "13/07/2026 14:30:00"
}

Esse contrato não deve ser reutilizado diretamente no domínio. A conversão passa por uma camada anticorrupção:

1. DTO externo do ERP.
2. Modelo de importação validado.
3. Entidade de domínio local.
4. DTO público do BFF.

Essa separação permite lidar com formatos legados sem contaminar o restante da aplicação.

## 12. Arquitetura Angular

O frontend Angular deve ser organizado por funcionalidades, com separação entre apresentação, estado e acesso a dados.

Estrutura de responsabilidades no Angular:

```text
Page Component
  |
  v
Feature Store / Facade
  |
  v
Repository / API Service
  |
  v
HttpClient
  |
  v
BFF .NET
```

Separação interna por feature:

```text
features/projects/
  pages/          -> telas roteáveis
  components/     -> componentes visuais
  state/          -> estado da feature
  data-access/    -> repositories, API services e mappers
  models/         -> modelos da feature
  projects.routes.ts
```

Fluxo recomendado:

Page Component → Feature Store / Facade → Repository / API Service → HttpClient → BFF

Diretrizes:

- componentes standalone;
- rotas lazy por feature;
- page components coordenando estado;
- componentes presentacionais com inputs e outputs tipados;
- Signals para estado síncrono e derivado;
- RxJS para HTTP, debounce, cancelamento, polling e composição temporal;
- repositories isolando HttpClient;
- interceptors funcionais para autenticação, correlação e tratamento de erros;
- pipes customizados apenas para transformação visual;
- formulários reativos tipados;
- testes de stores, services, mappers, pipes e fluxos RxJS.

A regra oficial de saúde não fica no Angular. O frontend apenas apresenta os indicadores retornados pelo BFF.

## 13. Persistência local

O BFF deve possuir persistência local própria. O alvo arquitetural é PostgreSQL, mas a entrega executável usa EF Core InMemory quando `ConnectionStrings: Painel` está vazia, para que o case rode sem banco externo. As tabelas previstas para a evolução relacional são:

- clients;
- projects;
- analysts;
- allocations;
- time_entries;
- integration_executions;
- integration_errors;
- audit_events, caso a auditoria seja mantida.

Padrões previstos:

- snake_case;
- bigint identity;
- numeric para horas e percentuais;
- timestamptz para instantes;
- enums como string;
- DeleteBehavior.Restrict;
- índices para external_id, relacionamentos e consultas do dashboard.

## 14. Tratamento de erros e segurança

A API deve usar ProblemDetails e não expor detalhes internos, como stack trace, SQL, connection string, secrets ou payload sensível.

Mapeamento previsto:

- ValidationException: 400
- NotFoundException: 404
- ConflictException: 409
- BusinessRuleException: 422
- ExternalServiceException: 503
- erro não tratado: 500

A autenticação mock é aceitável somente em Development ou avaliação técnica. O `Jwt:Secret` local versionado existe apenas para evitar falha de bootstrap em `dotnet run`; não é secret real. Em produção, o BFF deve sobrescrever esse valor por variável de ambiente ou mecanismo equivalente.

## 15. Testes

A estratégia de testes acompanha o risco de cada camada:

- domínio BFF: regra de saúde, precedência, arredondamento e divisão por zero;
- aplicação BFF: casos de uso, mapeamentos e paginação;
- infraestrutura BFF: EF InMemory local, PostgreSQL/migrations como evolução relacional, Refit e health checks;
- ERP Mock: seed determinístico, paginação e contratos legados;
- Angular: stores, services, pipes, guards, interceptors e estados de tela;
- E2E: login, dashboard, detalhe, sincronização e estado degradado.

Para o case, considerei mais importante demonstrar testes relevantes do que buscar cobertura artificial.

## 16. Parte 2 implementada

A fatia implementada foi a calculadora oficial de saúde no BFF.

Arquivos principais:

- apps/bff-dotnet/src/Painel.Domain/Indicators.cs
- apps/bff-dotnet/src/Painel.Domain/Models.cs
- apps/bff-dotnet/tests/Painel.Tests/IndicatorsTests.cs

O que foi implementado:

- ProjectHealthCalculator no domínio;
- ProjectHealthResult com saldos, consumo, desvio, atraso, status e motivos;
- uso de decimal;
- data de referência explícita;
- status Healthy, Attention, Critical e Inconsistent;
- precedência clara entre status;
- testes unitários cobrindo os principais cenários.

Comandos validados em 16/07/2026:

cd apps/bff-dotnet
dotnet restore Painel.sln
dotnet build Painel.sln -c Release --no-restore
dotnet test Painel.sln -c Release --no-build

Resultado:

- build com êxito;
- 0 avisos;
- 0 erros;
- 10 testes aprovados.

Essa fatia foi escolhida porque demonstra a decisão mais importante da solução: a regra crítica de negócio fica no backend, é determinística, testável e não depende do Angular.

## 17. Plano de evolução

A evolução proposta é incremental:

1. consolidar repositório executável, wrappers, lockfiles e CI básico;
2. evoluir o domínio do BFF com entidades reais e invariantes;
3. finalizar a regra de saúde e remover duplicação do Angular;
4. evoluir a persistência local do BFF de EF InMemory para PostgreSQL com migrations;
5. evoluir o ERP Mock com JPA, Flyway, Datafaker e seed determinístico;
6. implementar sincronização idempotente via Refit;
7. expor endpoints completos do BFF com paginação, filtros e ProblemDetails;
8. refatorar Angular por features, stores, repositories e estados de tela;
9. completar Docker Compose, E2E integrado e documentação operacional.

## 18. Riscos e mitigação

| Risco | Mitigação |
| --- | --- |
| ERP indisponível afetar o dashboard | BFF mantém banco local e última carga válida. |
| Regra duplicada entre frontend e backend | Regra oficial fica no BFF. |
| Contrato legado contaminar o domínio | Camada anticorrupção separa DTO externo, import model, domínio e response pública. |
| Sincronização duplicar dados | Upsert por ExternalId e execução idempotente. |
| Complexidade excessiva para o case | Evolução por fases e abstrações proporcionais. |
| Dados numéricos imprecisos | Uso de decimal/BigDecimal. |
| Testes frágeis por relógio real | Regra recebe data de referência explicitamente. |

## 19. Como pretendo defender a solução

A defesa principal é que a solução equilibra simplicidade e realismo.

O dashboard não deve depender do ERP em tempo real, porque isso deixaria a experiência do usuário vulnerável a falhas de outro sistema. Por isso, o BFF mantém uma base local e sincroniza dados em momentos controlados.

A regra de saúde fica no BFF porque ela é uma regra de negócio crítica. Se o Angular calculasse essa regra, outro consumidor da API poderia apresentar resultados diferentes. Centralizar a regra no backend melhora consistência, teste e manutenção.

O ERP Mock é tratado como sistema externo e legado. Isso justifica a camada anticorrupção, que impede que formatos externos contaminem o domínio do painel.

Também evitei adotar padrões complexos sem necessidade. Não usei microserviços, mensageria, CQRS distribuído ou estado global pesado no Angular porque o problema não exige esse custo. A arquitetura permite evolução, mas começa pelo que resolve melhor o case.

## 20. Conclusão

O HC foi desenhado como um painel resiliente para acompanhamento de projetos. A solução preserva fronteiras claras entre frontend, BFF e ERP Mock, centraliza a regra de saúde no backend e propõe uma evolução incremental com testes e versionamento.

A Parte 1 apresenta o desenho completo da solução. A Parte 2 implementa a regra de maior valor para o domínio, com testes automatizados, demonstrando que a arquitetura proposta não ficou apenas no papel.

