using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ISTQBuddy.Infrastructure.Persistence;

/// <summary>
/// Lets `dotnet ef` build the model and generate/apply migrations without the API's DI.
/// `migrations add` needs no live DB; for `database update` set ISTQBUDDY_MIGRATIONS_CONNECTION
/// to the Supabase DIRECT connection (port 5432), not the pooler (6543).
/// </summary>
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("ISTQBUDDY_MIGRATIONS_CONNECTION")
            ?? "Host=localhost;Port=5432;Database=istqbuddy;Username=postgres;Password=postgres";

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(connectionString, npgsql => npgsql.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName))
            .Options;

        return new AppDbContext(options);
    }
}
