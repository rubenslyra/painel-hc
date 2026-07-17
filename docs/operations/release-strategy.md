# Estrategia de commits, issues e versoes

Este repositorio usa issues como unidade de planejamento, Conventional Commits como formato de historico e SemVer como estrategia de versionamento.

## Issues

Cada etapa relevante deve nascer de uma issue. A issue deve declarar:

- fase da refatoracao;
- area afetada;
- objetivo;
- criterios de aceite;
- comandos de validacao;
- impacto SemVer previsto.

Labels recomendadas:

- `phase:0` ate `phase:12`;
- `area:web`, `area:bff`, `area:erp`, `area:ci`, `area:docs`, `area:security`;
- `type:feat`, `type:fix`, `type:docs`, `type:test`, `type:build`, `type:ci`, `type:refactor`.

## Conventional Commits

Formato:

```text
<type>(<scope>): <summary>

Refs #<issue>
```

Tipos permitidos:

- `feat`: funcionalidade ou capacidade nova;
- `fix`: correcao de comportamento;
- `docs`: documentacao;
- `test`: testes;
- `build`: build, dependencias e empacotamento;
- `ci`: pipelines e automacao;
- `chore`: manutencao sem impacto funcional;
- `refactor`: mudanca interna sem alterar comportamento;
- `perf`: melhoria de desempenho;
- `security`: correcao ou endurecimento de seguranca.

Scopes permitidos:

- `repo`;
- `docs`;
- `web`;
- `bff`;
- `erp`;
- `ci`;
- `security`;
- `e2e`;
- `docker`;
- `release`.

Exemplos:

```text
build(erp): add maven wrapper

Refs #1
```

```text
docs(architecture): document angular frontend strategy

Refs #2
```

```text
security(bff): require jwt secret outside development

Closes #3
```

## SemVer

Formato de tags:

```text
vMAJOR.MINOR.PATCH
```

Enquanto o projeto estiver abaixo de `1.0.0`, a estrategia e:

- `0.MINOR.0`: marco funcional ou fase relevante concluida;
- `0.MINOR.PATCH`: correcao, documentacao ou ajuste de build dentro do marco;
- `1.0.0`: entrega final aderente aos criterios de aceite do case.

Mapeamento:

| Mudanca | Versao |
| --- | --- |
| `feat` com valor de produto/case | MINOR |
| `fix`, `perf`, `security` | PATCH |
| `docs`, `test`, `build`, `ci`, `chore`, `refactor` | PATCH quando entrar em entrega versionada |
| `BREAKING CHANGE` ou `!` | MAJOR apos `1.0.0`; antes disso, novo `0.MINOR.0` com destaque no changelog |

## Tags planejadas

- `v0.1.0`: repositorio executavel, CI basico e documento principal da Parte 1.
- `v0.2.0`: dominio do BFF e regra oficial de saude testada.
- `v0.3.0`: ERP Mock persistente com seed deterministico.
- `v0.4.0`: persistencia local do BFF e migrations.
- `v0.5.0`: sincronizacao idempotente via Refit.
- `v0.6.0`: Angular integrado ao BFF com arquitetura por feature.
- `v0.7.0`: Docker Compose e E2E integrado.
- `v1.0.0`: entrega final documentada e validada.

## Changelog

O `CHANGELOG.md` deve ser atualizado antes de cada tag, agrupando mudancas por:

- Added;
- Changed;
- Fixed;
- Security;
- Documentation;
- Tests.

## Comandos de release

Criar tag somente depois de validacao e autorizacao explicita:

```powershell
git tag -a v0.1.0 -m "v0.1.0 - baseline executavel e arquitetura"
git push origin v0.1.0
```

Nao criar tag se build ou testes obrigatorios da fase falharem.
