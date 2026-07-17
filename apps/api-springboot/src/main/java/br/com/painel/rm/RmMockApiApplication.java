package br.com.painel.rm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RmMockApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(RmMockApiApplication.class, args);
    }
}
