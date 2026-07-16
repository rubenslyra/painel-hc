using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Painel.Application.Ports;
using Painel.Infrastructure.Persistence;

namespace Painel.Infrastructure.Audit;

public sealed class DbAuditLog(PainelDbContext db) : IAuditLog
{
    public async Task RecordAsync(string userId, string action, string entity, string entityId, object? payload = null, CancellationToken ct = default)
    {
        db.AuditEvents.Add(new AuditEvent
        {
            UserId = userId,
            Action = action,
            Entity = entity,
            EntityId = entityId,
            Payload = payload is null ? null : JsonSerializer.Serialize(payload)
        });
        await db.SaveChangesAsync(ct);
    }
}
