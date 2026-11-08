using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public class VtbLoan
{
    public string Id { get; set; } = "";
    public string? Title { get; set; }
    public bool Returned { get; set; }
}

[UI("vtb-loans")]
public class VtbLoans : Crud<VtbLoan>
{
    public static readonly List<VtbLoan> Store = [new() { Id = "L1", Title = "Dune" }];

    public override IEnumerable<VtbLoan> Fetch(string? search) => Store;
    public override VtbLoan? Get(string id) => Store.FirstOrDefault(l => l.Id == id);

    /// <summary>Acts on the store and only SAYS something: the view reloads with the message.</summary>
    [ViewToolbarButton, Toolbar("Return loan", ButtonStyle = "primary")]
    public Message ReturnLoan(VtbLoan loan)
    {
        lock (Store) Get(loan.Id)!.Returned = true;
        return new Message($"returned {loan.Title}");
    }

    /// <summary>Answers the record itself: the view re-renders with it.</summary>
    [ViewToolbarButton(ConfirmationRequired = false)]
    public VtbLoan Preview(VtbLoan loan) => new() { Id = loan.Id, Title = loan.Title + " (preview)" };

    /// <summary>Anything else maps as any action result.</summary>
    [ViewToolbarButton]
    public string Open() => "/elsewhere";

    /// <summary>Not a view toolbar button: never reachable as action-on-view-*.</summary>
    public string Secret() => "/secret";
}

/// <summary>[ViewToolbarButton] (Java's @ViewToolbarButton): a crud method on its record view's
/// toolbar, run as action-on-view-&lt;method&gt; on the record shown.</summary>
public class ViewToolbarButtonTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private static readonly SyncHandler Handler = new(new MateuRegistry(typeof(ViewToolbarButtonTests).Assembly));

    private static UIIncrementDto Run(string action) => Handler.Handle(new RunActionRqDto
    {
        Route = "vtb-loans/L1", ConsumedRoute = "vtb-loans", ActionId = action,
        ServerSideType = typeof(VtbLoans).FullName, InitiatorComponentId = "page",
        ComponentState = new() { ["id"] = JsonSerializer.SerializeToElement("L1"), ["title"] = JsonSerializer.SerializeToElement("Dune") },
    });

    private static JsonObject Component(UIIncrementDto inc) =>
        JsonSerializer.SerializeToNode(inc, Json)!["fragments"]![0]!["component"]!.AsObject();

    private static JsonNode PageMeta(JsonObject c) =>
        c["children"]![0]!["metadata"]!;

    [Fact]
    public void The_view_page_leads_its_toolbar_with_the_view_toolbar_buttons_and_advertises_them()
    {
        var c = Component(Handler.Handle(new RunActionRqDto { Route = "vtb-loans/L1", ConsumedRoute = "vtb-loans" }));
        var toolbar = PageMeta(c)["toolbar"]!.AsArray();
        Assert.Equal(["action-on-view-returnLoan", "action-on-view-preview", "action-on-view-open", "cancel-view", "edit"],
            toolbar.Select(b => (string?)b!["actionId"]));
        Assert.Equal("Return loan", (string?)toolbar[0]!["label"]);
        Assert.Equal("primary", (string?)toolbar[0]!["buttonStyle"]);
        var actions = c["actions"]!.AsArray();
        var returnLoan = actions.Single(a => (string?)a!["id"] == "action-on-view-returnLoan")!;
        Assert.True((bool)returnLoan["confirmationRequired"]!);
        Assert.False((bool)actions.Single(a => (string?)a!["id"] == "action-on-view-preview")!["confirmationRequired"]!);

        // not on the edit page
        var edit = Component(Handler.Handle(new RunActionRqDto { Route = "vtb-loans/L1/edit", ConsumedRoute = "vtb-loans" }));
        Assert.DoesNotContain(PageMeta(edit)["toolbar"]!.AsArray(), b => ((string?)b!["actionId"])!.StartsWith("action-on-view-"));
    }

    [Fact]
    public void A_message_answer_reloads_the_record_with_it()
    {
        var inc = Run("action-on-view-returnLoan");
        Assert.Equal("returned Dune", Assert.Single(inc.Messages).Text);
        var c = Component(inc);
        Assert.True((bool)c["initialData"]!["returned"]!);
        Assert.Equal("page", inc.Fragments[0].TargetComponentId);
    }

    [Fact]
    public void A_record_answer_re_renders_the_view_with_it_and_anything_else_maps()
    {
        Assert.Equal("Dune (preview)", (string?)Component(Run("action-on-view-preview"))["initialData"]!["title"]);
        Assert.Contains(Run("action-on-view-open").Commands, c => c.Type == "NavigateTo");
    }

    [Fact]
    public void A_method_that_is_no_view_toolbar_button_is_not_an_action()
    {
        Assert.ThrowsAny<Exception>(() => Run("action-on-view-secret"));
    }
}
