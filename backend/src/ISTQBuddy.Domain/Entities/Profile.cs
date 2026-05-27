using ISTQBuddy.Domain.Enums;

namespace ISTQBuddy.Domain.Entities;

/// <summary>
/// Local mirror of a Supabase auth user. <see cref="Id"/> equals the JWT "sub" claim.
/// Created just-in-time on the first authenticated request. The Supabase auth user
/// remains the source of truth; email/display name are a re-syncable cache.
/// </summary>
public class Profile
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public UserRole Role { get; set; } = UserRole.User;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
