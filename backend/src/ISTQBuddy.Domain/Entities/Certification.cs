using ISTQBuddy.Domain.Common;
using ISTQBuddy.Domain.Enums;

namespace ISTQBuddy.Domain.Entities;

/// <summary>A certification track (e.g. CTFL v4.0). Future-proofs multiple certifications.</summary>
public class Certification : BaseEntity
{
    public string Code { get; set; } = string.Empty;   // e.g. "CTFL"
    public string Name { get; set; } = string.Empty;   // catalog display name, e.g. "ISTQB Foundation"
    public string Version { get; set; } = string.Empty; // e.g. "4.0"

    /// <summary>Stable identifier used in catalog URLs, e.g. "istqb-foundation".</summary>
    public string Slug { get; set; } = string.Empty;

    public CertificationCategory Category { get; set; } = CertificationCategory.Core;

    /// <summary>Ordering within a category in the catalog.</summary>
    public int DisplayOrder { get; set; }

    public ICollection<Exam> Exams { get; set; } = new List<Exam>();
}
