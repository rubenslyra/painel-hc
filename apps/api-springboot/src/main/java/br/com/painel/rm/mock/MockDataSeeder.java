package br.com.painel.rm.mock;

import br.com.painel.rm.persistence.AnalystEntity;
import br.com.painel.rm.persistence.AnalystRepository;
import br.com.painel.rm.persistence.ProjectEntity;
import br.com.painel.rm.persistence.ProjectRepository;
import br.com.painel.rm.persistence.TimeEntryEntity;
import br.com.painel.rm.persistence.TimeEntryRepository;
import net.datafaker.Faker;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.stream.IntStream;

@Component
public class MockDataSeeder implements ApplicationRunner {
    private final ProjectRepository projects;
    private final AnalystRepository analysts;
    private final TimeEntryRepository entries;

    @Value("${rm.mock.projects:8}")
    private int projectCount;

    @Value("${rm.mock.analysts:24}")
    private int analystCount;

    @Value("${rm.mock.entries-per-project:18}")
    private int entriesPerProject;

    @Value("${rm.mock.seed:42}")
    private long seed;

    public MockDataSeeder(ProjectRepository projects, AnalystRepository analysts, TimeEntryRepository entries) {
        this.projects = projects;
        this.analysts = analysts;
        this.entries = entries;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (projects.count() > 0) return;

        Faker faker = new Faker(new Locale("pt", "BR"), new Random(seed));
        List<AnalystEntity> seededAnalysts = new ArrayList<>();
        for (int i = 1; i <= analystCount; i++) {
            seededAnalysts.add(new AnalystEntity(
                "a" + i,
                "RM-U" + String.format("%03d", i),
                faker.name().fullName(),
                faker.internet().emailAddress(),
                switch (i % 5) {
                    case 0 -> "Tech Lead";
                    case 1 -> "Analista Sr.";
                    case 2 -> "Analista Pl.";
                    case 3 -> "Consultor RM";
                    default -> "Gerente de Projeto";
                },
                20 + faker.random().nextInt(80)
            ));
        }
        analysts.saveAll(seededAnalysts);

        for (int i = 1; i <= projectCount; i++) {
            double sold = 240 + faker.random().nextInt(1200);
            double planned = sold * (0.85 + faker.random().nextDouble() * 0.2);
            double worked = planned * (0.15 + faker.random().nextDouble() * 0.95);
            double progress = Math.min(100, worked / sold * 100 * (0.65 + faker.random().nextDouble() * 0.7));
            String id = "p" + i;
            var team = new LinkedHashSet<>(pickRandom(seededAnalysts, 3 + faker.random().nextInt(4), faker));
            var project = new ProjectEntity(
                id,
                "RM-" + String.format("%04d", i),
                faker.company().industry() + " - " + faker.company().name(),
                "c" + ((i % 10) + 1),
                faker.company().name(),
                round(sold),
                round(planned),
                round(worked),
                round(progress),
                LocalDate.now().minusDays(30 + faker.random().nextInt(220)),
                LocalDate.now().plusDays(10 + faker.random().nextInt(260)),
                OffsetDateTime.now().minusMinutes(faker.random().nextInt(240)),
                team
            );
            projects.save(project);

            var teamList = new ArrayList<>(team);
            var timeEntries = IntStream.range(0, entriesPerProject).mapToObj(k -> {
                AnalystEntity analyst = teamList.get(k % teamList.size());
                return new TimeEntryEntity(
                    "te-" + id + "-" + k,
                    project,
                    analyst,
                    LocalDate.now().minusDays(k + 1L),
                    2 + faker.random().nextInt(7),
                    workDescription(k),
                    switch (k % 3) { case 0 -> "ERP"; case 1 -> "Portal"; default -> "Import"; }
                );
            }).toList();
            entries.saveAll(timeEntries);
        }
    }


    private static String workDescription(int index) {
        String[] descriptions = {
            "Levantamento de requisitos com área usuária",
            "Parametrização de regras financeiras no ERP",
            "Ajuste de integração de apontamentos",
            "Validação de cenário de faturamento",
            "Correção de divergência em relatório gerencial",
            "Reunião de alinhamento com cliente",
            "Homologação de fluxo de aprovação",
            "Documentação técnica da configuração aplicada",
            "Análise de inconsistência em dados importados",
            "Apoio ao deploy assistido em ambiente de teste"
        };
        return descriptions[index % descriptions.length];
    }
    private static double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private static <T> List<T> pickRandom(List<T> source, int count, Faker faker) {
        List<T> copy = new ArrayList<>(source);
        Collections.shuffle(copy, new Random(faker.random().nextLong()));
        return copy.subList(0, Math.min(count, copy.size()));
    }
}

