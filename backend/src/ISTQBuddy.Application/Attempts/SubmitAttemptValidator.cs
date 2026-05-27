using FluentValidation;

namespace ISTQBuddy.Application.Attempts;

public class SubmitAttemptValidator : AbstractValidator<SubmitAttemptInput>
{
    public SubmitAttemptValidator()
    {
        RuleFor(x => x.Answers).NotNull();

        RuleForEach(x => x.Answers).ChildRules(a =>
        {
            a.RuleFor(x => x.QuestionId).NotEmpty();
            a.RuleFor(x => x.SelectedOptionIds).NotNull();
        });
    }
}
