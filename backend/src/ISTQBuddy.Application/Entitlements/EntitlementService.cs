using ISTQBuddy.Application.Common.Interfaces;
using ISTQBuddy.Domain.Entities;
using ISTQBuddy.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ISTQBuddy.Application.Entitlements;

public class EntitlementService(IAppDbContext db) : IEntitlementService
{
    public async Task<bool> CanAccessExamAsync(Guid userId, Exam exam, CancellationToken ct = default)
    {
        // The free sample is open to any authenticated user.
        if (exam.IsFreeSample)
            return true;

        var now = DateTimeOffset.UtcNow;

        // Otherwise require a valid FullAccess entitlement that is either global
        // (CertificationId == null) or scoped to this exam's certification.
        return await db.Entitlements.AnyAsync(e =>
            e.UserId == userId
            && e.Type == EntitlementType.FullAccess
            && (e.ExpiresAt == null || e.ExpiresAt > now)
            && (e.CertificationId == null || e.CertificationId == exam.CertificationId),
            ct);
    }
}
