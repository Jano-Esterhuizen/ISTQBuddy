using ISTQBuddy.Domain.Common;

namespace ISTQBuddy.Domain.Entities;

/// <summary>A certification track (e.g. CTFL v4.0). Future-proofs multiple certifications.</summary>
public class Certification : BaseEntity
{
    public string Code { get; set; } = string.Empty;   // e.g. "CTFL"
    public string Name { get; set; } = string.Empty;   // e.g. "Certified Tester Foundation Level"
    public string Version { get; set; } = string.Empty; // e.g. "4.0"

    public ICollection<Exam> Exams { get; set; } = new List<Exam>();
}
