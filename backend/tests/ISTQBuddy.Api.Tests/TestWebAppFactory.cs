using System.Security.Claims;
using System.Text.Encodings.Web;
using ISTQBuddy.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ISTQBuddy.Api.Tests;

/// <summary>Authenticates every request as a fixed test user (sub = <see cref="UserId"/>).</summary>
public class TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public new const string Scheme = "Test";
    public static readonly Guid UserId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, UserId.ToString()),
            new Claim(ClaimTypes.Email, "test@istqbuddy.dev")
        };
        var identity = new ClaimsIdentity(claims, Scheme);
        var ticket = new AuthenticationTicket(new ClaimsPrincipal(identity), Scheme);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}

public class TestWebAppFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = $"itest-{Guid.NewGuid()}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                // Satisfy AddInfrastructure; the real provider is swapped below.
                ["ConnectionStrings:Default"] = "Host=localhost;Database=test;Username=x;Password=x",
                ["Supabase:Url"] = "",
                ["Database:ApplyMigrationsOnStartup"] = "false",
                ["Database:SeedOnStartup"] = "false"
            });
        });

        builder.ConfigureServices(services =>
        {
            // Replace the Npgsql DbContext with an in-memory one. Use an isolated internal
            // service provider so the still-registered Npgsql provider services aren't used
            // (avoids the "multiple database providers" conflict).
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.RemoveAll<AppDbContext>();

            var inMemoryProvider = new ServiceCollection()
                .AddEntityFrameworkInMemoryDatabase()
                .BuildServiceProvider();

            services.AddDbContext<AppDbContext>(o => o
                .UseInMemoryDatabase(_dbName)
                .UseInternalServiceProvider(inMemoryProvider));

            // Force the test auth scheme as the default.
            services.AddAuthentication(o =>
            {
                o.DefaultAuthenticateScheme = TestAuthHandler.Scheme;
                o.DefaultChallengeScheme = TestAuthHandler.Scheme;
            }).AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.Scheme, _ => { });
        });
    }
}
