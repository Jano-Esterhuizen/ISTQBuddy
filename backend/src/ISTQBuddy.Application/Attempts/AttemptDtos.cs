namespace ISTQBuddy.Application.Attempts;

/// <summary>Returned when an attempt is started.</summary>
public record StartAttemptResult(Guid AttemptId, Guid ExamId);

/// <summary>One answer the user submits.</summary>
public record SubmitAnswerInput
{
    public Guid QuestionId { get; init; }
    public List<Guid> SelectedOptionIds { get; init; } = new();
}

/// <summary>Payload to submit and score an attempt.</summary>
public record SubmitAttemptInput
{
    public List<SubmitAnswerInput> Answers { get; init; } = new();
}

/// <summary>Full graded result, revealing correctness and per-option rationales.</summary>
public record AttemptResultDto
{
    public Guid AttemptId { get; init; }
    public Guid ExamId { get; init; }
    public string ExamTitle { get; init; } = string.Empty;
    public int Score { get; init; }
    public int MaxScore { get; init; }
    public int Percentage { get; init; }
    public int PassPercentage { get; init; }
    public bool Passed { get; init; }
    public DateTimeOffset? SubmittedAt { get; init; }
    public IReadOnlyList<ResultQuestionDto> Questions { get; init; } = [];
}

public record ResultQuestionDto
{
    public Guid QuestionId { get; init; }
    public string ExternalId { get; init; } = string.Empty;
    public string Section { get; init; } = string.Empty;
    public string LearningObjective { get; init; } = string.Empty;
    public string KLevel { get; init; } = string.Empty;
    public int Points { get; init; }
    public string Stem { get; init; } = string.Empty;
    public string? Diagram { get; init; }
    public int SelectCount { get; init; }
    public bool IsCorrect { get; init; }
    public int PointsAwarded { get; init; }
    public IReadOnlyList<ResultOptionDto> Options { get; init; } = [];
}

public record ResultOptionDto
{
    public Guid Id { get; init; }
    public string Label { get; init; } = string.Empty;
    public string Text { get; init; } = string.Empty;
    public bool IsCorrect { get; init; }
    public bool WasSelected { get; init; }
    public string? Rationale { get; init; }
}
