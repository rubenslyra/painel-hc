using FluentAssertions;
using Painel.Domain;
using Xunit;

namespace Painel.Tests;

public class IndicatorsTests
{
    private static readonly DateOnly ReferenceDate = new(2026, 7, 16);
    private static readonly ProjectHealthCalculator Calculator = new();

    private static Project Make(
        decimal sold,
        decimal planned,
        decimal worked,
        decimal progress,
        DateOnly? expectedEnd = null,
        ProjectLifecycleStatus lifecycleStatus = ProjectLifecycleStatus.InProgress)
        => new(
            "1",
            "PRJ-DEMO-0001",
            "Projeto Demo",
            "1",
            "Cliente Demo",
            sold,
            planned,
            worked,
            progress,
            new DateOnly(2026, 1, 15),
            expectedEnd ?? ReferenceDate.AddDays(60),
            new DateTimeOffset(2026, 7, 13, 14, 30, 0, TimeSpan.Zero),
            [],
            lifecycleStatus);

    [Fact]
    public void Healthy_when_project_has_no_attention_critical_or_inconsistent_condition()
    {
        var result = Calculator.Calculate(Make(500m, 480m, 200m, 45m), new(), ReferenceDate);

        result.Status.Should().Be(ProjectHealthStatus.Healthy);
        result.Reasons.Should().BeEmpty();
    }

    [Fact]
    public void Attention_when_consumption_reaches_threshold()
    {
        var result = Calculator.Calculate(Make(100m, 120m, 80m, 75m), new(), ReferenceDate);

        result.Status.Should().Be(ProjectHealthStatus.Attention);
        result.Reasons.Should().Contain(ProjectHealthReasons.AttentionConsumption);
    }

    [Fact]
    public void Attention_when_progress_gap_is_between_attention_and_critical_thresholds()
    {
        var result = Calculator.Calculate(Make(100m, 120m, 60m, 45m), new(), ReferenceDate);

        result.Status.Should().Be(ProjectHealthStatus.Attention);
        result.ProgressGapPercentagePoints.Should().Be(15m);
        result.Reasons.Should().Contain(ProjectHealthReasons.AttentionProgressGap);
    }

    [Fact]
    public void Attention_when_planned_balance_is_negative_but_contract_balance_is_not()
    {
        var result = Calculator.Calculate(Make(100m, 50m, 60m, 55m), new(), ReferenceDate);

        result.Status.Should().Be(ProjectHealthStatus.Attention);
        result.Reasons.Should().Contain(ProjectHealthReasons.PlannedBalanceNegative);
    }

    [Fact]
    public void Critical_when_contract_balance_is_negative()
    {
        var result = Calculator.Calculate(Make(100m, 100m, 120m, 90m), new(), ReferenceDate);

        result.Status.Should().Be(ProjectHealthStatus.Critical);
        result.ContractBalanceHours.Should().Be(-20m);
        result.Reasons.Should().Contain(ProjectHealthReasons.ContractBalanceNegative);
    }

    [Fact]
    public void Critical_when_progress_gap_reaches_critical_threshold()
    {
        var result = Calculator.Calculate(Make(100m, 100m, 80m, 50m), new(), ReferenceDate);

        result.Status.Should().Be(ProjectHealthStatus.Critical);
        result.ProgressGapPercentagePoints.Should().Be(30m);
        result.Reasons.Should().Contain(ProjectHealthReasons.CriticalProgressGap);
    }

    [Fact]
    public void Critical_when_project_is_delayed_and_not_completed()
    {
        var result = Calculator.Calculate(Make(500m, 500m, 200m, 90m, ReferenceDate.AddDays(-1)), new(), ReferenceDate);

        result.Status.Should().Be(ProjectHealthStatus.Critical);
        result.IsDelayed.Should().BeTrue();
        result.Reasons.Should().Contain(ProjectHealthReasons.ProjectDelayed);
    }

    [Fact]
    public void Inconsistent_has_priority_over_critical_and_attention()
    {
        var result = Calculator.Calculate(Make(0m, 0m, 10m, 0m, ReferenceDate.AddDays(-1)), new(), ReferenceDate);

        result.Status.Should().Be(ProjectHealthStatus.Inconsistent);
        result.ConsumptionPercentage.Should().BeNull();
        result.ProgressGapPercentagePoints.Should().BeNull();
        result.Reasons.Should().Contain(ProjectHealthReasons.SoldHoursZeroWithWorkedHours);
    }

    [Fact]
    public void Completed_project_is_not_delayed_even_when_expected_end_date_is_past()
    {
        var result = Calculator.Calculate(
            Make(500m, 500m, 200m, 90m, ReferenceDate.AddDays(-1), ProjectLifecycleStatus.Completed),
            new(),
            ReferenceDate);

        result.IsDelayed.Should().BeFalse();
        result.Reasons.Should().NotContain(ProjectHealthReasons.ProjectDelayed);
    }

    [Fact]
    public void Percentages_are_rounded_to_two_decimal_places()
    {
        var result = Calculator.Calculate(Make(3m, 3m, 1m, 10m), new(), ReferenceDate);

        result.ConsumptionPercentage.Should().Be(33.33m);
        result.ProgressGapPercentagePoints.Should().Be(23.33m);
    }
}
