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

    /// <summary>Opt-in result step (Java's <c>@WizardCompletionAction</c> + result step): when
    /// non-null, the PENULTIMATE step's forward button carries this label and moving forward from it
    /// is the completion (<see cref="OnNext"/> runs it), and the LAST step is a read-only result
    /// screen with no navigation buttons and a full progress bar — there is no way back into a
    /// completed run. Null (default): the classic Back/Next…Finish → <see cref="Complete"/>.</summary>
    public virtual string? CompletionActionLabel => null;

    /// <summary>The label of step <paramref name="step"/> (1-based) on the step bullets / rail;
    /// null keeps "Step N".</summary>
    public virtual string? StepTitle(int step) => null;

    /// <summary>The wizard's heading; null keeps the [Title] (else the humanized class name).</summary>
    public virtual string? WizardTitle => null;
}
