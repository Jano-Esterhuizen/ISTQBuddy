using System.Security.Claims;
using ISTQBuddy.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace ISTQBuddy.Infrastructure.Auth;

/// <summary>Reads the authenticated user from the validated Supabase JWT on the current request.</summary>
public class CurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    private ClaimsPrincipal? Principal => accessor.HttpContext?.User;

    public Guid? UserId
    {
        get
        {
            var sub = Principal?.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? Principal?.FindFirstValue("sub");
            return Guid.TryParse(sub, out var id) ? id : null;
        }
    }

    public string? Email =>
        Principal?.FindFirstValue(ClaimTypes.Email) ?? Principal?.FindFirstValue("email");

    public bool IsAuthenticated => Principal?.Identity?.IsAuthenticated == true && UserId is not null;

    public Guid RequireUserId() =>
        UserId ?? throw new UnauthorizedAccessException("No authenticated user on the current request.");
}
