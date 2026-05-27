using FluentValidation;
using ISTQBuddy.Application.Common.Exceptions;
using ISTQBuddy.Application.Common.Interfaces;
using ISTQBuddy.Domain.Entities;
using ISTQBuddy.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ISTQBuddy.Application.Attempts;

public class AttemptService(
    IAppDbContext db,
    IEntitlementService entitlements,
    IValidator<SubmitAttemptInput> submitValidator) : IAttemptService
{
    public async Task<StartAttemptResult> StartAsync(Guid userId, Guid examId, CancellationToken ct = default)
    {
        var exam = await db.Exams.FirstOrDefaultAsync(e => e.Id == examId, ct)
            ?? throw new NotFoundException($"Exam {examId} not found.");

        if (!await entitlements.CanAccessExamAsync(userId, exam, ct))
            throw new ForbiddenException("This exam requires full access. Upgrade to unlock it.");

        var attempt = new Attempt
        {
            UserId = userId,
            ExamId = exam.Id,
            Status = AttemptStatus.InProgress,
            StartedAt = DateTimeOffset.UtcNow,
            MaxScore = exam.TotalPoints
        };
        db.Attempts.Add(attempt);
        await db.SaveChangesAsync(ct);

        return new StartAttemptResult(attempt.Id, exam.Id);
    }

    public async Task<AttemptResultDto> SubmitAsync(Guid userId, Guid attemptId, SubmitAttemptInput input, CancellationToken ct = default)
    {
        await submitValidator.ValidateAndThrowAsync(input, ct);

        var attempt = await db.Attempts
            .Include(a => a.Answers)
            .FirstOrDefaultAsync(a => a.Id == attemptId, ct)
            ?? throw new NotFoundException($"Attempt {attemptId} not found.");

        if (attempt.UserId != userId)
            throw new ForbiddenException("You do not have access to this attempt.");

        if (attempt.Status == AttemptStatus.Submitted)
            throw new BadRequestException("This attempt has already been submitted.");

        // Load the exam's questions with their options (correctness needed for grading).
        // No-tracking: these are read-only for scoring and must not be flagged for update.
        var questions = await db.Questions
            .AsNoTracking()
            .Include(q => q.Options)
            .Where(q => q.ExamId == attempt.ExamId)
            .ToListAsync(ct);

        var selectionByQuestion = input.Answers
            .GroupBy(a => a.QuestionId)
            .ToDictionary(g => g.Key, g => g.Last().SelectedOptionIds ?? new List<Guid>());

        var totalScore = 0;
        var maxScore = 0;
        var answers = new List<AttemptAnswer>(questions.Count);

        foreach (var q in questions)
        {
            maxScore += q.Points;

            var correctIds = q.Options.Where(o => o.IsCorrect).Select(o => o.Id);
            var validOptionIds = q.Options.Select(o => o.Id).ToHashSet();

            // Only count selections that belong to this question's options.
            var selected = selectionByQuestion.TryGetValue(q.Id, out var sel)
                ? sel.Where(validOptionIds.Contains).Distinct().ToList()
                : new List<Guid>();

            var (isCorrect, points) = AttemptScorer.ScoreQuestion(correctIds, selected, q.Points);
            totalScore += points;

            answers.Add(new AttemptAnswer
            {
                AttemptId = attempt.Id,
                QuestionId = q.Id,
                SelectedOptionIds = selected,
                IsCorrect = isCorrect,
                PointsAwarded = points
            });
        }

        // Add via the DbSet so EF tracks these as inserts (entities carry a pre-set Id,
        // which would otherwise be misclassified as Modified when added through navigation).
        db.AttemptAnswers.AddRange(answers);

        attempt.Score = totalScore;
        attempt.MaxScore = maxScore;
        attempt.Status = AttemptStatus.Submitted;
        attempt.SubmittedAt = DateTimeOffset.UtcNow;

        var passPercentage = await db.Exams
            .Where(e => e.Id == attempt.ExamId)
            .Select(e => e.PassPercentage)
            .FirstAsync(ct);
        attempt.Passed = AttemptScorer.IsPass(totalScore, maxScore, passPercentage);
        attempt.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(ct);

        return await BuildResultAsync(attempt.Id, userId, ct);
    }

    public Task<AttemptResultDto> GetResultAsync(Guid userId, Guid attemptId, CancellationToken ct = default)
        => BuildResultAsync(attemptId, userId, ct);

    private async Task<AttemptResultDto> BuildResultAsync(Guid attemptId, Guid userId, CancellationToken ct)
    {
        var attempt = await db.Attempts
            .Include(a => a.Exam)
            .Include(a => a.Answers)
            .FirstOrDefaultAsync(a => a.Id == attemptId, ct)
            ?? throw new NotFoundException($"Attempt {attemptId} not found.");

        if (attempt.UserId != userId)
            throw new ForbiddenException("You do not have access to this attempt.");

        if (attempt.Status != AttemptStatus.Submitted)
            throw new BadRequestException("This attempt has not been submitted yet.");

        var questions = await db.Questions
            .AsNoTracking()
            .Include(q => q.Options.OrderBy(o => o.OrderIndex))
            .Where(q => q.ExamId == attempt.ExamId)
            .OrderBy(q => q.OrderIndex)
            .ToListAsync(ct);

        var answerByQuestion = attempt.Answers.ToDictionary(a => a.QuestionId);

        var questionDtos = questions.Select(q =>
        {
            answerByQuestion.TryGetValue(q.Id, out var answer);
            var selected = answer?.SelectedOptionIds.ToHashSet() ?? new HashSet<Guid>();

            return new ResultQuestionDto
            {
                QuestionId = q.Id,
                ExternalId = q.ExternalId,
                Section = q.Section,
                LearningObjective = q.LearningObjective,
                KLevel = q.KLevel.ToString(),
                Points = q.Points,
                Stem = q.Stem,
                SelectCount = q.SelectCount,
                IsCorrect = answer?.IsCorrect ?? false,
                PointsAwarded = answer?.PointsAwarded ?? 0,
                Options = q.Options.OrderBy(o => o.OrderIndex).Select(o => new ResultOptionDto
                {
                    Id = o.Id,
                    Label = o.Label,
                    Text = o.Text,
                    IsCorrect = o.IsCorrect,
                    WasSelected = selected.Contains(o.Id),
                    Rationale = o.Rationale
                }).ToList()
            };
        }).ToList();

        var pct = attempt.MaxScore > 0
            ? (int)Math.Round((double)attempt.Score / attempt.MaxScore * 100d)
            : 0;

        return new AttemptResultDto
        {
            AttemptId = attempt.Id,
            ExamId = attempt.ExamId,
            ExamTitle = attempt.Exam.Title,
            Score = attempt.Score,
            MaxScore = attempt.MaxScore,
            Percentage = pct,
            PassPercentage = attempt.Exam.PassPercentage,
            Passed = attempt.Passed,
            SubmittedAt = attempt.SubmittedAt,
            Questions = questionDtos
        };
    }
}
