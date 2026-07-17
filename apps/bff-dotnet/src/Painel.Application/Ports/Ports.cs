using Painel.Domain;

namespace Painel.Application.Ports;

/// <summary>Port (interface) para acessar o ERP externo — implementado pelo adapter Refit.</summary>
public interface IErpClient
{
    Task<IReadOnlyList<Project>> GetProjectsAsync(CancellationToken ct = default);
    Task<Project?> GetProjectAsync(string id, CancellationToken ct = default);
    Task<IReadOnlyList<TimeEntry>> GetTimeEntriesAsync(string projectId, CancellationToken ct = default);
}

public interface IThresholdRepository
{
    Task<ThresholdConfig> GetAsync(CancellationToken ct = default);
    Task SaveAsync(ThresholdConfig config, CancellationToken ct = default);
}

public interface IAuditLog
{
    Task RecordAsync(string userId, string action, string entity, string entityId, object? payload = null, CancellationToken ct = default);
}

public interface IProjectRepository
{
    Task<IReadOnlyList<Project>> GetAllAsync(CancellationToken ct = default);
    Task<Project?> GetByIdAsync(string id, CancellationToken ct = default);
    Task SaveAsync(IReadOnlyList<Project> projects, CancellationToken ct = default);
}
