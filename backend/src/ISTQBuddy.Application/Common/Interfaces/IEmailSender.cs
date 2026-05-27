namespace ISTQBuddy.Application.Common.Interfaces;

/// <summary>Transactional email. Used from Phase 2 onward (e.g. purchase confirmation).</summary>
public interface IEmailSender
{
    Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default);
}
