# RM Mock API (Spring Boot 3.3, Java 21)

Simula o TOTVS RM para desenvolvimento local do Painel.

## Rodar e deixar rodando

Esta app é a **API externa simulada** do projeto. Ela representa o ERP Mock e deve ser iniciada antes do BFF.

No Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Em Linux/macOS:

```bash
./mvnw spring-boot:run
```

Mantenha esse terminal aberto. Enquanto ele estiver aberto, a API externa fica disponível em `http://localhost:18082`. O comando não volta para o prompt enquanto a API está rodando; isso é esperado. Para parar, use `Ctrl+C` no terminal.

URLs úteis:

- Swagger: `http://localhost:18082/swagger`
- Health check: `http://localhost:18082/actuator/health`

Se o health check responder `UP`, o BFF já pode consumir esta API externa.


## Banco local e seed

Por padrão, o ERP Mock usa PostgreSQL local:

```powershell
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/painel_hc_rm"
$env:SPRING_DATASOURCE_USERNAME="painel"
$env:SPRING_DATASOURCE_PASSWORD="painel"
```

O seed é idempotente: se já houver projetos no banco, ele não sobrescreve os dados. Para controlar volume:

```powershell
$env:RM_MOCK_PROJECTS="20"
$env:RM_MOCK_ANALYSTS="48"
$env:RM_MOCK_ENTRIES_PER_PROJECT="36"
$env:RM_MOCK_SEED="2026"
```

## Eventos e webhook

A API gera novos apontamentos e eventos RM automaticamente nos intervalos de 3, 5, 17, 40 e 86 minutos. O destino padrão do webhook é:

```text
http://localhost:5080/api/v1/erp-webhooks/rm-events
```

Para testar sem esperar o agendamento:

```powershell
Invoke-RestMethod -Method Post http://localhost:18082/rm/events/generate
Invoke-RestMethod http://localhost:18082/rm/events
```
## Endpoints

- `GET /rm/projects`
- `GET /rm/projects/{id}`
- `GET /rm/projects/{id}/time-entries`
- `GET /rm/analysts`
- `GET /rm/events`
- `POST /rm/events/generate`

Dados gerados por **DataFaker** com seed determinística (`rm.mock.seed`).

## Se a porta 18082 estiver ocupada

Se o Maven terminar com `BUILD FAILURE` e a mensagem real for `Port 18082 was already in use`, já existe outro processo usando a porta da API externa.

No Windows:

```powershell
netstat -ano | findstr :18082
Get-Process -Id <PID>
```

Se o PID for uma execução antiga desta própria API, pare com `Ctrl+C` no terminal antigo ou finalize pelo Gerenciador de Tarefas. Depois rode novamente:

```powershell
.\mvnw.cmd spring-boot:run
```
