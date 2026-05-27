using ISTQBuddy.Application.Attempts;
using ISTQBuddy.Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ISTQBuddy.Api.Controllers;

public record StartAttemptRequest(Guid ExamId);

public class AttemptsController(ICurrentUser currentUser, IAttemptService attempts) : BaseController(currentUser)
{
    /// <summary>Start an attempt. Enforces the freemium gate (403 if locked).</summary>
    [HttpPost]
    public async Task<ActionResult<StartAttemptResult>> Start([FromBody] StartAttemptRequest request, CancellationToken ct)
    {
        var result = await attempts.StartAsync(CurrentUserId, request.ExamId, ct);
        return CreatedAtAction(nameof(Get), new { id = result.AttemptId }, result);
    }

    /// <summary>Submit answers and grade the attempt.</summary>
    [HttpPost("{id:guid}/submit")]
    public async Task<ActionResult<AttemptResultDto>> Submit(Guid id, [FromBody] SubmitAttemptInput input, CancellationToken ct)
        => Ok(await attempts.SubmitAsync(CurrentUserId, id, input, ct));

    /// <summary>Get a submitted attempt's full result (with rationales).</summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AttemptResultDto>> Get(Guid id, CancellationToken ct)
        => Ok(await attempts.GetResultAsync(CurrentUserId, id, ct));
}
