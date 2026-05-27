namespace ISTQBuddy.Application.Attempts;

public interface IAttemptService
{
    /// <summary>Start a new attempt. Enforces the freemium gate; throws <c>ForbiddenException</c> if locked.</summary>
    Task<StartAttemptResult> StartAsync(Guid userId, Guid examId, CancellationToken ct = default);

    /// <summary>Grade and finalize an attempt the user owns. Idempotent-safe: re-submitting is rejected.</summary>
    Task<AttemptResultDto> SubmitAsync(Guid userId, Guid attemptId, SubmitAttemptInput input, CancellationToken ct = default);

    /// <summary>Fetch a submitted attempt's full result. Scoped to the owning user.</summary>
    Task<AttemptResultDto> GetResultAsync(Guid userId, Guid attemptId, CancellationToken ct = default);
}
