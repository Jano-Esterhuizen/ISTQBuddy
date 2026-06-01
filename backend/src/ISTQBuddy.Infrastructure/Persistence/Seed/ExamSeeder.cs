using System.Text.Json;
using ISTQBuddy.Domain.Entities;
using ISTQBuddy.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ISTQBuddy.Infrastructure.Persistence.Seed;

/// <summary>
/// Idempotent seeder for the bundled exams. Loads every <c>sample-exam-*.json</c> file under
/// Persistence/Seed, upserting each by its natural keys (cert Code+Version, exam Slug) and replacing
/// the exam's questions when the content changes. Adding an exam = drop in a new JSON file.
/// </summary>
public class ExamSeeder(AppDbContext db, ILogger<ExamSeeder> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task SeedAsync(CancellationToken ct = default)
    {
        var seedDir = Path.Combine(AppContext.BaseDirectory, "Persistence", "Seed");
        if (!Directory.Exists(seedDir))
        {
            logger.LogWarning("Seed directory not found at {Path}; skipping exam seed.", seedDir);
            return;
        }

        var files = Directory.GetFiles(seedDir, "sample-exam-*.json").OrderBy(f => f).ToArray();
        if (files.Length == 0)
        {
            logger.LogWarning("No exam seed files (sample-exam-*.json) found in {Path}.", seedDir);
            return;
        }

        foreach (var file in files)
            await SeedFileAsync(file, ct);
    }

    private async Task SeedFileAsync(string path, CancellationToken ct)
    {
        var json = await File.ReadAllTextAsync(path, ct);
        var data = JsonSerializer.Deserialize<SeedFile>(json, JsonOptions)
                   ?? throw new InvalidOperationException($"Failed to parse {Path.GetFileName(path)}.");

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

        // Already seeded AND content unchanged → no-op. Comparing a content signature
        // (not just the question count) means edits to stems, diagrams, options, or
        // rationales are picked up on the next startup without manual DB surgery.
        if (exam is not null && BuildStoredSignature(exam) == BuildSeedSignature(data))
        {
            logger.LogInformation("Exam '{Title}' already up to date ({Count} questions); skipping.",
                exam.Title, exam.Questions.Count);
            return;
        }

        if (exam is null)
        {
            exam = new Exam { Slug = data.Exam.Slug, CertificationId = cert.Id };
            db.Exams.Add(exam);
        }
        else
        {
            // Content changed (e.g. the seed file was updated) — replace the question set.
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
                Diagram = sq.Diagram,
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

    // --- Content signatures: equal strings ⇒ stored content matches the seed file ---

    private const char FieldSep = (char)0x1f;
    private const char QuestionSep = (char)0x1e;
    private const char OptionSep = (char)0x1d;

    private static string BuildSeedSignature(SeedFile data)
    {
        var correctByQuestion = data.Questions
            .Select(q => q.Correct.Select(c => c.ToLowerInvariant()).ToHashSet())
            .ToList();

        return string.Join(QuestionSep, data.Questions.Select((q, i) => string.Join(FieldSep,
            q.Id, q.KLevel, q.Lo, q.Points.ToString(), q.SelectCount.ToString(),
            q.Stem, q.Diagram ?? "",
            string.Join(OptionSep, q.Options.Select(o => string.Join("=",
                o.Letter,
                o.Text,
                correctByQuestion[i].Contains(o.Letter.ToLowerInvariant()) ? "1" : "0",
                q.Rationales.TryGetValue(o.Letter, out var r) ? r : ""))))));
    }

    private static string BuildStoredSignature(Domain.Entities.Exam exam) =>
        string.Join(QuestionSep, exam.Questions.OrderBy(q => q.OrderIndex).Select(q => string.Join(FieldSep,
            q.ExternalId, q.KLevel.ToString(), q.LearningObjective, q.Points.ToString(), q.SelectCount.ToString(),
            q.Stem, q.Diagram ?? "",
            string.Join(OptionSep, q.Options.OrderBy(o => o.OrderIndex).Select(o => string.Join("=",
                o.Label,
                o.Text,
                o.IsCorrect ? "1" : "0",
                o.Rationale ?? ""))))));
}
