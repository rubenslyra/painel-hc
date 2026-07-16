using Painel.Domain;

namespace Painel.Application.Contracts;

/// <summary>DTOs canonicos servidos ao front Angular.</summary>
public sealed record ProjectSummaryDto(
    string Id,
    string ExternalId,
    string Name,
    string ClientName,
    decimal SoldHours,
    decimal PlannedHours,
    decimal WorkedHours,
    decimal PhysicalProgressPercentage,
    DateOnly ExpectedEndDate,
    DateTimeOffset LastSynchronizedAt,
    ProjectIndicatorsDto Indicators);

public sealed record ProjectDetailDto(
    ProjectSummaryDto Summary,
    IReadOnlyList<AnalystDto> Analysts,
    IReadOnlyList<TimeEntryDto> RecentEntries);

public sealed record ProjectIndicatorsDto(
    decimal WorkedHours,
    decimal ContractBalanceHours,
    decimal PlannedBalanceHours,
    decimal? ConsumptionPercentage,
    decimal PhysicalProgressPercentage,
    decimal? ProgressGapPercentagePoints,
    bool IsDelayed,
    string Status,
    IReadOnlyList<string> Reasons);

public sealed record AnalystDto(string Id, string Name, string Email, string Role, int AllocationPercentage);
public sealed record TimeEntryDto(string Id, string AnalystName, DateOnly WorkDate, decimal Hours, string Description, string Source);

public sealed record LoginRequest(string Username, string Password);
public sealed record AuthTokens(string AccessToken, string RefreshToken, DateTimeOffset ExpiresAt);
public sealed record RefreshRequest(string RefreshToken);

public sealed record SyncStatusDto(string Phase, int Progress, string Step, DateTimeOffset? StartedAt, DateTimeOffset? FinishedAt, int Imported, int Updated, int Failed);
