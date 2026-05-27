using ISTQBuddy.Domain.Entities;

namespace ISTQBuddy.Application.Common.Interfaces;

/// <summary>Server-side freemium gate. The single source of truth for access decisions.</summary>
public interface IEntitlementService
{
    /// <summary>True if the user may access the given exam (free sample, or valid FullAccess entitlement).</summary>
    Task<bool> CanAccessExamAsync(Guid userId, Exam exam, CancellationToken ct = default);
}
