using ISTQBuddy.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ISTQBuddy.Infrastructure.Persistence.Configurations;

public class AttemptConfiguration : IEntityTypeConfiguration<Attempt>
{
    public void Configure(EntityTypeBuilder<Attempt> b)
    {
        b.ToTable("attempts");
        b.HasKey(a => a.Id);
        b.Property(a => a.Status).HasConversion<string>().HasMaxLength(20);
        b.HasIndex(a => new { a.UserId, a.ExamId });

        b.HasOne(a => a.Exam)
            .WithMany()
            .HasForeignKey(a => a.ExamId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class AttemptAnswerConfiguration : IEntityTypeConfiguration<AttemptAnswer>
{
    public void Configure(EntityTypeBuilder<AttemptAnswer> b)
    {
        b.ToTable("attempt_answers");
        b.HasKey(a => a.Id);

        // PostgreSQL native uuid[] column.
        b.Property(a => a.SelectedOptionIds).HasColumnType("uuid[]");

        b.HasIndex(a => new { a.AttemptId, a.QuestionId }).IsUnique();

        b.HasOne(a => a.Attempt)
            .WithMany(at => at.Answers)
            .HasForeignKey(a => a.AttemptId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasOne(a => a.Question)
            .WithMany()
            .HasForeignKey(a => a.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class EntitlementConfiguration : IEntityTypeConfiguration<Entitlement>
{
    public void Configure(EntityTypeBuilder<Entitlement> b)
    {
        b.ToTable("entitlements");
        b.HasKey(e => e.Id);
        b.Property(e => e.Type).HasConversion<string>().HasMaxLength(20);
        b.Property(e => e.Source).HasConversion<string>().HasMaxLength(20);
        b.Property(e => e.ExternalReference).HasMaxLength(200);
        b.HasIndex(e => e.UserId);

        b.HasOne(e => e.Certification)
            .WithMany()
            .HasForeignKey(e => e.CertificationId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
