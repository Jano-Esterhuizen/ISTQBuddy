using ISTQBuddy.Application.Common.Interfaces;
using ISTQBuddy.Infrastructure.Auth;
using ISTQBuddy.Infrastructure.Email;
using ISTQBuddy.Infrastructure.Persistence;
using ISTQBuddy.Infrastructure.Persistence.Seed;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ISTQBuddy.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        var connectionString = config.GetConnectionString("Default")
            ?? throw new InvalidOperationException("Missing connection string 'Default'.");

        services.AddDbContext<AppDbContext>(options =>
            options
                .UseNpgsql(connectionString, npgsql => npgsql.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName))
                // Loading questions + their options in one query is intentional: on a high-latency
                // link a single round-trip beats split queries. Silence the default warning.
                .ConfigureWarnings(w => w.Ignore(RelationalEventId.MultipleCollectionIncludeWarning)));

        services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());

        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, CurrentUser>();

        services.AddHttpClient<IEmailSender, ResendEmailSender>();

        services.AddScoped<CatalogSeeder>();
        services.AddScoped<ExamSeeder>();
        services.AddScoped<AccessGrantSeeder>();

        return services;
    }
}
