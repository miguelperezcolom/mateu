namespace Mateu.Uidl;

/// <summary>
/// A multi-step form. Properties are assigned to steps with <c>[Step(n)]</c>; the framework renders the
/// current step + a progress bar + Back/Next, and calls <see cref="Complete"/> on the last step.
/// </summary>
public abstract class Wizard
{
    /// <summary>Runs when the user finishes the last step.</summary>
    public abstract Message Complete();

    /// <summary>Runs when the user moves FORWARD from step <paramref name="from"/> to step
    /// <paramref name="to"/> (both 1-based), after the state has been bound and before the target
    /// step renders — the hook archetypes like the import wizard use to compute a step's content
    /// from the previous steps' answers. Default: no-op.</summary>
    public virtual void OnNext(int from, int to) { }
}
