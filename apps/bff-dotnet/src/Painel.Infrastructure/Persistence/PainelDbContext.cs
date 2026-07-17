using Microsoft.EntityFrameworkCore;
using Painel.Application.Ports;
using Painel.Domain;

namespace Painel.Infrastructure.Persistence;

public sealed class PainelDbContext(DbContextOptions<PainelDbContext> options) : DbContext(options)
{
    public DbSet<ThresholdEntity> Thresholds => Set<ThresholdEntity>();
    public DbSet<AuditEvent> AuditEvents => Set<AuditEvent>();
    public DbSet<WebhookInboxItem> WebhookInbox => Set<WebhookInboxItem>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<ThresholdEntity>().HasKey(x => x.Id);
        b.Entity<AuditEvent>().HasKey(x => x.Id);
        b.Entity<WebhookInboxItem>().HasKey(x => x.Id);
        b.Entity<WebhookInboxItem>().HasIndex(x => x.ExternalEventId).IsUnique();
    }
}

public sealed class ThresholdEntity
{
    public int Id { get; set; } = 1;
    public decimal ConsumptionAttention { get; set; } = 80m;
    public decimal GapAttentionMin { get; set; } = 10m;
    public decimal GapCriticalMin { get; set; } = 25m;
    public int DaysUntilAttention { get; set; } = 15;
}

public sealed class AuditEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTimeOffset At { get; set; } = DateTimeOffset.UtcNow;
    public string UserId { get; set; } = "";
    public string Action { get; set; } = "";
    public string Entity { get; set; } = "";
    public string EntityId { get; set; } = "";
    public string? Payload { get; set; }
}

public sealed class WebhookInboxItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ExternalEventId { get; set; } = "";
    public string Source { get; set; } = "RM";
    public string Type { get; set; } = "";
    public string ProjectId { get; set; } = "";
    public DateTimeOffset OccurredAt { get; set; }
    public DateTimeOffset ReceivedAt { get; set; } = DateTimeOffset.UtcNow;
    public string Status { get; set; } = "Pending";
    public string Payload { get; set; } = "";
}

public sealed class EfThresholdRepository(PainelDbContext db) : IThresholdRepository
{
    public async Task<ThresholdConfig> GetAsync(CancellationToken ct = default)
    {
        var e = await db.Thresholds.FirstOrDefaultAsync(ct);
        if (e is null) { e = new ThresholdEntity(); db.Thresholds.Add(e); await db.SaveChangesAsync(ct); }
        return new ThresholdConfig(e.ConsumptionAttention, e.GapAttentionMin, e.GapCriticalMin, e.DaysUntilAttention);
    }

    public async Task SaveAsync(ThresholdConfig config, CancellationToken ct = default)
    {
        var e = await db.Thresholds.FirstOrDefaultAsync(ct) ?? new ThresholdEntity();
        e.ConsumptionAttention = config.ConsumptionAttention;
        e.GapAttentionMin = config.GapAttentionMin;
        e.GapCriticalMin = config.GapCriticalMin;
        e.DaysUntilAttention = config.DaysUntilAttention;
        if (db.Entry(e).State == EntityState.Detached) db.Thresholds.Add(e);
        await db.SaveChangesAsync(ct);
    }
}
