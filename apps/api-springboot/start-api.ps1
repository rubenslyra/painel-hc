$postgresHostPort = if ($env:POSTGRES_HOST_PORT) { $env:POSTGRES_HOST_PORT } else { "15432" }
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:$postgresHostPort/painel_hc_rm"
$env:SPRING_DATASOURCE_USERNAME="painel"
$env:SPRING_DATASOURCE_PASSWORD="painel"
$env:SERVER_PORT="18082"
Set-Location -LiteralPath "D:\source\cv-rubenslyra\vagas-julho-20\painel-hc\apps\api-springboot"
& ".\mvnw" spring-boot:run
