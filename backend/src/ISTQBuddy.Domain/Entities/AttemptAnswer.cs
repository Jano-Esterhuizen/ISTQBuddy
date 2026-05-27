using ISTQBuddy.Domain.Common;

namespace ISTQBuddy.Domain.Entities;

/// <summary>A user's answer to one question within an attempt.</summary>
public class AttemptAnswer : BaseEntity
{
    public Guid AttemptId { get; set; }
    public Attempt Attempt { get; set; } = null!;

    public Guid QuestionId { get; set; }
    public Question Question { get; set; } = null!;

    /// <summary>The option ids the user selected. Stored as a uuid[] column in PostgreSQL.</summary>
    public List<Guid> SelectedOptionIds { get; set; } = new();

    public bool IsCorrect { get; set; }
    public int PointsAwarded { get; set; }
}
