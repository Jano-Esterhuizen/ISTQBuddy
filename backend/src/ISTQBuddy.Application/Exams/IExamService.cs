namespace ISTQBuddy.Application.Exams;

public interface IExamService
{
    Task<IReadOnlyList<ExamSummaryDto>> GetExamsAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Full exam for taking. Throws <c>ForbiddenException</c> if the user lacks access.
    /// When <paramref name="includeAnswers"/> is true (study mode), option correctness and
    /// rationales are included so the client can give instant per-question feedback.
    /// </summary>
    Task<ExamDetailDto> GetExamDetailAsync(Guid userId, Guid examId, bool includeAnswers = false, CancellationToken ct = default);
}
