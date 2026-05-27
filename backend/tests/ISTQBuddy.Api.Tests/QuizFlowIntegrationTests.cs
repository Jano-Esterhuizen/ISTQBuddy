using System.Net;
using System.Net.Http.Json;
using ISTQBuddy.Application.Attempts;
using ISTQBuddy.Domain.Entities;
using ISTQBuddy.Domain.Enums;
using ISTQBuddy.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;

namespace ISTQBuddy.Api.Tests;

public class QuizFlowIntegrationTests(TestWebAppFactory factory) : IClassFixture<TestWebAppFactory>
{
    private record StartResponse(Guid AttemptId, Guid ExamId);

    private async Task<(Guid examId, Guid q1, Guid q1Correct, Guid q2, Guid q2WrongPick)> SeedFreeExamAsync()
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var cert = new Certification { Code = "CTFL", Name = "Foundation", Version = "4.0" };
        var exam = new Exam
        {
            Certification = cert, Title = "Sample Exam A", Slug = "sample-exam-a",
            IsFreeSample = true, PassPercentage = 50, QuestionCount = 2, TotalPoints = 2
        };

        var q1 = new Question { Exam = exam, ExternalId = "1", Section = "main", LearningObjective = "FL-1.1.1", KLevel = KLevel.K1, Points = 1, Stem = "Q1", SelectCount = 1, OrderIndex = 0 };
        var q1a = new QuestionOption { Question = q1, Label = "a", Text = "right", IsCorrect = true, OrderIndex = 0 };
        var q1b = new QuestionOption { Question = q1, Label = "b", Text = "wrong", IsCorrect = false, OrderIndex = 1 };
        q1.Options.Add(q1a); q1.Options.Add(q1b);

        var q2 = new Question { Exam = exam, ExternalId = "2", Section = "main", LearningObjective = "FL-1.2.1", KLevel = KLevel.K2, Points = 1, Stem = "Q2", SelectCount = 1, OrderIndex = 1 };
        var q2a = new QuestionOption { Question = q2, Label = "a", Text = "right", IsCorrect = true, OrderIndex = 0 };
        var q2b = new QuestionOption { Question = q2, Label = "b", Text = "wrong", IsCorrect = false, OrderIndex = 1 };
        q2.Options.Add(q2a); q2.Options.Add(q2b);

        exam.Questions.Add(q1); exam.Questions.Add(q2);
        db.Certifications.Add(cert); db.Exams.Add(exam);
        await db.SaveChangesAsync();

        return (exam.Id, q1.Id, q1a.Id, q2.Id, q2b.Id);
    }

    [Fact]
    public async Task ProtectedEndpoint_IsReachable_WithTestAuth()
    {
        var client = factory.CreateClient();
        var resp = await client.GetAsync("/api/profile/me");
        resp.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task Start_Submit_Result_FlowScoresCorrectly()
    {
        var (examId, q1, q1Correct, q2, q2Wrong) = await SeedFreeExamAsync();
        var client = factory.CreateClient();

        // Start
        var startResp = await client.PostAsJsonAsync("/api/attempts", new { examId });
        Assert.Equal(HttpStatusCode.Created, startResp.StatusCode);
        var start = await startResp.Content.ReadFromJsonAsync<StartResponse>();
        Assert.NotNull(start);

        // Submit: Q1 correct, Q2 wrong -> expect 1 / 2 = 50% -> pass (PassPercentage 50)
        var submit = new SubmitAttemptInput
        {
            Answers =
            [
                new SubmitAnswerInput { QuestionId = q1, SelectedOptionIds = [q1Correct] },
                new SubmitAnswerInput { QuestionId = q2, SelectedOptionIds = [q2Wrong] }
            ]
        };
        var submitResp = await client.PostAsJsonAsync($"/api/attempts/{start!.AttemptId}/submit", submit);
        if (!submitResp.IsSuccessStatusCode)
            Assert.Fail($"Submit failed {(int)submitResp.StatusCode}: {await submitResp.Content.ReadAsStringAsync()}");
        var result = await submitResp.Content.ReadFromJsonAsync<AttemptResultDto>();

        Assert.NotNull(result);
        Assert.Equal(1, result!.Score);
        Assert.Equal(2, result.MaxScore);
        Assert.Equal(50, result.Percentage);
        Assert.True(result.Passed);
        Assert.Contains(result.Questions, q => q.QuestionId == q1 && q.IsCorrect);
        Assert.Contains(result.Questions, q => q.QuestionId == q2 && !q.IsCorrect);
        // Rationale/correctness revealed after submit.
        Assert.All(result.Questions, q => Assert.Contains(q.Options, o => o.IsCorrect));

        // Get result again
        var getResp = await client.GetAsync($"/api/attempts/{start.AttemptId}");
        getResp.EnsureSuccessStatusCode();
        var fetched = await getResp.Content.ReadFromJsonAsync<AttemptResultDto>();
        Assert.Equal(result.Score, fetched!.Score);
    }

    [Fact]
    public async Task LockedExam_ReturnsForbidden_OnStart()
    {
        Guid lockedExamId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var cert = new Certification { Code = "CTFL", Name = "Foundation", Version = "4.0" };
            var exam = new Exam { Certification = cert, Title = "Paid Exam", Slug = $"paid-{Guid.NewGuid()}", IsFreeSample = false, TotalPoints = 0 };
            db.Certifications.Add(cert); db.Exams.Add(exam);
            await db.SaveChangesAsync();
            lockedExamId = exam.Id;
        }

        var client = factory.CreateClient();
        var resp = await client.PostAsJsonAsync("/api/attempts", new { examId = lockedExamId });
        Assert.Equal(HttpStatusCode.Forbidden, resp.StatusCode);
    }
}
