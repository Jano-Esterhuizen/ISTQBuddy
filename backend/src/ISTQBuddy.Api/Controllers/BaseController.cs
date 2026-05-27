using ISTQBuddy.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ISTQBuddy.Api.Controllers;

/// <summary>Base for authenticated API controllers. Exposes the current user's id from the JWT.</summary>
[ApiController]
[Authorize]
[Route("api/[controller]")]
public abstract class BaseController(ICurrentUser currentUser) : ControllerBase
{
    protected ICurrentUser CurrentUser { get; } = currentUser;

    protected Guid CurrentUserId => CurrentUser.RequireUserId();
}
