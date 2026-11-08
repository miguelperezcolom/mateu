using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// Wizard branching (Java's Wizard.stepApplies): a step the answers made irrelevant is skipped by
// Next and Back alike, left out of the progress, and when the penultimate step does not apply the
// completion moves to the last step that does.

[UI("wb-loan-wizard"), Title("Loan"), WizardProgress("steps")]
public class WbLoanWizard : Wizard
{
    [Step(1)] public string Medium { get; set; } = "";
    [Step(2)] public string Plinth { get; set; } = "";
    [Step(3)] public string Lender { get; set; } = "";
    [Step(4)] public string Insurer { get; set; } = "";
    [Step(5), PlainText] public string Result { get; set; } = "";

    public override string? CompletionActionLabel => "Request";
    public override Message Complete() => new("requested");

    public override bool StepApplies(int step) => step switch
    {
        2 => Medium == "sculpture",
        4 => Lender == "abroad",
        _ => true,
    };
}

public class WizardBranchingTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private static UIIncrementDto Run(string? actionId, Dictionary<string, object?> state) =>
        new SyncHandler(new MateuRegistry(typeof(WbLoanWizard).Assembly)).Handle(new RunActionRqDto
        {
            Route = "/wb-loan-wizard", ConsumedRoute = "/wb-loan-wizard", ActionId = actionId,
            ServerSideType = typeof(WbLoanWizard).FullName, InitiatorComponentId = "ux_main",
            ComponentState = state, Parameters = [],
        });

    private static Dictionary<string, object?> At(int step, params (string Key, string Value)[] values)
    {
        var state = new Dictionary<string, object?> { ["__step"] = JsonDocument.Parse(step.ToString()).RootElement.Clone() };
        foreach (var (k, v) in values) state[k] = v;
        return state;
    }

    private static IEnumerable<JsonObject> Objects(JsonNode? node)
    {
        switch (node)
        {
            case JsonObject o:
                yield return o;
                foreach (var (_, v) in o)
                    foreach (var x in Objects(v)) yield return x;
                break;
            case JsonArray a:
                foreach (var v in a)
                    foreach (var x in Objects(v)) yield return x;
                break;
        }
    }

    private static List<JsonObject> OfType(UIIncrementDto inc, string type) =>
        Objects(JsonNode.Parse(JsonSerializer.Serialize(inc, Json))).Where(o => (string?)o["type"] == type).ToList();

    private static int Step(UIIncrementDto inc) =>
        Convert.ToInt32(((IDictionary<string, object?>)((ServerSideComponentDto)inc.Fragments[0].Component!)
            .InitialData)["__step"]);

    private static List<string?> ButtonIds(UIIncrementDto inc) =>
        OfType(inc, "Button").Select(b => (string?)b["actionId"]).ToList();

    private static List<string?> BulletIds(UIIncrementDto inc) =>
        OfType(inc, "ProgressSteps")[0]["steps"]!.AsArray().Select(s => (string?)s!["id"]).ToList();

    [Fact]
    public void Next_skips_a_step_that_does_not_apply()
    {
        Assert.Equal(3, Step(Run("next", At(1, ("medium", "painting")))));
        Assert.Equal(2, Step(Run("next", At(1, ("medium", "sculpture")))));
    }

    [Fact]
    public void Back_skips_it_too()
    {
        Assert.Equal(1, Step(Run("back", At(3, ("medium", "painting")))));
        Assert.Equal(2, Step(Run("back", At(3, ("medium", "sculpture")))));
    }

    [Fact]
    public void The_progress_leaves_out_the_steps_that_do_not_apply()
    {
        var inc = Run("next", At(1, ("medium", "painting")));
        Assert.Equal(["step-1", "step-3"], BulletIds(inc));
    }

    [Fact]
    public void The_completion_moves_to_the_last_step_that_applies()
    {
        var inc = Run("next", At(1, ("medium", "painting")));
        var next = OfType(inc, "Button").Single(b => (string?)b["actionId"] == "next");
        Assert.Equal("Request", (string?)next["label"]);
        Assert.Equal(5, Step(Run("next", At(3, ("medium", "painting"), ("lender", "local")))));
    }

    [Fact]
    public void With_every_step_applying_nothing_changes()
    {
        var inc = Run("next", At(3, ("medium", "sculpture"), ("lender", "abroad")));
        Assert.Equal(4, Step(inc));
        Assert.Equal(["step-1", "step-2", "step-3", "step-4"], BulletIds(inc));
        Assert.Contains("back", ButtonIds(inc));
    }
}
