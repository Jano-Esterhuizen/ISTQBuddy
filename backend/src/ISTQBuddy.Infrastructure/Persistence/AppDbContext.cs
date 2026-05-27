using System.Reflection;
using ISTQBuddy.Application.Common.Interfaces;
using ISTQBuddy.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ISTQBuddy.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IAppDbContext
{
    public DbSet<Profile> Profiles => Set<Profile>();
    public DbSet<Certification> Certifications => Set<Certification>();
    public DbSet<Exam> Exams => Set<Exam>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<QuestionOption> QuestionOptions => Set<QuestionOption>();
    public DbSet<Attempt> Attempts => Set<Attempt>();
    public DbSet<AttemptAnswer> AttemptAnswers => Set<AttemptAnswer>();
    public DbSet<Entitlement> Entitlements => Set<Entitlement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        base.OnModelCreating(modelBuilder);
    }
}
