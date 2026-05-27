using ISTQBuddy.Domain.Common;

namespace ISTQBuddy.Domain.Entities;

/// <summary>A practice exam belonging to a certification. The free-sample flag drives freemium gating.</summary>
public class Exam : BaseEntity
{
    public Guid CertificationId { get; set; }
    public Certification Certification { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;   // unique, used for idempotent seeding
    public string? Description { get; set; }

    /// <summary>When true, any authenticated user may take this exam (the free sample).</summary>
    public bool IsFreeSample { get; set; }

    public int TotalPoints { get; set; }
    public int PassPercentage { get; set; } = 65;
    public int QuestionCount { get; set; }

    public ICollection<Question> Questions { get; set; } = new List<Question>();
}
