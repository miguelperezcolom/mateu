namespace Mateu.Uidl;

/// <summary>
/// A multi-step form. Properties are assigned to steps with <c>[Step(n)]</c>; the framework renders the
/// current step + a progress bar + Back/Next, and calls <see cref="Complete"/> on the last step.
/// </summary>
public abstract class Wizard
{
    /// <summary>Runs when the user finishes the last step.</summary>
    public abstract Message Complete();
}
