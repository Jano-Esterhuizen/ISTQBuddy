using ISTQBuddy.Application.Common.Interfaces;
using ISTQBuddy.Application.Exams;
using Microsoft.AspNetCore.Mvc;

namespace ISTQBuddy.Api.Controllers;

public class ExamsController(ICurrentUser currentUser, IExamService exams) : BaseController(currentUser)
{
    /// <summary>All exams, each tagged with isLocked for the current user.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ExamSummaryDto>>> List(CancellationToken ct)
        => Ok(await exams.GetExamsAsync(CurrentUserId, ct));

    /// <summary>Full exam for taking. Returns 403 if the user lacks access (freemium gate).</summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ExamDetailDto>> Get(Guid id, CancellationToken ct)
        => Ok(await exams.GetExamDetailAsync(CurrentUserId, id, ct));
}
