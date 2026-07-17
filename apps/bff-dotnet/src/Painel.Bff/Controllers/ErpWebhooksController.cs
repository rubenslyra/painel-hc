using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Painel.Infrastructure.Persistence;

namespace Painel.Bff.Controllers;

[ApiController]
[Route("api/v1/erp-webhooks")]
public sealed class ErpWebhooksController(PainelDbContext db) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("rm-events")]
    public async Task<IActionResult> ReceiveRmEvent([FromBody] RmWebhookEvent input, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(input.Id) || string.IsNullOrWhiteSpace(input.Type))
        {
            return BadRequest(new { error = "Evento RM invalido." });
        }

        var exists = await db.WebhookInbox.AnyAsync(x => x.ExternalEventId == input.Id, ct);
        if (!exists)
        {
            db.WebhookInbox.Add(new WebhookInboxItem
            {
                ExternalEventId = input.Id,
                Source = "RM",
                Type = input.Type,
                ProjectId = input.ProjectId,
                OccurredAt = input.OccurredAt,
                Payload = input.Payload
            });
            await db.SaveChangesAsync(ct);
        }

        return Accepted(new { queued = !exists, eventId = input.Id });
    }

    [Authorize]
    [HttpGet("pending-count")]
    public async Task<WebhookPendingCountDto> PendingCount(CancellationToken ct)
    {
        var count = await db.WebhookInbox.CountAsync(x => x.Status == "Pending", ct);
        var last = await db.WebhookInbox
            .Where(x => x.Status == "Pending")
            .OrderByDescending(x => x.ReceivedAt)
            .Select(x => (DateTimeOffset?)x.ReceivedAt)
            .FirstOrDefaultAsync(ct);
        return new WebhookPendingCountDto(count, last);
    }

    [Authorize]
    [HttpPost("acknowledge")]
    public async Task<WebhookPendingCountDto> Acknowledge(CancellationToken ct)
    {
        var pending = await db.WebhookInbox.Where(x => x.Status == "Pending").ToListAsync(ct);
        foreach (var item in pending)
        {
            item.Status = "Processed";
        }
        await db.SaveChangesAsync(ct);
        return new WebhookPendingCountDto(0, null);
    }

    [Authorize]
    [HttpGet("inbox")]
    public async Task<IReadOnlyList<WebhookInboxDto>> Inbox(CancellationToken ct)
    {
        return await db.WebhookInbox
            .OrderByDescending(x => x.ReceivedAt)
            .Take(50)
            .Select(x => new WebhookInboxDto(x.ExternalEventId, x.Source, x.Type, x.ProjectId, x.Status, x.OccurredAt, x.ReceivedAt))
            .ToListAsync(ct);
    }
}

public sealed record RmWebhookEvent(string Id, string Type, string ProjectId, DateTimeOffset OccurredAt, string Payload, bool Delivered);
public sealed record WebhookPendingCountDto(int Count, DateTimeOffset? LastReceivedAt);
public sealed record WebhookInboxDto(string EventId, string Source, string Type, string ProjectId, string Status, DateTimeOffset OccurredAt, DateTimeOffset ReceivedAt);

