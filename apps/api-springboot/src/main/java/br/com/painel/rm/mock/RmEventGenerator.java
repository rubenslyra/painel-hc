package br.com.painel.rm.mock;

import br.com.painel.rm.domain.RmEventDto;
import br.com.painel.rm.persistence.AnalystEntity;
import br.com.painel.rm.persistence.ProjectEntity;
import br.com.painel.rm.persistence.ProjectRepository;
import br.com.painel.rm.persistence.RmEventEntity;
import br.com.painel.rm.persistence.RmEventRepository;
import br.com.painel.rm.persistence.TimeEntryEntity;
import br.com.painel.rm.persistence.TimeEntryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import net.datafaker.Faker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@Component
public class RmEventGenerator {
    private static final Logger log = LoggerFactory.getLogger(RmEventGenerator.class);

    private final ProjectRepository projects;
    private final TimeEntryRepository entries;
    private final RmEventRepository events;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;
    private final Faker faker = new Faker(new Locale("pt", "BR"), new Random());

    @Value("${rm.webhook.target-url:}")
    private String targetUrl;

    public RmEventGenerator(ProjectRepository projects, TimeEntryRepository entries, RmEventRepository events,
                            ObjectMapper objectMapper, RestClient.Builder restClientBuilder) {
        this.projects = projects;
        this.entries = entries;
        this.events = events;
        this.objectMapper = objectMapper;
        this.restClient = restClientBuilder.build();
    }

    @Transactional
    public RmEventDto generate(String source) {
        var allProjects = projects.findAll();
        if (allProjects.isEmpty()) {
            throw new IllegalStateException("Nao ha projetos seedados para gerar eventos RM.");
        }

        ProjectEntity project = allProjects.get(faker.random().nextInt(allProjects.size()));
        var team = new ArrayList<>(project.getAnalysts());
        AnalystEntity analyst = team.get(faker.random().nextInt(team.size()));
        double hours = 1 + faker.random().nextInt(7);
        String entryId = "te-" + project.getId() + "-" + UUID.randomUUID();

        TimeEntryEntity entry = new TimeEntryEntity(
            entryId,
            project,
            analyst,
            LocalDate.now(),
            hours,
            eventDescription(source),
            source
        );
        entries.save(entry);
        project.addWorkedHours(hours);
        projects.save(project);

        String eventId = "evt-" + UUID.randomUUID();
        String payload = toJson(Map.of(
            "timeEntryId", entryId,
            "analystId", analyst.getId(),
            "analystName", analyst.getName(),
            "hours", hours,
            "source", source
        ));
        var event = new RmEventEntity(eventId, "time_entry.created", project.getId(), OffsetDateTime.now(), payload);
        events.save(event);

        publish(event);
        events.save(event);
        return toDto(event);
    }


    private String eventDescription(String source) {
        String[] descriptions = {
            "Novo apontamento importado do ERP",
            "Atualização de horas executadas enviada pelo portal",
            "Registro adicional de atividade de implantação",
            "Apontamento de homologação recebido da equipe",
            "Correção operacional sincronizada pelo conector RM"
        };
        return descriptions[Math.abs(source.hashCode() + faker.random().nextInt(100)) % descriptions.length];
    }
    private void publish(RmEventEntity event) {
        if (targetUrl == null || targetUrl.isBlank()) return;
        try {
            restClient.post()
                .uri(targetUrl)
                .body(toDto(event))
                .retrieve()
                .toBodilessEntity();
            event.markDelivered();
        } catch (RuntimeException ex) {
            log.warn("Falha ao publicar webhook RM {} em {}: {}", event.getId(), targetUrl, ex.getMessage());
        }
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception ex) {
            throw new IllegalStateException("Falha ao serializar payload do evento RM.", ex);
        }
    }

    public static RmEventDto toDto(RmEventEntity event) {
        return new RmEventDto(event.getId(), event.getType(), event.getProjectId(), event.getOccurredAt(), event.getPayload(), event.isDelivered());
    }
}

