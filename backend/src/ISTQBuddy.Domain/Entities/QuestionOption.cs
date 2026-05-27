using ISTQBuddy.Domain.Common;

namespace ISTQBuddy.Domain.Entities;

/// <summary>An answer option. The per-option rationale is folded in here (no separate table).</summary>
public class QuestionOption : BaseEntity
{
    public Guid QuestionId { get; set; }
    public Question Question { get; set; } = null!;

    public string Label { get; set; } = string.Empty; // "a", "b", "c", ...
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public string? Rationale { get; set; }
    public int OrderIndex { get; set; }
}
