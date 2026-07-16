package br.com.painel.rm.domain;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record ProjectDto(
    String id,
    String externalId,
    String name,
    String clientId,
    String clientName,
    double soldHours,
    double plannedHours,
    double workedHours,
    double physicalProgressPercentage,
    LocalDate startDate,
    LocalDate expectedEndDate,
    OffsetDateTime lastSynchronizedAt,
    List<AnalystDto> analysts
) {}
