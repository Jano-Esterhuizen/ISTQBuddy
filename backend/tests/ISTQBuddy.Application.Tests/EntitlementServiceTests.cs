using ISTQBuddy.Application.Entitlements;
using ISTQBuddy.Domain.Entities;
using ISTQBuddy.Domain.Enums;
using ISTQBuddy.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ISTQBuddy.Application.Tests;

public class EntitlementServiceTests
{
    private static AppDbContext NewDb() =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"ent-{Guid.NewGuid()}")
            .Options);

    private static Exam PaidExam(Guid certId) => new()
    {
        Id = Guid.NewGuid(), CertificationId = certId, Title = "Paid", Slug = "paid", IsFreeSample = false
    };

    [Fact]
    public async Task FreeSample_IsAlwaysAccessible()
    {
        await using var db = NewDb();
        var svc = new EntitlementService(db);
        var free = new Exam { Id = Guid.NewGuid(), Title = "Free", Slug = "free", IsFreeSample = true };

        Assert.True(await svc.CanAccessExamAsync(Guid.NewGuid(), free));
    }

    [Fact]
    public async Task PaidExam_WithoutEntitlement_IsLocked()
    {
        await using var db = NewDb();
        var svc = new EntitlementService(db);

        Assert.False(await svc.CanAccessExamAsync(Guid.NewGuid(), PaidExam(Guid.NewGuid())));
    }

    [Fact]
    public async Task PaidExam_WithGlobalFullAccess_IsAccessible()
    {
        await using var db = NewDb();
        var userId = Guid.NewGuid();
        db.Entitlements.Add(new Entitlement
        {
            UserId = userId, Type = EntitlementType.FullAccess, CertificationId = null
        });
        await db.SaveChangesAsync();
        var svc = new EntitlementService(db);

        Assert.True(await svc.CanAccessExamAsync(userId, PaidExam(Guid.NewGuid())));
    }

    [Fact]
    public async Task PaidExam_WithExpiredEntitlement_IsLocked()
    {
        await using var db = NewDb();
        var userId = Guid.NewGuid();
        db.Entitlements.Add(new Entitlement
        {
            UserId = userId, Type = EntitlementType.FullAccess,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(-1)
        });
        await db.SaveChangesAsync();
        var svc = new EntitlementService(db);

        Assert.False(await svc.CanAccessExamAsync(userId, PaidExam(Guid.NewGuid())));
    }

    [Fact]
    public async Task PaidExam_WithEntitlementForDifferentCertification_IsLocked()
    {
        await using var db = NewDb();
        var userId = Guid.NewGuid();
        db.Entitlements.Add(new Entitlement
        {
            UserId = userId, Type = EntitlementType.FullAccess, CertificationId = Guid.NewGuid()
        });
        await db.SaveChangesAsync();
        var svc = new EntitlementService(db);

        Assert.False(await svc.CanAccessExamAsync(userId, PaidExam(Guid.NewGuid())));
    }
}
