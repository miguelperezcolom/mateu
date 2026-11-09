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

    /// <summary>The action id the completion button dispatches (Java: the name of the
    /// <c>@WizardCompletionAction</c> method, e.g. <c>signUp</c>). Moving forward from the
    /// completion step with it is the completion; <c>"next"</c> (the default) keeps working there
    /// too.</summary>
    public virtual string CompletionActionId => "next";

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

    /// <summary>Whether step <paramref name="step"/> (1-based) applies given the answers so far: a
    /// step that does not is skipped by Next and Back alike and left out of the progress; when the
    /// penultimate step does not apply, the completion moves to the last step that does. The result
    /// step always applies. Default: every step applies. (Java's Wizard.stepApplies.)</summary>
    public virtual bool StepApplies(int step) => true;

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

    /// <summary>The completion of a <see cref="CompletionActionLabel"/> wizard as a STREAMED task
    /// (Java: a <c>@WizardCompletionAction</c> returning a Flux, typically a LongTask): when
    /// non-null, completing runs this task INSTEAD of <see cref="OnNext"/> — its progress streams
    /// live (the completion action is advertised over SSE) and, once it is over, the wizard lands
    /// on its result step, built then, so it shows whatever the work set while it ran. A task that
    /// yields an error <see cref="Message"/> (or fails) leaves the wizard on the step instead.
    /// Called on every completion, so answer null to complete the ordinary way. Null (default):
    /// no stream. EXPERIMENTAL.</summary>
    public virtual LongTaskRun? StreamedCompletion() => null;
}
