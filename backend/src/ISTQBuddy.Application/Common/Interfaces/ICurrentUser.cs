namespace ISTQBuddy.Application.Common.Interfaces;

/// <summary>The authenticated user for the current request, derived from the Supabase JWT.</summary>
public interface ICurrentUser
{
    /// <summary>The "sub" claim. Null when unauthenticated.</summary>
    Guid? UserId { get; }

    string? Email { get; }

    bool IsAuthenticated { get; }

    /// <summary>Convenience accessor that throws if there is no authenticated user.</summary>
    Guid RequireUserId();
}
