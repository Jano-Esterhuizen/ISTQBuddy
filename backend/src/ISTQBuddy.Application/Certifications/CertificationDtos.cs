using ISTQBuddy.Application.Exams;

namespace ISTQBuddy.Application.Certifications;

/// <summary>A certification as shown in the catalog. Status is derived client-side from these flags.</summary>
public record CatalogCertificationDto
{
    public Guid Id { get; init; }
    public string Slug { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string Version { get; init; } = string.Empty;
    public int ExamCount { get; init; }
    public bool HasFreeSample { get; init; }
    public bool IsLocked { get; init; }
    /// <summary>True if the user has a FullAccess entitlement covering this cert (global or scoped).</summary>
    public bool IsOwned { get; init; }
}

/// <summary>A single certification with its exams.</summary>
public record CertificationDetailDto
{
    public Guid Id { get; init; }
    public string Slug { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public bool IsOwned { get; init; }
    public IReadOnlyList<ExamSummaryDto> Exams { get; init; } = [];
}
