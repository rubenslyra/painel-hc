using Microsoft.AspNetCore.Mvc;
using Painel.Application.Contracts;
using Painel.Application.Ports;
using Painel.Domain;

namespace Painel.Bff.Controllers;

[ApiController]
[Route("api/v1/thresholds")]
public sealed class ThresholdsController(IThresholdRepository repo, IAuditLog audit) : ControllerBase
{
    [HttpGet] public async Task<ThresholdConfig> Get(CancellationToken ct) => await repo.GetAsync(ct);

    [HttpPut]
    public async Task<IActionResult> Save([FromBody] ThresholdConfig config, CancellationToken ct)
    {
        await repo.SaveAsync(config, ct);
        await audit.RecordAsync(User.Identity?.Name ?? "anon", "update", "thresholds", "singleton", config, ct);
        return NoContent();
    }
}
