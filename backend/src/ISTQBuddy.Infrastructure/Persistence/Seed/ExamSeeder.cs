using System.Text.Json;
using ISTQBuddy.Domain.Entities;
using ISTQBuddy.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ISTQBuddy.Infrastructure.Persistence.Seed;

/// <summary>
/// Idempotent seeder for the bundled "Sample Exam A". Upserts the certification and exam by their
/// natural keys (cert Code+Version, exam Slug) and replaces the exam's questions so re-running is safe.
/// </summary>
public class ExamSeeder(AppDbContext db, ILogger<ExamSeeder> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task SeedAsync(CancellationToken ct = default)
    {
        var path = Path.Combine(AppContext.BaseDirectory, "Persistence", "Seed", "sample-exam-a.json");
        if (!File.Exists(path))
        {
            logger.LogWarning("Seed file not found at {Path}; skipping seed.", path);
            return;
        }

        var json = await File.ReadAllTextAsync(path, ct);
        var data = JsonSerializer.Deserialize<SeedFile>(json, JsonOptions)
                   ?? throw new InvalidOperationException("Failed to parse sample-exam-a.json.");

        // --- Certification (upsert by Code + Version) ---
        var cert = await db.Certifications.FirstOrDefaultAsync(
            c => c.Code == data.Certification.Code && c.Version == data.Certification.Version, ct);
        if (cert is null)
        {
            cert = new Certification
            {
                Code = data.Certification.Code,
                Name = data.Certification.Name,
                Version = data.Certification.Version
            };
            db.Certifications.Add(cert);
            await db.SaveChangesAsync(ct);
        }

        // --- Exam (upsert by Slug) ---
        var exam = await db.Exams
            .Include(e => e.Questions).ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(e => e.Slug == data.Exam.Slug, ct);

        if (exam is null)
        {
            exam = new Exam { Slug = data.Exam.Slug, CertificationId = cert.Id };
            db.Exams.Add(exam);
        }
        else
        {
            // Replace existing questions to keep the seed authoritative and idempotent.
            db.QuestionOptions.RemoveRange(exam.Questions.SelectMany(q => q.Options));
            db.Questions.RemoveRange(exam.Questions);
        }

        exam.Title = data.Exam.Title;
        exam.Description = data.Exam.Description;
        exam.IsFreeSample = data.Exam.IsFreeSample;
        exam.PassPercentage = data.Exam.PassPercentage;
        exam.CertificationId = cert.Id;
        exam.QuestionCount = data.Questions.Count;
        exam.TotalPoints = data.Questions.Sum(q => q.Points);
        exam.UpdatedAt = DateTimeOffset.UtcNow;

        var qOrder = 0;
        foreach (var sq in data.Questions)
        {
            var correct = sq.Correct.Select(c => c.ToLowerInvariant()).ToHashSet();
            var question = new Question
            {
                Exam = exam,
                ExternalId = sq.Id,
                Section = sq.Section,
                LearningObjective = sq.Lo,
                KLevel = Enum.TryParse<KLevel>(sq.KLevel, true, out var k) ? k : KLevel.K1,
                Points = sq.Points,
                Stem = sq.Stem,
                SelectCount = sq.SelectCount,
                OrderIndex = qOrder++
            };

            var oOrder = 0;
            foreach (var so in sq.Options)
            {
                var letter = so.Letter.ToLowerInvariant();
                question.Options.Add(new QuestionOption
                {
                    Label = so.Letter,
                    Text = so.Text,
                    IsCorrect = correct.Contains(letter),
                    Rationale = sq.Rationales.TryGetValue(so.Letter, out var r) ? r : null,
                    OrderIndex = oOrder++
                });
            }

            // Add via the DbSet so the question+options graph is tracked as an insert
            // (entities carry pre-set Ids that would otherwise be misclassified as Modified).
            db.Questions.Add(question);
        }

        await db.SaveChangesAsync(ct);
        logger.LogInformation("Seeded exam '{Title}' ({Count} questions, {Points} pts).",
            exam.Title, exam.QuestionCount, exam.TotalPoints);
    }
}
