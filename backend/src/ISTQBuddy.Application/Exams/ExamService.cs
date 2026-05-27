using ISTQBuddy.Application.Common.Exceptions;
using ISTQBuddy.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ISTQBuddy.Application.Exams;

public class ExamService(IAppDbContext db, IEntitlementService entitlements) : IExamService
{
    public async Task<IReadOnlyList<ExamSummaryDto>> GetExamsAsync(Guid userId, CancellationToken ct = default)
    {
        var exams = await db.Exams
            .Include(e => e.Certification)
            .OrderByDescending(e => e.IsFreeSample)
            .ThenBy(e => e.Title)
            .ToListAsync(ct);

        var result = new List<ExamSummaryDto>(exams.Count);
        foreach (var e in exams)
        {
            var canAccess = await entitlements.CanAccessExamAsync(userId, e, ct);
            result.Add(new ExamSummaryDto
            {
                Id = e.Id,
                Title = e.Title,
                Slug = e.Slug,
                Description = e.Description,
                IsFreeSample = e.IsFreeSample,
                QuestionCount = e.QuestionCount,
                TotalPoints = e.TotalPoints,
                PassPercentage = e.PassPercentage,
                CertificationName = e.Certification.Name,
                IsLocked = !canAccess
            });
        }
        return result;
    }

    public async Task<ExamDetailDto> GetExamDetailAsync(Guid userId, Guid examId, bool includeAnswers = false, CancellationToken ct = default)
    {
        var exam = await db.Exams
            .Include(e => e.Certification)
            .Include(e => e.Questions.OrderBy(q => q.OrderIndex))
                .ThenInclude(q => q.Options.OrderBy(o => o.OrderIndex))
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == examId, ct)
            ?? throw new NotFoundException($"Exam {examId} not found.");

        if (!await entitlements.CanAccessExamAsync(userId, exam, ct))
            throw new ForbiddenException("This exam requires full access. Upgrade to unlock it.");

        return new ExamDetailDto
        {
            Id = exam.Id,
            Title = exam.Title,
            Slug = exam.Slug,
            Description = exam.Description,
            CertificationName = exam.Certification.Name,
            PassPercentage = exam.PassPercentage,
            IncludesAnswers = includeAnswers,
            Questions = exam.Questions
                .OrderBy(q => q.OrderIndex)
                .Select(q => new QuestionDto
                {
                    Id = q.Id,
                    ExternalId = q.ExternalId,
                    Section = q.Section,
                    LearningObjective = q.LearningObjective,
                    KLevel = q.KLevel.ToString(),
                    Points = q.Points,
                    Stem = q.Stem,
                    SelectCount = q.SelectCount,
                    OrderIndex = q.OrderIndex,
                    Options = q.Options
                        .OrderBy(o => o.OrderIndex)
                        .Select(o => new OptionDto
                        {
                            Id = o.Id,
                            Label = o.Label,
                            Text = o.Text,
                            OrderIndex = o.OrderIndex,
                            IsCorrect = includeAnswers ? o.IsCorrect : null,
                            Rationale = includeAnswers ? o.Rationale : null
                        })
                        .ToList()
                })
                .ToList()
        };
    }
}
