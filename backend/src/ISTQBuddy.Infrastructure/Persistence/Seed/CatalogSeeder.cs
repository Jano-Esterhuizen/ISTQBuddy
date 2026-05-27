using System.Text.Json;
using ISTQBuddy.Domain.Entities;
using ISTQBuddy.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ISTQBuddy.Infrastructure.Persistence.Seed;

/// <summary>
/// Idempotent seeder for the full certification catalog. Upserts each certification by Slug
/// (falling back to Code+Version to adopt a pre-existing row, e.g. the Foundation cert created
/// by the exam seeder). Must run BEFORE <see cref="ExamSeeder"/> so exams can link to their cert.
/// </summary>
public class CatalogSeeder(AppDbContext db, ILogger<CatalogSeeder> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public async Task SeedAsync(CancellationToken ct = default)
    {
        var path = Path.Combine(AppContext.BaseDirectory, "Persistence", "Seed", "catalog.json");
        if (!File.Exists(path))
        {
            logger.LogWarning("Catalog seed file not found at {Path}; skipping.", path);
            return;
        }

        var data = JsonSerializer.Deserialize<CatalogFile>(await File.ReadAllTextAsync(path, ct), JsonOptions)
                   ?? throw new InvalidOperationException("Failed to parse catalog.json.");

        var existing = await db.Certifications.ToListAsync(ct);
        var bySlug = existing.Where(c => !string.IsNullOrEmpty(c.Slug)).ToDictionary(c => c.Slug);
        var byCodeVersion = existing.ToDictionary(c => (c.Code, c.Version));

        var orderByCategory = new Dictionary<CertificationCategory, int>();
        var added = 0;

        foreach (var item in data.Certifications)
        {
            var category = Enum.TryParse<CertificationCategory>(item.Category, true, out var cat) ? cat : CertificationCategory.Other;
            orderByCategory.TryGetValue(category, out var order);
            orderByCategory[category] = order + 1;

            var code = string.IsNullOrWhiteSpace(item.Code) ? item.Slug : item.Code;
            var version = string.IsNullOrWhiteSpace(item.Version) ? "1.0" : item.Version;

            // Adopt an existing row by slug, else by code+version (the pre-existing Foundation cert).
            if (!bySlug.TryGetValue(item.Slug, out var cert))
                byCodeVersion.TryGetValue((code, version), out cert);

            if (cert is null)
            {
                cert = new Certification();
                db.Certifications.Add(cert);
                added++;
            }

            cert.Slug = item.Slug;
            cert.Name = item.Name;
            cert.Category = category;
            cert.Code = code;
            cert.Version = version;
            cert.DisplayOrder = order;
            cert.UpdatedAt = DateTimeOffset.UtcNow;
        }

        await db.SaveChangesAsync(ct);
        logger.LogInformation("Catalog seeded ({Total} certifications, {Added} new).", data.Certifications.Count, added);
    }
}
