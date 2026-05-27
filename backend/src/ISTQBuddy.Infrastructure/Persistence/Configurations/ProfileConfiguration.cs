using ISTQBuddy.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ISTQBuddy.Infrastructure.Persistence.Configurations;

public class ProfileConfiguration : IEntityTypeConfiguration<Profile>
{
    public void Configure(EntityTypeBuilder<Profile> b)
    {
        b.ToTable("profiles");
        b.HasKey(p => p.Id);
        b.Property(p => p.Id).ValueGeneratedNever(); // equals the Supabase auth user id
        b.Property(p => p.Email).HasMaxLength(320).IsRequired();
        b.Property(p => p.DisplayName).HasMaxLength(200);
        b.Property(p => p.Role).HasConversion<string>().HasMaxLength(20);
        b.HasIndex(p => p.Email);
    }
}
