using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Painel.Application.UseCases;

namespace Painel.Bff.Controllers;

[ApiController]
[Route("api/v1/projects")]
[Authorize]
public sealed class ProjectsController(ProjectQueries queries) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct) => Ok(await queries.ListAsync(ct));

    [HttpGet("{id}")]
    public async Task<IActionResult> Detail(string id, CancellationToken ct)
    {
        var r = await queries.DetailAsync(id, ct);
        return r is null ? NotFound() : Ok(r);
    }
}
