package br.com.painel.rm.persistence;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "rm_time_entries")
public class TimeEntryEntity {
    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private ProjectEntity project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analyst_id")
    private AnalystEntity analyst;

    private LocalDate workDate;
    private double hours;
    private String description;
    private String source;

    protected TimeEntryEntity() {}

    public TimeEntryEntity(String id, ProjectEntity project, AnalystEntity analyst, LocalDate workDate,
                           double hours, String description, String source) {
        this.id = id;
        this.project = project;
        this.analyst = analyst;
        this.workDate = workDate;
        this.hours = hours;
        this.description = description;
        this.source = source;
    }

    public String getId() { return id; }
    public ProjectEntity getProject() { return project; }
    public AnalystEntity getAnalyst() { return analyst; }
    public LocalDate getWorkDate() { return workDate; }
    public double getHours() { return hours; }
    public String getDescription() { return description; }
    public String getSource() { return source; }
}
