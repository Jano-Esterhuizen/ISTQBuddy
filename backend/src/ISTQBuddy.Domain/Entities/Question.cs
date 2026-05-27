using ISTQBuddy.Domain.Common;
using ISTQBuddy.Domain.Enums;

namespace ISTQBuddy.Domain.Entities;

/// <summary>A single exam question. <see cref="SelectCount"/> drives single- vs multi-select scoring.</summary>
public class Question : BaseEntity
{
    public Guid ExamId { get; set; }
    public Exam Exam { get; set; } = null!;

    /// <summary>Stable content id from the source bank (e.g. "1", "A12"). Unique within an exam.</summary>
    public string ExternalId { get; set; } = string.Empty;

    public string Section { get; set; } = string.Empty;          // "main" | "additional"
    public string LearningObjective { get; set; } = string.Empty; // e.g. "FL-1.1.1"
    public KLevel KLevel { get; set; }
    public int Points { get; set; } = 1;

    public string Stem { get; set; } = string.Empty;
    public int SelectCount { get; set; } = 1;
    public int OrderIndex { get; set; }

    public ICollection<QuestionOption> Options { get; set; } = new List<QuestionOption>();
}
