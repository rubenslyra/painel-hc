# RM Mock API (Spring Boot 3.3, Java 21)

Simula o TOTVS RM para desenvolvimento local do Painel.

## Rodar

```bash
./mvnw spring-boot:run
# http://localhost:8081/swagger
```

## Endpoints

- `GET /rm/projects`
- `GET /rm/projects/{id}`
- `GET /rm/projects/{id}/time-entries`
- `GET /rm/analysts`

Dados gerados por **DataFaker** com seed determinística (`rm.mock.seed`).
