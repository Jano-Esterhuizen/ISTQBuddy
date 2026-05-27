using ISTQBuddy.Application.Common.Interfaces;
using ISTQBuddy.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ISTQBuddy.Application.Profiles;

public record ProfileDto
{
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string? DisplayName { get; init; }
    public string Role { get; init; } = "User";
    public bool HasFullAccess { get; init; }
}

public interface IProfileService
{
    /// <summary>Return the current user's profile, creating it just-in-time on first call.</summary>
    Task<ProfileDto> EnsureCurrentAsync(Guid userId, string email, string? displayName, CancellationToken ct = default);
}

public class ProfileService(IAppDbContext db) : IProfileService
{
    public async Task<ProfileDto> EnsureCurrentAsync(Guid userId, string email, string? displayName, CancellationToken ct = default)
    {
        var profile = await db.Profiles.FirstOrDefaultAsync(p => p.Id == userId, ct);

        if (profile is null)
        {
            profile = new Profile
            {
                Id = userId,
                Email = email,
                DisplayName = displayName
            };
            db.Profiles.Add(profile);
            await db.SaveChangesAsync(ct);
        }
        else if (profile.Email != email && !string.IsNullOrWhiteSpace(email))
        {
            // Keep the cached email in sync with the auth source of truth.
            profile.Email = email;
            profile.UpdatedAt = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync(ct);
        }

        var hasFullAccess = await db.Entitlements.AnyAsync(e =>
            e.UserId == userId
            && e.Type == Domain.Enums.EntitlementType.FullAccess
            && (e.ExpiresAt == null || e.ExpiresAt > DateTimeOffset.UtcNow), ct);

        return new ProfileDto
        {
            Id = profile.Id,
            Email = profile.Email,
            DisplayName = profile.DisplayName,
            Role = profile.Role.ToString(),
            HasFullAccess = hasFullAccess
        };
    }
}
