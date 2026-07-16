package br.com.painel.rm.domain;

public record AnalystDto(
    String id,
    String externalId,
    String name,
    String email,
    String role,
    int allocationPercentage
) {}
