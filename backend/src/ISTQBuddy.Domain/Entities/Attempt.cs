using ISTQBuddy.Domain.Common;
using ISTQBuddy.Domain.Enums;

namespace ISTQBuddy.Domain.Entities;

/// <summary>A user's attempt at an exam. Always scoped by <see cref="UserId"/> (multi-tenancy).</summary>
public class Attempt : BaseEntity
{
    public Guid UserId { get; set; }

    public Guid ExamId { get; set; }
    public Exam Exam { get; set; } = null!;

    public AttemptStatus Status { get; set; } = AttemptStatus.InProgress;
    public DateTimeOffset StartedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? SubmittedAt { get; set; }

    public int Score { get; set; }
    public int MaxScore { get; set; }
    public bool Passed { get; set; }

    public ICollection<AttemptAnswer> Answers { get; set; } = new List<AttemptAnswer>();
}
