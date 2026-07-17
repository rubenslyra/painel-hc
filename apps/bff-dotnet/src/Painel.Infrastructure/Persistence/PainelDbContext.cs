using Microsoft.EntityFrameworkCore;
using Painel.Application.Ports;
using Painel.Domain;

namespace Painel.Infrastructure.Persistence;

public sealed class PainelDbContext(DbContextOptions<PainelDbContext> options) : DbContext(options)
{
    public DbSet<ThresholdEntity> Thresholds => Set<ThresholdEntity>();
    public DbSet<AuditEvent> AuditEvents => Set<AuditEvent>();
    public DbSet<WebhookInboxItem> WebhookInbox => Set<WebhookInboxItem>();
    public DbSet<ProjectEntity> Projects => Set<ProjectEntity>();
    public DbSet<AnalystEntity> Analysts => Set<AnalystEntity>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<ThresholdEntity>().HasKey(x => x.Id);

        b.Entity<AuditEvent>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.At);
        });

        b.Entity<WebhookInboxItem>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.ExternalEventId).IsUnique();
        });

        b.Entity<ProjectEntity>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.ExternalId);
            e.HasMany(x => x.Analysts).WithOne(x => x.Project).HasForeignKey(x => x.ProjectId);
        });

        b.Entity<AnalystEntity>(e =>
        {
            e.HasKey(x => new { x.Id, x.ProjectId });
        });
    }
}

public sealed class ProjectEntity
{
    public string Id { get; set; } = "";
    public string ExternalId { get; set; } = "";
    public string Name { get; set; } = "";
    public string ClientId { get; set; } = "";
    public string ClientName { get; set; } = "";
    public decimal SoldHours { get; set; }
    public decimal PlannedHours { get; set; }
    public decimal WorkedHours { get; set; }
    public decimal PhysicalProgressPercentage { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly ExpectedEndDate { get; set; }
    public DateTimeOffset LastSynchronizedAt { get; set; }
    public string LifecycleStatus { get; set; } = "InProgress";
    public ICollection<AnalystEntity> Analysts { get; set; } = [];
}

public sealed class AnalystEntity
{
    public string Id { get; set; } = "";
    public string ExternalId { get; set; } = "";
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Role { get; set; } = "";
    public int AllocationPercentage { get; set; }
    public string ProjectId { get; set; } = "";
    public ProjectEntity Project { get; set; } = null!;
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
