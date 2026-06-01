using ISTQBuddy.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ISTQBuddy.Infrastructure.Persistence.Configurations;

public class CertificationConfiguration : IEntityTypeConfiguration<Certification>
{
    public void Configure(EntityTypeBuilder<Certification> b)
    {
        b.ToTable("certifications");
        b.HasKey(c => c.Id);
        b.Property(c => c.Code).HasMaxLength(50).IsRequired();
        b.Property(c => c.Name).HasMaxLength(200).IsRequired();
        b.Property(c => c.Version).HasMaxLength(20).IsRequired();
        b.Property(c => c.Slug).HasMaxLength(120).IsRequired();
        b.Property(c => c.Category).HasConversion<string>().HasMaxLength(20);
        b.HasIndex(c => c.Slug).IsUnique();
        b.HasIndex(c => new { c.Code, c.Version }).IsUnique();
    }
}

public class ExamConfiguration : IEntityTypeConfiguration<Exam>
{
    public void Configure(EntityTypeBuilder<Exam> b)
    {
        b.ToTable("exams");
        b.HasKey(e => e.Id);
        b.Property(e => e.Title).HasMaxLength(200).IsRequired();
        b.Property(e => e.Slug).HasMaxLength(120).IsRequired();
        b.Property(e => e.Description).HasMaxLength(1000);
        b.HasIndex(e => e.Slug).IsUnique();

        b.HasOne(e => e.Certification)
            .WithMany(c => c.Exams)
            .HasForeignKey(e => e.CertificationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class QuestionConfiguration : IEntityTypeConfiguration<Question>
{
    public void Configure(EntityTypeBuilder<Question> b)
    {
        b.ToTable("questions");
        b.HasKey(q => q.Id);
        b.Property(q => q.ExternalId).HasMaxLength(20).IsRequired();
        b.Property(q => q.Section).HasMaxLength(40).IsRequired();
        b.Property(q => q.LearningObjective).HasMaxLength(40).IsRequired();
        b.Property(q => q.KLevel).HasConversion<string>().HasMaxLength(4);
        b.Property(q => q.Stem).IsRequired();
        b.Property(q => q.Diagram);

        b.HasIndex(q => new { q.ExamId, q.OrderIndex });
        b.HasIndex(q => new { q.ExamId, q.ExternalId }).IsUnique();

        b.HasOne(q => q.Exam)
            .WithMany(e => e.Questions)
            .HasForeignKey(q => q.ExamId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class QuestionOptionConfiguration : IEntityTypeConfiguration<QuestionOption>
{
    public void Configure(EntityTypeBuilder<QuestionOption> b)
    {
        b.ToTable("question_options");
        b.HasKey(o => o.Id);
        b.Property(o => o.Label).HasMaxLength(4).IsRequired();
        b.Property(o => o.Text).IsRequired();

        b.HasIndex(o => new { o.QuestionId, o.OrderIndex });

        b.HasOne(o => o.Question)
            .WithMany(q => q.Options)
            .HasForeignKey(o => o.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
