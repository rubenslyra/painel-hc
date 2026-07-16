using Painel.Domain;
using Refit;

namespace Painel.Infrastructure.Erp;

/// <summary>Interface Refit — geração automática do cliente HTTP tipado.</summary>
public interface IRmApi
{
    [Get("/rm/projects")] Task<List<RmProject>> GetProjectsAsync(CancellationToken ct);
    [Get("/rm/projects/{id}")] Task<RmProject?> GetProjectAsync(string id, CancellationToken ct);
    [Get("/rm/projects/{id}/time-entries")] Task<List<RmTimeEntry>> GetTimeEntriesAsync(string id, CancellationToken ct);
}

public sealed record RmProject(
    string Id, string ExternalId, string Name, string ClientId, string ClientName,
    double SoldHours, double PlannedHours, double WorkedHours, double PhysicalProgressPercentage,
    DateOnly StartDate, DateOnly ExpectedEndDate, DateTimeOffset LastSynchronizedAt,
    List<RmAnalyst> Analysts);

public sealed record RmAnalyst(string Id, string ExternalId, string Name, string Email, string Role, int AllocationPercentage);

public sealed record RmTimeEntry(string Id, string ProjectId, string AnalystId, string AnalystName,
    DateOnly WorkDate, double Hours, string Description, string Source);

/// <summary>Camada anticorrupção: converte DTOs do ERP para o domínio interno.</summary>
public static class RmMapper
{
    public static Project ToDomain(this RmProject r) => new(
        r.Id, r.ExternalId, r.Name, r.ClientId, r.ClientName,
        Convert.ToDecimal(r.SoldHours), Convert.ToDecimal(r.PlannedHours), Convert.ToDecimal(r.WorkedHours), Convert.ToDecimal(r.PhysicalProgressPercentage),
        r.StartDate, r.ExpectedEndDate, r.LastSynchronizedAt,
        r.Analysts.Select(a => new Analyst(a.Id, a.ExternalId, a.Name, a.Email, a.Role, a.AllocationPercentage)).ToList());

    public static TimeEntry ToDomain(this RmTimeEntry r) => new(
        r.Id, r.ProjectId, r.AnalystId, r.AnalystName, r.WorkDate, Convert.ToDecimal(r.Hours), r.Description, r.Source);
}
