using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Painel.Application.Ports;

namespace Painel.Infrastructure.Sync;

public sealed class ProjectSyncService : IHostedService
{
    private readonly IServiceProvider _services;
    private readonly ILogger<ProjectSyncService> _log;

    private static readonly int[] RetryDelaysMs = [0, 5_000, 15_000, 30_000, 60_000];

    public ProjectSyncService(IServiceProvider services, ILogger<ProjectSyncService> log)
    {
        _services = services;
        _log = log;
    }

    public async Task StartAsync(CancellationToken ct)
    {
        for (var attempt = 0; attempt < RetryDelaysMs.Length; attempt++)
        {
            if (attempt > 0)
                await Task.Delay(RetryDelaysMs[attempt], ct);

            _log.LogInformation("Sincronizacao de projetos — tentativa {Attempt}/{Max}", attempt + 1, RetryDelaysMs.Length);

            try
            {
                using var scope = _services.CreateScope();
                var erp = scope.ServiceProvider.GetRequiredService<IErpClient>();
                var repo = scope.ServiceProvider.GetRequiredService<IProjectRepository>();

                var projects = await erp.GetProjectsAsync(ct);
                _log.LogInformation("ERP retornou {Count} projetos", projects.Count);

                await repo.SaveAsync(projects, ct);
                _log.LogInformation("Sincronizacao concluida — {Count} projetos persistidos", projects.Count);
                return;
            }
            catch (Exception ex) when (attempt < RetryDelaysMs.Length - 1)
            {
                _log.LogWarning(ex, "Falha na tentativa {Attempt} — nova tentativa em {Delay}ms",
                    attempt + 1, RetryDelaysMs[attempt + 1]);
            }
            catch (Exception ex)
            {
                _log.LogError(ex, "Falha na sincronizacao apos {Max} tentativas", RetryDelaysMs.Length);
            }
        }
    }

    public Task StopAsync(CancellationToken ct) => Task.CompletedTask;
}
