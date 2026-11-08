using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>Wizard branching (Java's Wizard.stepApplies / nextApplicable / previousApplicable):
/// which of a wizard's steps apply given the answers so far. Steps are 1-based; with a
/// CompletionActionLabel the last step is the read-only result, which always applies.</summary>
internal static class WizardBranching
{
    /// <summary>The last step that is not the read-only result screen.</summary>
    public static int LastRegular(Wizard? wizard, int total) =>
        wizard?.CompletionActionLabel is not null ? total - 1 : total;

    public static bool Applies(Wizard? wizard, int step, int total) =>
        wizard is null || step > LastRegular(wizard, total) || wizard.StepApplies(step);

    /// <summary>The regular (non-result) steps that apply, in order.</summary>
    public static List<int> Applicable(Wizard? wizard, int total) =>
        Enumerable.Range(1, Math.Max(0, LastRegular(wizard, total)))
            .Where(i => Applies(wizard, i, total)).ToList();

    /// <summary>The next regular step that applies after <paramref name="current"/>, or null.</summary>
    public static int? Next(Wizard? wizard, int current, int total) =>
        Applicable(wizard, total).Where(i => i > current).Select(i => (int?)i).FirstOrDefault();

    /// <summary>The previous step that applies before <paramref name="current"/>, or null.</summary>
    public static int? Previous(Wizard? wizard, int current, int total) =>
        Applicable(wizard, total).Where(i => i < current).Select(i => (int?)i).LastOrDefault();

    /// <summary>The step whose forward button completes: the penultimate one — or, when it does not
    /// apply, the last regular step that does (Java's WizardButtonBuilder).</summary>
    public static int Completing(Wizard? wizard, int total)
    {
        var steps = Applicable(wizard, total);
        return steps.Count > 0 ? steps[^1] : LastRegular(wizard, total);
    }
}
