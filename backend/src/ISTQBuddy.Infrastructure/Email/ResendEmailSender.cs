using System.Net.Http.Headers;
using System.Net.Http.Json;
using ISTQBuddy.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ISTQBuddy.Infrastructure.Email;

/// <summary>
/// Thin Resend client over its REST API (no SDK dependency, so it's resilient to SDK churn).
/// If no API key is configured it logs and no-ops — keeps local/dev flows working without secrets.
/// </summary>
public class ResendEmailSender(HttpClient http, IConfiguration config, ILogger<ResendEmailSender> logger) : IEmailSender
{
    public async Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default)
    {
        var apiKey = config["Resend:ApiKey"];
        var from = config["Resend:FromAddress"] ?? "ISTQBuddy <onboarding@resend.dev>";

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            logger.LogWarning("Resend API key not configured; skipping email to {To} ({Subject}).", to, subject);
            return;
        }

        http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        var resp = await http.PostAsJsonAsync("https://api.resend.com/emails",
            new { from, to = new[] { to }, subject, html = htmlBody }, ct);

        if (!resp.IsSuccessStatusCode)
        {
            var body = await resp.Content.ReadAsStringAsync(ct);
            logger.LogError("Resend send failed ({Status}): {Body}", resp.StatusCode, body);
        }
    }
}
