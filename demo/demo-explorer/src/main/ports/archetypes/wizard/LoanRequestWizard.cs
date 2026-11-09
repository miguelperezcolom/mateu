// The C# twin (Mateu.NET): steps are NUMBERED [Step(n)] properties of the wizard itself; the hooks
// are StepSkippable, BeforeStepNavigate, IDraftable and the completion members (CompletionActionLabel,
// CompletionAvailableFromStep, OnNext into the result step). No StepApplies (branching) hook in .NET
// yet: the insurance step always shows, so its insurer is not required here.
using System.ComponentModel.DataAnnotations;
using Mateu.Uidl;

[UI("wizard"), Title("Request a loan"), WizardProgress("rail")]
public class LoanRequestWizard : Wizard, IDraftable
{
    public enum Scope { National, International }

    [Step(1), Required] public string Artwork { get; set; } = "Water Lilies";
    [Step(1)] public Scope LoanScope { get; set; } = Scope.National;

    [Step(2), Required] public string? Institution { get; set; }
    [Step(2)] public string? ContactEmail { get; set; }

    [Step(3)] public string? Insurer { get; set; }
    [Step(3)] public string? PolicyNumber { get; set; }

    [Step(4)] public string? Notes { get; set; }

    [Step(5), PlainText] public string Result { get; set; } = "";

    public override string? StepTitle(int step) => step switch
    {
        1 => "Artwork", 2 => "Borrower", 3 => "Insurance", 4 => "Notes", 5 => "Done", _ => null,
    };

    public override bool StepSkippable(int step) => step == 4;

    public override object? BeforeStepNavigate(int from, int to) =>
        from == 2 && Institution?.Contains("blocked", StringComparison.OrdinalIgnoreCase) == true
            ? new Message("That institution is not on the lenders' register", MessageVariant.Error)
            : null;

    public object? SaveDraft() => new Message($"Draft saved for “{Artwork}”", MessageVariant.Success);

    public override string? CompletionActionLabel => "Send request";
    public override string CompletionActionId => "send";
    public override int? CompletionAvailableFromStep => 4;

    public override void OnNext(int from, int to)
    {
        if (to == 5) Result = $"Request sent: “{Artwork}” to {Institution}.";
    }

    public override Message Complete() => new(Result, MessageVariant.Success);
}
