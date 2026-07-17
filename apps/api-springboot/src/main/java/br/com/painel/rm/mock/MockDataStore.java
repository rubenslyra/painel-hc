package br.com.painel.rm.mock;

import br.com.painel.rm.domain.AnalystDto;
import br.com.painel.rm.domain.ProjectDto;
import br.com.painel.rm.domain.TimeEntryDto;
import br.com.painel.rm.persistence.*;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/** Fonte de dados do ERP mock. Os dados vivem no banco local do Spring Boot. */
@Component
public class MockDataStore {
    private final ProjectRepository projects;
    private final TimeEntryRepository entries;
    private final AnalystRepository analysts;

    public MockDataStore(ProjectRepository projects, TimeEntryRepository entries, AnalystRepository analysts) {
        this.projects = projects;
        this.entries = entries;
        this.analysts = analysts;
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> projects() {
        return projects.findAll().stream().map(MockDataStore::toDto).toList();
    }

    @Transactional(readOnly = true)
    public Optional<ProjectDto> project(String id) {
        return projects.findById(id).map(MockDataStore::toDto);
    }

    @Transactional(readOnly = true)
    public List<TimeEntryDto> entries(String projectId) {
        return entries.findByProjectIdOrderByWorkDateDesc(projectId).stream().map(MockDataStore::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<AnalystDto> analysts() {
        return analysts.findAll().stream().map(MockDataStore::toDto).toList();
    }

    public static ProjectDto toDto(ProjectEntity p) {
        return new ProjectDto(
            p.getId(), p.getExternalId(), p.getName(), p.getClientId(), p.getClientName(),
            p.getSoldHours(), p.getPlannedHours(), p.getWorkedHours(), p.getPhysicalProgressPercentage(),
            p.getStartDate(), p.getExpectedEndDate(), p.getLastSynchronizedAt(),
            p.getAnalysts().stream().map(MockDataStore::toDto).toList()
        );
    }

    public static AnalystDto toDto(AnalystEntity a) {
        return new AnalystDto(a.getId(), a.getExternalId(), a.getName(), a.getEmail(), a.getRole(), a.getAllocationPercentage());
    }

    public static TimeEntryDto toDto(TimeEntryEntity e) {
        var analyst = e.getAnalyst();
        return new TimeEntryDto(
            e.getId(), e.getProject().getId(), analyst.getId(), analyst.getName(),
            e.getWorkDate(), e.getHours(), e.getDescription(), e.getSource()
        );
    }
}
