namespace ISTQBuddy.Domain.Enums;

/// <summary>ISTQB cognitive level of a question.</summary>
public enum KLevel
{
    K1 = 1,
    K2 = 2,
    K3 = 3
}

/// <summary>Application role of a profile. Drives admin authorization (Phase 3).</summary>
public enum UserRole
{
    User = 0,
    Admin = 1
}

/// <summary>Lifecycle of a quiz attempt.</summary>
public enum AttemptStatus
{
    InProgress = 0,
    Submitted = 1
}

/// <summary>What a user is entitled to access.</summary>
public enum EntitlementType
{
    FreeSample = 0,
    FullAccess = 1
}

/// <summary>How an entitlement was granted.</summary>
public enum EntitlementSource
{
    System = 0,
    LemonSqueezy = 1
}

/// <summary>Top-level grouping for the certification catalog.</summary>
public enum CertificationCategory
{
    Core = 0,
    Specialist = 1,
    Expert = 2,
    Other = 3
}
