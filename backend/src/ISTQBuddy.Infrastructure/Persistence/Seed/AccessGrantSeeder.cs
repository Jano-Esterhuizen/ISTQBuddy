using ISTQBuddy.Domain.Entities;
using ISTQBuddy.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ISTQBuddy.Infrastructure.Persistence.Seed;

/// <summary>
/// Grants a global <see cref="EntitlementType.FullAccess"/> entitlement to the profiles listed in
/// <c>Seed:GrantFullAccessTo</c> (comma-separated emails). Idempotent — skips a profile that already
/// has a full-access grant. A profile only exists once that user has signed in at least once (JIT mirror),
/// so this is safe to run on every startup. Intended for development / comping accounts before payments exist.
/// </summary>
public class AccessGrantSeeder(AppDbContext db, IConfiguration config, ILogger<AccessGrantSeeder> logger)
{
    public async Task SeedAsync(CancellationToken ct = default)
    {
        var raw = config["Seed:GrantFullAccessTo"];
        if (string.IsNullOrWhiteSpace(raw))
            return;

        var emails = raw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        foreach (var email in emails)
        {
            var profile = await db.Profiles
                .FirstOrDefaultAsync(p => p.Email.ToLower() == email.ToLower(), ct);

            if (profile is null)
            {
                logger.LogInformation(
                    "GrantFullAccessTo: no profile for '{Email}' yet — sign in once to create it, then restart.", email);
                continue;
            }

            var alreadyGranted = await db.Entitlements.AnyAsync(
                e => e.UserId == profile.Id
                     && e.Type == EntitlementType.FullAccess
                     && e.CertificationId == null,
                ct);

            if (alreadyGranted)
                continue;

            db.Entitlements.Add(new Entitlement
            {
                UserId = profile.Id,
                CertificationId = null, // global
                Type = EntitlementType.FullAccess,
                Source = EntitlementSource.System
            });
            await db.SaveChangesAsync(ct);

            logger.LogInformation("Granted global FullAccess to '{Email}'.", email);
        }
    }
}
