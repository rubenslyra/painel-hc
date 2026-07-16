namespace Painel.Domain;

public static class ProjectHealthReasons
{
    public const string SoldHoursZeroWithWorkedHours = "sold-hours-zero-with-worked-hours";
    public const string ContractBalanceNegative = "contract-balance-negative";
    public const string CriticalProgressGap = "critical-progress-gap";
    public const string ProjectDelayed = "project-delayed";
    public const string AttentionConsumption = "attention-consumption";
    public const string AttentionProgressGap = "attention-progress-gap";
    public const string PlannedBalanceNegative = "planned-balance-negative";
    public const string ExpectedEndDateNear = "expected-end-date-near";
}

public sealed class ProjectHealthCalculator
{
    public ProjectHealthResult Calculate(Project project, ThresholdConfig thresholds, DateOnly referenceDate)
    {
        var workedHours = project.WorkedHours;
        var contractBalanceHours = project.SoldHours - workedHours;
        var plannedBalanceHours = project.PlannedHours - workedHours;
        var reasons = new List<string>();

        decimal? consumptionPercentage = null;
        decimal? progressGapPercentagePoints = null;

        if (project.SoldHours > 0)
        {
            consumptionPercentage = Round(workedHours / project.SoldHours * 100m);
            progressGapPercentagePoints = Round(consumptionPercentage.Value - project.PhysicalProgressPercentage);
        }

        var isDelayed = project.ExpectedEndDate < referenceDate
            && project.LifecycleStatus != ProjectLifecycleStatus.Completed
            && project.PhysicalProgressPercentage < 100m;

        if (project.SoldHours == 0m && workedHours > 0m)
        {
            reasons.Add(ProjectHealthReasons.SoldHoursZeroWithWorkedHours);
        }

        if (reasons.Count > 0)
        {
            return Result(ProjectHealthStatus.Inconsistent);
        }

        if (contractBalanceHours < 0m)
        {
            reasons.Add(ProjectHealthReasons.ContractBalanceNegative);
        }

        if (progressGapPercentagePoints >= thresholds.GapCriticalMin)
        {
            reasons.Add(ProjectHealthReasons.CriticalProgressGap);
        }

        if (isDelayed)
        {
            reasons.Add(ProjectHealthReasons.ProjectDelayed);
        }

        if (reasons.Count > 0)
        {
            return Result(ProjectHealthStatus.Critical);
        }

        if (consumptionPercentage >= thresholds.ConsumptionAttention)
        {
            reasons.Add(ProjectHealthReasons.AttentionConsumption);
        }

        if (progressGapPercentagePoints >= thresholds.GapAttentionMin
            && progressGapPercentagePoints < thresholds.GapCriticalMin)
        {
            reasons.Add(ProjectHealthReasons.AttentionProgressGap);
        }

        if (plannedBalanceHours < 0m && contractBalanceHours >= 0m)
        {
            reasons.Add(ProjectHealthReasons.PlannedBalanceNegative);
        }

        var daysUntilExpectedEnd = project.ExpectedEndDate.DayNumber - referenceDate.DayNumber;
        if (daysUntilExpectedEnd >= 0 && daysUntilExpectedEnd <= thresholds.DaysUntilAttention
            && project.LifecycleStatus != ProjectLifecycleStatus.Completed)
        {
            reasons.Add(ProjectHealthReasons.ExpectedEndDateNear);
        }

        return reasons.Count > 0
            ? Result(ProjectHealthStatus.Attention)
            : Result(ProjectHealthStatus.Healthy);

        ProjectHealthResult Result(ProjectHealthStatus status) => new(
            workedHours,
            contractBalanceHours,
            plannedBalanceHours,
            consumptionPercentage,
            project.PhysicalProgressPercentage,
            progressGapPercentagePoints,
            isDelayed,
            status,
            reasons);
    }

    private static decimal Round(decimal value) => Math.Round(value, 2, MidpointRounding.AwayFromZero);
}

public static class Indicators
{
    public static ProjectHealthResult Calculate(Project project, ThresholdConfig thresholds, DateOnly referenceDate)
        => new ProjectHealthCalculator().Calculate(project, thresholds, referenceDate);
}
