using ISTQBuddy.Application.Attempts;

namespace ISTQBuddy.Application.Tests;

public class AttemptScorerTests
{
    private static readonly Guid A = Guid.NewGuid();
    private static readonly Guid B = Guid.NewGuid();
    private static readonly Guid C = Guid.NewGuid();

    [Fact]
    public void SingleCorrect_AwardsFullPoints()
    {
        var (isCorrect, points) = AttemptScorer.ScoreQuestion([A], [A], 1);
        Assert.True(isCorrect);
        Assert.Equal(1, points);
    }

    [Fact]
    public void SingleWrong_AwardsZero()
    {
        var (isCorrect, points) = AttemptScorer.ScoreQuestion([A], [B], 1);
        Assert.False(isCorrect);
        Assert.Equal(0, points);
    }

    [Fact]
    public void MultiSelect_AllCorrectExactly_AwardsFullPoints()
    {
        var (isCorrect, points) = AttemptScorer.ScoreQuestion([A, B], [B, A], 1);
        Assert.True(isCorrect);
        Assert.Equal(1, points);
    }

    [Fact]
    public void MultiSelect_PartialSelection_AwardsZero_NoPartialCredit()
    {
        var (isCorrect, points) = AttemptScorer.ScoreQuestion([A, B], [A], 1);
        Assert.False(isCorrect);
        Assert.Equal(0, points);
    }

    [Fact]
    public void MultiSelect_IncludesExtraWrong_AwardsZero()
    {
        var (isCorrect, points) = AttemptScorer.ScoreQuestion([A, B], [A, B, C], 1);
        Assert.False(isCorrect);
        Assert.Equal(0, points);
    }

    [Fact]
    public void NoSelection_AwardsZero()
    {
        var (isCorrect, points) = AttemptScorer.ScoreQuestion([A], [], 1);
        Assert.False(isCorrect);
        Assert.Equal(0, points);
    }

    [Theory]
    [InlineData(65, 100, 65, true)]
    [InlineData(64, 100, 65, false)]
    [InlineData(0, 0, 65, false)]
    [InlineData(43, 66, 65, true)]   // 65.1%
    public void IsPass_UsesPassPercentage(int score, int max, int passPct, bool expected)
        => Assert.Equal(expected, AttemptScorer.IsPass(score, max, passPct));
}
