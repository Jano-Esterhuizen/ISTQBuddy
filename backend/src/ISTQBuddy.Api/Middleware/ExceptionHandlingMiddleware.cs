using System.Text.Json;
using FluentValidation;
using ISTQBuddy.Application.Common.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace ISTQBuddy.Api.Middleware;

/// <summary>Translates application exceptions into RFC7807 ProblemDetails responses.</summary>
public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IHostEnvironment env)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            var (status, title) = ex switch
            {
                NotFoundException => (StatusCodes.Status404NotFound, "Resource not found"),
                ForbiddenException => (StatusCodes.Status403Forbidden, "Access denied"),
                BadRequestException => (StatusCodes.Status400BadRequest, "Invalid request"),
                ValidationException => (StatusCodes.Status400BadRequest, "Validation failed"),
                UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "Unauthorized"),
                _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred")
            };

            if (status == StatusCodes.Status500InternalServerError)
                logger.LogError(ex, "Unhandled exception");
            else
                logger.LogInformation("Handled {Type}: {Message}", ex.GetType().Name, ex.Message);

            var problem = new ProblemDetails
            {
                Status = status,
                Title = title,
                Detail = status == StatusCodes.Status500InternalServerError
                    ? (env.IsDevelopment() ? ex.ToString() : "Please try again later.")
                    : ex.Message
            };

            if (ex is ValidationException ve)
                problem.Extensions["errors"] = ve.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());

            context.Response.StatusCode = status;
            context.Response.ContentType = "application/problem+json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(problem));
        }
    }
}
