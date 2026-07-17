using Painel.Application.Contracts;
using Painel.Application.Ports;
using Painel.Domain;

namespace Painel.Application.UseCases;

/// <summary>Casos de uso relacionados a projetos. Lê do banco local (sincronizado do ERP).</summary>
public sealed class ProjectQueries(IProjectRepository projectsRepo, IErpClient erp, IThresholdRepository thresholds)
{
    public async Task<IReadOnlyList<ProjectSummaryDto>> ListAsync(CancellationToken ct = default)
    {
        var t = await thresholds.GetAsync(ct);
        var projects = await projectsRepo.GetAllAsync(ct);
        var referenceDate = DateOnly.FromDateTime(DateTime.UtcNow);
        return projects.Select(p => Map(p, t, referenceDate)).ToList();
    }

    public async Task<ProjectDetailDto?> DetailAsync(string id, CancellationToken ct = default)
    {
        var p = await projectsRepo.GetByIdAsync(id, ct);
        if (p is null) return null;

        var t = await thresholds.GetAsync(ct);
        var entries = await erp.GetTimeEntriesAsync(id, ct);
        var referenceDate = DateOnly.FromDateTime(DateTime.UtcNow);

        return new ProjectDetailDto(
            Map(p, t, referenceDate),
            p.Analysts.Select(a => new AnalystDto(a.Id, a.Name, a.Email, a.Role, a.AllocationPercentage)).ToList(),
            entries.Select(e => new TimeEntryDto(e.Id, e.AnalystName, e.WorkDate, e.Hours, e.Description, e.Source)).ToList());
    }

    private static ProjectSummaryDto Map(Project p, ThresholdConfig t, DateOnly referenceDate)
    {
        var health = Indicators.Calculate(p, t, referenceDate);
        return new ProjectSummaryDto(
            p.Id, p.ExternalId, p.Name, p.ClientName,
            p.SoldHours, p.PlannedHours, p.WorkedHours, p.PhysicalProgressPercentage,
            p.ExpectedEndDate, p.LastSynchronizedAt,
            new ProjectIndicatorsDto(
                health.WorkedHours,
                health.ContractBalanceHours,
                health.PlannedBalanceHours,
                health.ConsumptionPercentage,
                health.PhysicalProgressPercentage,
                health.ProgressGapPercentagePoints,
                health.IsDelayed,
                health.Status.ToString(),
                health.Reasons));
    }
}
