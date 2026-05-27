namespace ISTQBuddy.Application.Exams;

public interface IExamService
{
    Task<IReadOnlyList<ExamSummaryDto>> GetExamsAsync(Guid userId, CancellationToken ct = default);

    /// <summary>Full exam for taking. Throws <c>ForbiddenException</c> if the user lacks access.</summary>
    Task<ExamDetailDto> GetExamDetailAsync(Guid userId, Guid examId, CancellationToken ct = default);
}
