using ISTQBuddy.Domain.Enums;

namespace ISTQBuddy.Application.Exams;

/// <summary>Exam as shown in the list. <see cref="IsLocked"/> is computed per current user.</summary>
public record ExamSummaryDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? Description { get; init; }
    public bool IsFreeSample { get; init; }
    public int QuestionCount { get; init; }
    public int TotalPoints { get; init; }
    public int PassPercentage { get; init; }
    public string CertificationName { get; init; } = string.Empty;
    public bool IsLocked { get; init; }
}

/// <summary>
/// Full exam for taking. In exam mode the option correctness/rationale are null;
/// in study mode (includeAnswers) they are populated so the client can grade instantly.
/// </summary>
public record ExamDetailDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string CertificationName { get; init; } = string.Empty;
    public string CertificationSlug { get; init; } = string.Empty;
    public int PassPercentage { get; init; }
    public bool IncludesAnswers { get; init; }
    public IReadOnlyList<QuestionDto> Questions { get; init; } = [];
}

public record QuestionDto
{
    public Guid Id { get; init; }
    public string ExternalId { get; init; } = string.Empty;
    public string Section { get; init; } = string.Empty;
    public string LearningObjective { get; init; } = string.Empty;
    public string KLevel { get; init; } = string.Empty;
    public int Points { get; init; }
    public string Stem { get; init; } = string.Empty;
    public int SelectCount { get; init; }
    public int OrderIndex { get; init; }
    public IReadOnlyList<OptionDto> Options { get; init; } = [];
}

public record OptionDto
{
    public Guid Id { get; init; }
    public string Label { get; init; } = string.Empty;
    public string Text { get; init; } = string.Empty;
    public int OrderIndex { get; init; }

    /// <summary>Populated only in study mode (includeAnswers); null otherwise.</summary>
    public bool? IsCorrect { get; init; }
    public string? Rationale { get; init; }
}
