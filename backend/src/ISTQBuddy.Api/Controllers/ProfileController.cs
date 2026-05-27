using ISTQBuddy.Application.Common.Interfaces;
using ISTQBuddy.Application.Profiles;
using Microsoft.AspNetCore.Mvc;

namespace ISTQBuddy.Api.Controllers;

public class ProfileController(ICurrentUser currentUser, IProfileService profiles) : BaseController(currentUser)
{
    /// <summary>Returns the current user's profile, creating it just-in-time on first call.</summary>
    [HttpGet("me")]
    public async Task<ActionResult<ProfileDto>> Me(CancellationToken ct)
    {
        var email = CurrentUser.Email ?? string.Empty;
        var profile = await profiles.EnsureCurrentAsync(CurrentUserId, email, null, ct);
        return Ok(profile);
    }
}
