package br.com.painel.rm.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI api() {
        return new OpenAPI().info(new Info()
            .title("RM Mock API")
            .description("Simulação do TOTVS RM para o HC (Health Check)")
            .version("1.0.0"));
    }
}
