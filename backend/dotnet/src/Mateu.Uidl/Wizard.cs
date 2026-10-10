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

    /// <summary>This wizard's built-in affordances (the Redwood guided-process displayOptions): the
    /// draft buttons of an <see cref="IDraftable"/> wizard and the "Skip" button of
    /// <see cref="StepSkippable"/> steps — each On, Off or Disabled. (Java's Wizard.display().)</summary>
    public virtual WizardDisplay Display => WizardDisplay.Defaults;

    /// <summary>Whether the user may SKIP step <paramref name="step"/> (1-based): a "Skip" button
    /// moves on to the next step without requiring that step's fields. Default: no step is
    /// skippable. (Java's Wizard.stepSkippable.)</summary>
    public virtual bool StepSkippable(int step) => false;

    /// <summary>Cancelable hook run BEFORE the wizard moves from step <paramref name="from"/> to
    /// step <paramref name="to"/> (1-based; the state is already bound): Next, Back, Skip, a jump to
    /// a visited step and the completion all pass through it. For a completion, <paramref name="to"/>
    /// is the result step of a <see cref="CompletionActionLabel"/> wizard, or total + 1 for a classic
    /// Finish. Return null to let the move happen; anything else cancels it and becomes the
    /// response (typically an error <see cref="Message"/>). (Java's Wizard.beforeStepNavigate.)</summary>
    public virtual object? BeforeStepNavigate(int from, int to) => null;

    /// <summary>The step (1-based) from which the completion is already offered — beside Next — so a
    /// user with nothing more to add can finish early (the Redwood guided-process availableFromStep,
    /// Java's @WizardCompletionAction(availableFromStep)). The early button dispatches "complete":
    /// a classic wizard runs <see cref="Complete"/>; a <see cref="CompletionActionLabel"/> wizard
    /// runs <see cref="OnNext"/>(current, resultStep) and lands on its result step. Null (default) =
    /// only on the last step.</summary>
    public virtual int? CompletionAvailableFromStep => null;
}
