using Painel.Application.Ports;
using Painel.Domain;

namespace Painel.Infrastructure.Erp;

public sealed class RefitErpClient(IRmApi api) : IErpClient
{
    public async Task<IReadOnlyList<Project>> GetProjectsAsync(CancellationToken ct = default)
        => (await api.GetProjectsAsync(ct)).Select(RmMapper.ToDomain).ToList();

    public async Task<Project?> GetProjectAsync(string id, CancellationToken ct = default)
        => (await api.GetProjectAsync(id, ct))?.ToDomain();

    public async Task<IReadOnlyList<TimeEntry>> GetTimeEntriesAsync(string projectId, CancellationToken ct = default)
        => (await api.GetTimeEntriesAsync(projectId, ct)).Select(RmMapper.ToDomain).ToList();
}
