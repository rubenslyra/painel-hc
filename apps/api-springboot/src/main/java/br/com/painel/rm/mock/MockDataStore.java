package br.com.painel.rm.mock;

import br.com.painel.rm.domain.AnalystDto;
import br.com.painel.rm.domain.ProjectDto;
import br.com.painel.rm.domain.TimeEntryDto;
import jakarta.annotation.PostConstruct;
import net.datafaker.Faker;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.IntStream;

/**
 * Gerador determinístico de dados falsos para o mock do TOTVS RM.
 * Usa {@link Faker} com seed configurável para respostas estáveis entre execuções.
 */
@Component
public class MockDataStore {

    @Value("${rm.mock.projects:8}")
    private int projectCount;

    @Value("${rm.mock.seed:42}")
    private long seed;

    private final List<ProjectDto> projects = new ArrayList<>();
    private final Map<String, List<TimeEntryDto>> entriesByProject = new HashMap<>();
    private final List<AnalystDto> analysts = new ArrayList<>();

    @PostConstruct
    void generate() {
        Faker faker = new Faker(new Locale("pt", "BR"), new Random(seed));

        for (int i = 1; i <= 6; i++) {
            analysts.add(new AnalystDto(
                "a" + i,
                "RM-U0" + i,
                faker.name().fullName(),
                faker.internet().emailAddress(),
                switch (i % 4) { case 0 -> "Tech Lead"; case 1 -> "Analista Sr."; case 2 -> "Analista Pl."; default -> "Consultor RM"; },
                20 + faker.random().nextInt(60)
            ));
        }

        for (int i = 1; i <= projectCount; i++) {
            double sold = 200 + faker.random().nextInt(1000);
            double planned = sold * (0.9 + faker.random().nextDouble() * 0.1);
            double worked = planned * (0.2 + faker.random().nextDouble() * 0.9);
            double progress = Math.min(100, worked / sold * 100 * (0.7 + faker.random().nextDouble() * 0.6));

            String id = "p" + i;
            List<AnalystDto> team = pickRandom(analysts, 2 + faker.random().nextInt(2), faker);

            projects.add(new ProjectDto(
                id,
                String.format("RM-%03d", i),
                faker.company().industry() + " — " + faker.company().name(),
                "c" + ((i % 6) + 1),
                faker.company().name(),
                round(sold), round(planned), round(worked), round(progress),
                LocalDate.now().minusDays(90 + faker.random().nextInt(120)),
                LocalDate.now().plusDays(30 + faker.random().nextInt(240)),
                OffsetDateTime.now().minusMinutes(faker.random().nextInt(180)),
                team
            ));

            entriesByProject.put(id, IntStream.range(0, 8).mapToObj(k -> {
                AnalystDto a = team.get(k % team.size());
                return new TimeEntryDto(
                    "te-" + id + "-" + k,
                    id,
                    a.id(),
                    a.name(),
                    LocalDate.now().minusDays(k + 1),
                    3 + faker.random().nextInt(6),
                    faker.lorem().sentence(6),
                    switch (k % 3) { case 0 -> "ERP"; case 1 -> "Portal"; default -> "Import"; }
                );
            }).toList());
        }
    }

    private static double round(double v) { return Math.round(v * 100.0) / 100.0; }

    private static <T> List<T> pickRandom(List<T> src, int n, Faker faker) {
        List<T> copy = new ArrayList<>(src);
        Collections.shuffle(copy, new Random(faker.random().nextLong()));
        return copy.subList(0, Math.min(n, copy.size()));
    }

    public List<ProjectDto> projects() { return List.copyOf(projects); }
    public Optional<ProjectDto> project(String id) { return projects.stream().filter(p -> p.id().equals(id)).findFirst(); }
    public List<TimeEntryDto> entries(String projectId) { return entriesByProject.getOrDefault(projectId, List.of()); }
    public List<AnalystDto> analysts() { return List.copyOf(analysts); }
}
