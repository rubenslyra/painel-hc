package br.com.painel.rm.domain;

import java.time.OffsetDateTime;

public record RmEventDto(
    String id,
    String type,
    String projectId,
    OffsetDateTime occurredAt,
    String payload,
    boolean delivered
) {}
