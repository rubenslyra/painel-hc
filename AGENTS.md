# AGENTS.md

## Contexto

Este monorepo se chama `painel-hc`. HC significa Health Check.

O objetivo principal e entregar uma solucao bem justificada para o case tecnico do modulo Painel de Projetos: arquitetura, modelagem, API, regras de negocio e uma fatia implementada quando viavel.

## Diretrizes

- Documentacao em portugues brasileiro.
- Codigo, namespaces, endpoints e nomes tecnicos em ingles.
- Preservar as aplicacoes existentes em `apps/api-springboot`, `apps/bff-dotnet` e `apps/web-angular`.
- Angular deve consumir apenas o BFF.
- BFF deve manter banco local independente e usar Refit somente para sincronizacao/health do ERP Mock.
- Spring Boot representa o ERP externo e deve ter banco independente.
- A regra oficial de saude de projeto pertence ao BFF.
- Nao versionar secrets reais.
- Nao fazer commit ou push sem autorizacao explicita.

## Prioridade de entrega

1. Documento de arquitetura e decisoes tecnicas.
2. Repositorio executavel com build/testes basicos.
3. Fatia vertical pequena demonstrando sincronizacao, persistencia local e dashboard.
