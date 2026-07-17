using Microsoft.EntityFrameworkCore;
using Painel.Application.Ports;
using Painel.Domain;

namespace Painel.Infrastructure.Persistence;

public sealed class EfProjectRepository(PainelDbContext db) : IProjectRepository
{
    public async Task<IReadOnlyList<Project>> GetAllAsync(CancellationToken ct = default)
    {
        return await db.Projects
            .Include(p => p.Analysts)
            .Select(p => Map(p))
            .ToListAsync(ct);
    }

    public async Task<Project?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var p = await db.Projects
            .Include(p => p.Analysts)
            .FirstOrDefaultAsync(p => p.Id == id, ct);
        return p is null ? null : Map(p);
    }

    public async Task SaveAsync(IReadOnlyList<Project> projects, CancellationToken ct = default)
    {
        var existingIds = await db.Projects.Select(p => p.Id).ToListAsync(ct);
        var incoming = projects.Select(p => ToEntity(p)).ToList();

        var toAdd = incoming.Where(p => !existingIds.Contains(p.Id)).ToList();
        var toUpdate = incoming.Where(p => existingIds.Contains(p.Id)).ToList();

        foreach (var entity in toUpdate)
        {
            var existing = await db.Projects
                .Include(p => p.Analysts)
                .FirstAsync(p => p.Id == entity.Id, ct);
            db.Entry(existing).CurrentValues.SetValues(entity);
            foreach (var a in entity.Analysts)
            {
                var existingAnalyst = existing.Analysts.FirstOrDefault(x => x.Id == a.Id);
                if (existingAnalyst is null)
                    existing.Analysts.Add(a);
                else
                    db.Entry(existingAnalyst).CurrentValues.SetValues(a);
            }
            var deleted = existing.Analysts
                .Where(x => entity.Analysts.All(a => a.Id != x.Id))
                .ToList();
            foreach (var a in deleted)
                db.Analysts.Remove(a);
        }

        db.Projects.AddRange(toAdd);
        await db.SaveChangesAsync(ct);
    }

    private static ProjectEntity ToEntity(Project p) => new()
    {
        Id = p.Id,
        ExternalId = p.ExternalId,
        Name = p.Name,
        ClientId = p.ClientId,
        ClientName = p.ClientName,
        SoldHours = p.SoldHours,
        PlannedHours = p.PlannedHours,
        WorkedHours = p.WorkedHours,
        PhysicalProgressPercentage = p.PhysicalProgressPercentage,
        StartDate = p.StartDate,
        ExpectedEndDate = p.ExpectedEndDate,
        LastSynchronizedAt = p.LastSynchronizedAt,
        LifecycleStatus = p.LifecycleStatus.ToString(),
        Analysts = p.Analysts.Select(a => new AnalystEntity
        {
            Id = a.Id,
            ExternalId = a.ExternalId,
            Name = a.Name,
            Email = a.Email,
            Role = a.Role,
            AllocationPercentage = a.AllocationPercentage,
            ProjectId = p.Id,
        }).ToList()
    };

    private static Project Map(ProjectEntity p) => new(
        p.Id, p.ExternalId, p.Name, p.ClientId, p.ClientName,
        p.SoldHours, p.PlannedHours, p.WorkedHours, p.PhysicalProgressPercentage,
        p.StartDate, p.ExpectedEndDate, p.LastSynchronizedAt,
        p.Analysts.Select(a => new Analyst(a.Id, a.ExternalId, a.Name, a.Email, a.Role, a.AllocationPercentage)).ToList(),
        Enum.TryParse<ProjectLifecycleStatus>(p.LifecycleStatus, out var s) ? s : ProjectLifecycleStatus.InProgress);
}
