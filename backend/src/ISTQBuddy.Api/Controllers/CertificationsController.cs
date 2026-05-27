using ISTQBuddy.Application.Certifications;
using ISTQBuddy.Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ISTQBuddy.Api.Controllers;

public class CertificationsController(ICurrentUser currentUser, ICertificationService certifications)
    : BaseController(currentUser)
{
    /// <summary>The full certification catalog with per-user lock status.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CatalogCertificationDto>>> List(CancellationToken ct)
        => Ok(await certifications.GetCatalogAsync(CurrentUserId, ct));

    /// <summary>A single certification (by slug) with its exams.</summary>
    [HttpGet("{slug}")]
    public async Task<ActionResult<CertificationDetailDto>> Get(string slug, CancellationToken ct)
        => Ok(await certifications.GetBySlugAsync(CurrentUserId, slug, ct));
}
