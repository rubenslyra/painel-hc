package br.com.painel.rm.persistence;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "rm_projects")
public class ProjectEntity {
    @Id
    private String id;
    private String externalId;
    private String name;
    private String clientId;
    private String clientName;
    private double soldHours;
    private double plannedHours;
    private double workedHours;
    private double physicalProgressPercentage;
    private LocalDate startDate;
    private LocalDate expectedEndDate;
    private OffsetDateTime lastSynchronizedAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "rm_project_analysts",
        joinColumns = @JoinColumn(name = "project_id"),
        inverseJoinColumns = @JoinColumn(name = "analyst_id"))
    private Set<AnalystEntity> analysts = new LinkedHashSet<>();

    protected ProjectEntity() {}

    public ProjectEntity(String id, String externalId, String name, String clientId, String clientName,
                         double soldHours, double plannedHours, double workedHours, double physicalProgressPercentage,
                         LocalDate startDate, LocalDate expectedEndDate, OffsetDateTime lastSynchronizedAt,
                         Set<AnalystEntity> analysts) {
        this.id = id;
        this.externalId = externalId;
        this.name = name;
        this.clientId = clientId;
        this.clientName = clientName;
        this.soldHours = soldHours;
        this.plannedHours = plannedHours;
        this.workedHours = workedHours;
        this.physicalProgressPercentage = physicalProgressPercentage;
        this.startDate = startDate;
        this.expectedEndDate = expectedEndDate;
        this.lastSynchronizedAt = lastSynchronizedAt;
        this.analysts = analysts;
    }

    public String getId() { return id; }
    public String getExternalId() { return externalId; }
    public String getName() { return name; }
    public String getClientId() { return clientId; }
    public String getClientName() { return clientName; }
    public double getSoldHours() { return soldHours; }
    public double getPlannedHours() { return plannedHours; }
    public double getWorkedHours() { return workedHours; }
    public double getPhysicalProgressPercentage() { return physicalProgressPercentage; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getExpectedEndDate() { return expectedEndDate; }
    public OffsetDateTime getLastSynchronizedAt() { return lastSynchronizedAt; }
    public Set<AnalystEntity> getAnalysts() { return analysts; }

    public void addWorkedHours(double hours) {
        this.workedHours = Math.round((this.workedHours + hours) * 100.0) / 100.0;
        this.physicalProgressPercentage = Math.min(100.0, Math.round((this.physicalProgressPercentage + (hours / Math.max(this.soldHours, 1.0) * 100.0)) * 100.0) / 100.0);
        this.lastSynchronizedAt = OffsetDateTime.now();
    }
}
