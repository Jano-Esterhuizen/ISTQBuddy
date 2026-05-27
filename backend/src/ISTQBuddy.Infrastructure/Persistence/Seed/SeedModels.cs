namespace ISTQBuddy.Infrastructure.Persistence.Seed;

/// <summary>Root of sample-exam-a.json. Mirrors the source question-bank shape.</summary>
public class SeedFile
{
    public SeedCertification Certification { get; set; } = new();
    public SeedExam Exam { get; set; } = new();
    public List<SeedQuestion> Questions { get; set; } = new();
}

public class SeedCertification
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
}

public class SeedExam
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsFreeSample { get; set; }
    public int PassPercentage { get; set; } = 65;
}

public class SeedQuestion
{
    public string Id { get; set; } = string.Empty;        // -> ExternalId
    public string Section { get; set; } = string.Empty;
    public string Lo { get; set; } = string.Empty;        // -> LearningObjective
    public string KLevel { get; set; } = "K1";
    public int Points { get; set; } = 1;
    public string Stem { get; set; } = string.Empty;
    public int SelectCount { get; set; } = 1;
    public List<SeedOption> Options { get; set; } = new();
    public List<string> Correct { get; set; } = new();    // option letters
    public Dictionary<string, string> Rationales { get; set; } = new();
}

public class SeedOption
{
    public string Letter { get; set; } = string.Empty;    // -> Label
    public string Text { get; set; } = string.Empty;
}
