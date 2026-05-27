using ISTQBuddy.Application.Attempts;
using ISTQBuddy.Application.Common.Interfaces;
using ISTQBuddy.Application.Entitlements;
using ISTQBuddy.Application.Exams;
using ISTQBuddy.Application.Profiles;
using Microsoft.Extensions.DependencyInjection;

namespace ISTQBuddy.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IEntitlementService, EntitlementService>();
        services.AddScoped<IExamService, ExamService>();
        services.AddScoped<IAttemptService, AttemptService>();
        services.AddScoped<IProfileService, ProfileService>();
        return services;
    }
}
