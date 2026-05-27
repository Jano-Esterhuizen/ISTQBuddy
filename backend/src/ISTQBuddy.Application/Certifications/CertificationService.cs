using ISTQBuddy.Application.Common.Exceptions;
using ISTQBuddy.Application.Common.Interfaces;
using ISTQBuddy.Application.Exams;
using ISTQBuddy.Domain.Entities;
using ISTQBuddy.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ISTQBuddy.Application.Certifications;

public class CertificationService(IAppDbContext db, IEntitlementService entitlements) : ICertificationService
{
    public async Task<IReadOnlyList<CatalogCertificationDto>> GetCatalogAsync(Guid userId, CancellationToken ct = default)
    {
        var certs = await db.Certifications
            .AsNoTracking()
            .OrderBy(c => c.Category).ThenBy(c => c.DisplayOrder).ThenBy(c => c.Name)
            .ToListAsync(ct);

        var exams = await db.Exams
            .AsNoTracking()
            .Select(e => new { e.Id, e.CertificationId, e.IsFreeSample })
            .ToListAsync(ct);

        var now = DateTimeOffset.UtcNow;
        var entitledCertIds = await db.Entitlements
            .Where(e => e.UserId == userId
                && e.Type == EntitlementType.FullAccess
                && (e.ExpiresAt == null || e.ExpiresAt > now))
            .Select(e => e.CertificationId)
            .ToListAsync(ct);
        var hasGlobalAccess = entitledCertIds.Any(id => id == null);
        var accessibleCertIds = entitledCertIds.Where(id => id != null).Select(id => id!.Value).ToHashSet();

        var examsByCert = exams.GroupBy(e => e.CertificationId).ToDictionary(g => g.Key, g => g.ToList());

        return certs.Select(c =>
        {
            examsByCert.TryGetValue(c.Id, out var certExams);
            certExams ??= [];
            var hasFree = certExams.Any(e => e.IsFreeSample);
            var hasAccess = hasGlobalAccess || accessibleCertIds.Contains(c.Id);
            return new CatalogCertificationDto
            {
                Id = c.Id,
                Slug = c.Slug,
                Name = c.Name,
                Category = c.Category.ToString(),
                Version = c.Version,
                ExamCount = certExams.Count,
                HasFreeSample = hasFree,
                IsLocked = certExams.Count > 0 && !hasFree && !hasAccess
            };
        }).ToList();
    }

    public async Task<CertificationDetailDto> GetBySlugAsync(Guid userId, string slug, CancellationToken ct = default)
    {
        var cert = await db.Certifications
            .AsNoTracking()
            .Include(c => c.Exams)
            .FirstOrDefaultAsync(c => c.Slug == slug, ct)
            ?? throw new NotFoundException($"Certification '{slug}' not found.");

        var exams = new List<ExamSummaryDto>(cert.Exams.Count);
        foreach (var e in cert.Exams.OrderByDescending(x => x.IsFreeSample).ThenBy(x => x.Title))
        {
            var canAccess = await entitlements.CanAccessExamAsync(userId, e, ct);
            exams.Add(new ExamSummaryDto
            {
                Id = e.Id,
                Title = e.Title,
                Slug = e.Slug,
                Description = e.Description,
                IsFreeSample = e.IsFreeSample,
                QuestionCount = e.QuestionCount,
                TotalPoints = e.TotalPoints,
                PassPercentage = e.PassPercentage,
                CertificationName = cert.Name,
                IsLocked = !canAccess
            });
        }

        return new CertificationDetailDto
        {
            Id = cert.Id,
            Slug = cert.Slug,
            Name = cert.Name,
            Category = cert.Category.ToString(),
            Exams = exams
        };
    }
}
