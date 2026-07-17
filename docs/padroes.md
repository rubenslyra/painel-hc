# Guia de Desenvolvimento — Padrões

Complementa `docs/guia-desenvolvimento.md` do repositório principal.

## Princípios
- **SOLID** e **Clean Code** em todas as camadas.
- **Hexagonal**: Domain e Application não conhecem framework; Infra implementa portas.
- **Reaproveitamento**: fórmulas de indicadores em `Painel.Domain/Indicators.cs` e
  `web-angular/src/app/core/domain/indicators.ts` são espelhos exatos.
- **Testes**: unitários para regras, integração para fluxo HTTP, e2e para jornada do usuário.

## Segurança
- JWT (access curto + refresh rotativo).
- CORS restrito por origem.
- FluentValidation (BFF) e formulários reativos com validação (Angular).
- Segredos por variável de ambiente — nunca commitados.

## Observabilidade
- Logs JSON estruturados (Serilog / Logback).
- `X-Correlation-Id` propagado ponta a ponta.
- Auditoria de mudanças sensíveis em `audit_events`.

## Fluxo de trabalho
1. Feature branch a partir de `main`.
2. PR passa por CI (`ci.yml`) — lint, testes unitários, build, e2e headless.
3. Artefato zip do Angular gerado a cada PR.
4. Deploy: BFF (Docker), Angular (S3/Cloudfront ou hospedado pelo próprio BFF).
