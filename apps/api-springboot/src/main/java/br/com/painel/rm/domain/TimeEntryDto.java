package br.com.painel.rm.domain;

import java.time.LocalDate;

public record TimeEntryDto(
    String id,
    String projectId,
    String analystId,
    String analystName,
    LocalDate workDate,
    double hours,
    String description,
    String source
) {}
