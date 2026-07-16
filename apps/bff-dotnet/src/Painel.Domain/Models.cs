namespace Painel.Domain;

public enum ProjectLifecycleStatus { Planned, InProgress, Completed, Cancelled }
public enum ProjectHealthStatus { Healthy, Attention, Critical, Inconsistent }

public sealed record Analyst(string Id, string ExternalId, string Name, string Email, string Role, int AllocationPercentage);

public sealed record TimeEntry(string Id, string ProjectId, string AnalystId, string AnalystName, DateOnly WorkDate, decimal Hours, string Description, string Source);

public sealed record Project(
    string Id,
    string ExternalId,
    string Name,
    string ClientId,
    string ClientName,
    decimal SoldHours,
    decimal PlannedHours,
    decimal WorkedHours,
    decimal PhysicalProgressPercentage,
    DateOnly StartDate,
    DateOnly ExpectedEndDate,
    DateTimeOffset LastSynchronizedAt,
    IReadOnlyList<Analyst> Analysts,
    ProjectLifecycleStatus LifecycleStatus = ProjectLifecycleStatus.InProgress);

public sealed record ThresholdConfig(
    decimal ConsumptionAttention = 80m,
    decimal GapAttentionMin = 10m,
    decimal GapCriticalMin = 25m,
    int DaysUntilAttention = 15);

public sealed record ProjectHealthResult(
    decimal WorkedHours,
    decimal ContractBalanceHours,
    decimal PlannedBalanceHours,
    decimal? ConsumptionPercentage,
    decimal PhysicalProgressPercentage,
    decimal? ProgressGapPercentagePoints,
    bool IsDelayed,
    ProjectHealthStatus Status,
    IReadOnlyList<string> Reasons);
