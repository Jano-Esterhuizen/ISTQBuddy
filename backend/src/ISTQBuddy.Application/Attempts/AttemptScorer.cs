namespace ISTQBuddy.Application.Attempts;

/// <summary>
/// Pure scoring rules, isolated for unit testing. Scoring rule (per plan):
/// a question scores full points only when the selected set exactly equals the
/// correct set (all correct chosen, no incorrect chosen); otherwise zero. No partial credit.
/// </summary>
public static class AttemptScorer
{
    public static (bool IsCorrect, int PointsAwarded) ScoreQuestion(
        IEnumerable<Guid> correctOptionIds,
        IEnumerable<Guid> selectedOptionIds,
        int points)
    {
        var correct = correctOptionIds.ToHashSet();
        var selected = selectedOptionIds.ToHashSet();

        var isCorrect = correct.Count > 0 && correct.SetEquals(selected);
        return (isCorrect, isCorrect ? points : 0);
    }

    public static bool IsPass(int score, int maxScore, int passPercentage)
    {
        if (maxScore <= 0) return false;
        var pct = (double)score / maxScore * 100d;
        return pct >= passPercentage;
    }
}
