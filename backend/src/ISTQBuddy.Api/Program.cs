using System.Security.Claims;
using FluentValidation;
using ISTQBuddy.Api.Middleware;
using ISTQBuddy.Application;
using ISTQBuddy.Infrastructure;
using ISTQBuddy.Infrastructure.Persistence;
using ISTQBuddy.Infrastructure.Persistence.Seed;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// --- Application + Infrastructure ---
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddValidatorsFromAssemblyContaining<ISTQBuddy.Application.Attempts.SubmitAttemptValidator>();

// --- Supabase JWT (asymmetric, validated via JWKS / OIDC discovery) ---
var supabaseUrl = builder.Configuration["Supabase:Url"]?.TrimEnd('/');
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        if (!string.IsNullOrWhiteSpace(supabaseUrl))
        {
            var authority = $"{supabaseUrl}/auth/v1";
            options.Authority = authority;
            options.MetadataAddress = $"{authority}/.well-known/openid-configuration";
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = authority,
                ValidateAudience = true,
                ValidAudience = "authenticated",
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                NameClaimType = ClaimTypes.NameIdentifier,
                ClockSkew = TimeSpan.FromSeconds(30)
            };
        }
    });
builder.Services.AddAuthorization();

// --- CORS ---
// Dev: allow any localhost origin (the Next.js dev port varies: 3000, 3100, ...).
// Prod: lock to the configured origins (e.g. the Vercel domain).
const string CorsPolicy = "frontend";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:3000"];
builder.Services.AddCors(o => o.AddPolicy(CorsPolicy, p =>
{
    p.AllowAnyHeader().AllowAnyMethod();
    if (builder.Environment.IsDevelopment())
        p.SetIsOriginAllowed(origin =>
            new Uri(origin).Host is "localhost" or "127.0.0.1");
    else
        p.WithOrigins(allowedOrigins);
}));

// --- Swagger with bearer auth ---
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ISTQBuddy API", Version = "v1" });
    var scheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste a Supabase access token (no 'Bearer ' prefix).",
        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
    };
    c.AddSecurityDefinition("Bearer", scheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement { [scheme] = [] });
});

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(CorsPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

await ApplyStartupTasksAsync(app);

app.Run();

// --- Startup migrate + seed (opt-in via config) ---
static async Task ApplyStartupTasksAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

    if (config.GetValue<bool>("Database:ApplyMigrationsOnStartup"))
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();
    }

    if (config.GetValue<bool>("Database:SeedOnStartup"))
    {
        // Catalog first so exams can link to their certification.
        await scope.ServiceProvider.GetRequiredService<CatalogSeeder>().SeedAsync();
        await scope.ServiceProvider.GetRequiredService<ExamSeeder>().SeedAsync();
    }
}

// Exposed for WebApplicationFactory in integration tests.
public partial class Program;
