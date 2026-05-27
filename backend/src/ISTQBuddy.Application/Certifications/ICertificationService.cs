namespace ISTQBuddy.Application.Certifications;

public interface ICertificationService
{
    /// <summary>The full catalog, ordered by category then display order, with per-user lock status.</summary>
    Task<IReadOnlyList<CatalogCertificationDto>> GetCatalogAsync(Guid userId, CancellationToken ct = default);

    /// <summary>A single certification (by slug) with its exams. Throws <c>NotFoundException</c> if unknown.</summary>
    Task<CertificationDetailDto> GetBySlugAsync(Guid userId, string slug, CancellationToken ct = default);
}
