using ISTQBuddy.Domain.Common;
using ISTQBuddy.Domain.Enums;

namespace ISTQBuddy.Domain.Entities;

/// <summary>
/// Grants a user access to paid content. Phase 2 (Lemon Squeezy) simply inserts a
/// <see cref="EntitlementType.FullAccess"/> row here from the webhook — no schema change.
/// </summary>
public class Entitlement : BaseEntity
{
    public Guid UserId { get; set; }

    /// <summary>Null = applies to all certifications (global access).</summary>
    public Guid? CertificationId { get; set; }
    public Certification? Certification { get; set; }

    public EntitlementType Type { get; set; }
    public EntitlementSource Source { get; set; } = EntitlementSource.System;

    /// <summary>External reference (e.g. Lemon Squeezy order/subscription id). Null in Phase 1.</summary>
    public string? ExternalReference { get; set; }

    public DateTimeOffset GrantedAt { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>Null = never expires.</summary>
    public DateTimeOffset? ExpiresAt { get; set; }
}
