using ISTQBuddy.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ISTQBuddy.Application.Common.Interfaces;

/// <summary>Abstraction over the EF Core context so the Application layer stays persistence-agnostic.</summary>
public interface IAppDbContext
{
    DbSet<Profile> Profiles { get; }
    DbSet<Certification> Certifications { get; }
    DbSet<Exam> Exams { get; }
    DbSet<Question> Questions { get; }
    DbSet<QuestionOption> QuestionOptions { get; }
    DbSet<Attempt> Attempts { get; }
    DbSet<AttemptAnswer> AttemptAnswers { get; }
    DbSet<Entitlement> Entitlements { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
