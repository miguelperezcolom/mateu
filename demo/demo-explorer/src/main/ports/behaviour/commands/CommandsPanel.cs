// The C# twin (Mateu.NET): commands are flow steps — Navigate, Announce… (a list returns several).
// The port has no SetWindowTitle step.
using Mateu.Uidl;

[UI("commands"), Title("Commands")]
public class CommandsPanel
{
    [Button("navigateTo")] public FlowStep Navigate() => new Navigate("/behaviour/forms/rules");

    [Button("Announce")]
    public List<FlowStep> Announce() =>
        [new Announce("Three new arrivals"), new Announce("Room 214 is not ready", Assertive: true)];
}
