using System.ComponentModel.DataAnnotations;
using System.Text.Json.Nodes;
using Mateu.AspNetCore.Testing;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public enum HarnessSize { Small, Large }

/// <summary>A form with the gestures the harness applies: overlays, commands, refusals.</summary>
[UI("harness-actions"), Title("Actions")]
[Trigger(TriggerType.OnValueChange, "changed", PropertyName = "size")]
public class HarnessActions
{
    internal static readonly List<string> Calls = [];

    [Required] public string Name { get; set; } = "Ada";

    [ReadOnly] public string Code { get; set; } = "X-1";

    public HarnessSize Size { get; set; } = HarnessSize.Small;

    [Button] public void Changed() => Calls.Add("changed:" + Size);

    [Button] public Drawer OpenDrawer() => new() { HeaderTitle = "Details", Content = new Text("Inside the drawer") };

    [Button] public Drawer Embed() => new() { HeaderTitle = "Greeting", Content = new EmbeddedView(new HarnessGreeting()) };

    [Button]
    public HarnessActions Rename()
    {
        Name = "Grace";
        return this;
    }

    [Button] public Navigate Go() => new("/harness-target");

    [Button] public CloseOverlay Close() => new();

    [Button] public RunAction Again() => new("ping");

    [Button]
    public Message Ping()
    {
        Calls.Add("ping");
        return Message.Success("pong");
    }

    [Button] public UICommandDto Titled() => new("ux_main", "SetWindowTitle", "A new title");

    [Button] public UICommandDto Pushed() => new("ux_main", "PushStateToHistory", "/harness-actions/pushed");

    [Button] public RunAction Loop() => new("loop");

    [Button] public void Refuse() => throw new UserFacingException("Not now");

    [Button] public void Boom() => throw new InvalidOperationException("a bug");

    [Button, RestAction("https://api.example.com/save")]
    public void Remote() { }

    [Button]
    public Message Echo() => Message.Success("echo " + Name);

    [Button, DisabledUnless(Roles = ["admin"])]
    public Message AdminOnly() => Message.Success("admin");
}

/// <summary>An app shell whose home is the products crud.</summary>
[UI("harness-shell")]
[App("Harness app")]
public class HarnessShell
{
    [MenuItem("Products")] public HarnessProducts Products() => new();

    [MenuItem("Greeting", Group = "More")] public HarnessGreeting Greeting() => new();
}

[UI("harness-target"), Title("Target")]
public class HarnessTarget
{
    public string Note { get; set; } = "arrived";
}

[Collection(nameof(ProcessWideStateCollection))]
public class MateuTestHarnessMoreTests : IDisposable
{
    private readonly MateuTest _mateu;

    public MateuTestHarnessMoreTests()
    {
        HarnessProducts.Reset();
        HarnessActions.Calls.Clear();
        _mateu = MateuTest.Start(_ => { }, null, typeof(HarnessActions).Assembly);
    }

    public void Dispose() => _mateu.Dispose();

    [Fact]
    public void Fields_and_buttons_describe_themselves()
    {
        var screen = _mateu.Open("/harness-actions");
        Assert.Equal("Actions", screen.Title);
        var name = screen.Field("name");
        Assert.True(name.Required);
        Assert.Equal("Ada", name.Text);
        Assert.NotEqual("", name.DataType);
        Assert.Equal("name = Ada", name.ToString());
        Assert.NotNull(name.Stereotype);
        Assert.True(screen.Field("code").ReadOnly);
        Assert.Throws<MateuTestException>(() => screen.Field("code").Set("X-2"));
        Assert.Equal(["Small", "Large"], screen.Field("size").Options.Select(o => o.Label));
        Assert.True(screen.Shows("Ada"));
        Assert.False(screen.Shows("nothing like this"));
        Assert.Equal("Ada", screen.State["name"]!.GetValue<string>());
        Assert.NotEmpty(screen.Component);
        Assert.True(screen.HasButton("openDrawer"));
        Assert.False(screen.HasButton("nope"));
        Assert.Contains("openDrawer", screen.Button("openDrawer").ToString(), StringComparison.OrdinalIgnoreCase);
        Assert.False(screen.HasListing);
        Assert.Empty(screen.Messages);
    }

    [Fact]
    public void A_value_change_runs_the_trigger()
    {
        _mateu.Open("/harness-actions").Field("size").Set(HarnessSize.Large);
        Assert.Equal(["changed:Large"], HarnessActions.Calls);
    }

    [Fact]
    public void A_drawer_opens_and_closes()
    {
        var screen = _mateu.Open("/harness-actions").Button("openDrawer").Press();
        Assert.True(screen.HasOverlay);
        Assert.Equal("Details", screen.OverlayTitle);
        Assert.True(screen.Shows("Inside the drawer"));
        screen.CloseOverlay();
        Assert.False(screen.HasOverlay);
        Assert.Equal("", screen.OverlayTitle);
        Assert.Throws<MateuTestException>(() => screen.CloseOverlay());
        screen.Button("openDrawer").Press();
        screen.Run("close");
        Assert.False(screen.HasOverlay);
    }

    [Fact]
    public void A_view_embedded_in_a_drawer_runs_its_own_actions()
    {
        var screen = _mateu.Open("/harness-actions").Button("embed").Press();
        Assert.True(screen.HasOverlay);
        screen.Field("name").Set("Lin");
        screen.Button("Greet").Press();
        Assert.Equal("Hello Lin!", screen.LastMessage.Text);
    }

    [Fact]
    public void An_action_returning_the_view_updates_its_state()
    {
        var screen = _mateu.Open("/harness-actions").Button("rename").Press();
        Assert.Equal("Grace", screen.Field("name").Text);
        screen.Field("name").Set(new[] { "a", "b" });
        Assert.Equal("[\"a\",\"b\"]", screen.Field("name").Text);
    }

    [Fact]
    public void A_navigation_command_is_followed()
    {
        var screen = _mateu.Open("/harness-actions").Button("go").Press();
        Assert.Equal("/harness-target", screen.Route);
        Assert.Equal("arrived", screen.Field("note").Text);
        Assert.Contains(screen.Commands, c => c.Type == "NavigateTo");
    }

    [Fact]
    public void Commands_are_applied()
    {
        var screen = _mateu.Open("/harness-actions");
        screen.Button("titled").Press();
        Assert.Equal("A new title", screen.Title);
        screen.Button("again").Press();
        Assert.Equal(["ping"], HarnessActions.Calls);
        Assert.Equal("pong", screen.LastMessage.Text);
        Assert.False(screen.LastMessage.IsError);
        Assert.Contains("pong", screen.LastMessage.ToString());
        screen.Button("pushed").Press();
        Assert.Equal("/harness-actions/pushed", screen.Route);
    }

    [Fact]
    public void A_refusal_is_a_message_and_a_bug_is_thrown()
    {
        var screen = _mateu.Open("/harness-actions").Button("refuse").Press();
        Assert.True(screen.LastMessage.IsError);
        Assert.Contains("Not now", screen.LastMessage.Text + screen.LastMessage.Title);
        Assert.ThrowsAny<Exception>(() => screen.Button("boom").Press());
    }

    [Fact]
    public void Loops_and_disabled_buttons_fail()
    {
        var screen = _mateu.Open("/harness-actions");
        var loop = Assert.Throws<MateuTestException>(() => screen.Button("loop").Press());
        Assert.Contains("keeps loading", loop.Message);
        var disabled = _mateu.Open("/harness-actions").Button("adminOnly");
        Assert.False(disabled.Enabled);
        Assert.Throws<MateuTestException>(() => disabled.Press());
        var admin = _mateu.Open("/harness-actions", MateuTest.User("ada", "admin"));
        Assert.Equal("admin", admin.Button("adminOnly").Press().LastMessage.Text);
    }

    [Fact]
    public void Failures_say_what_there_is()
    {
        var screen = _mateu.Open("/harness-target");
        Assert.Throws<MateuTestException>(() => screen.Button("nope"));
        Assert.Throws<MateuTestException>(() => screen.Listing());
        Assert.Throws<MateuTestException>(() => screen.LastMessage);
    }

    [Fact]
    public void Listing_gestures()
    {
        var screen = _mateu.Open("/harness-products");
        var listing = screen.Listing();
        Assert.NotEmpty(listing.Columns);
        Assert.Equal(listing.Columns.Count, listing.ColumnLabels.Count);
        var row = listing.Row(1);
        Assert.Equal("Coffee grinder", row["name"]);
        Assert.Equal(1, row.Index);
        Assert.Contains("Coffee grinder", row.ToString());
        Assert.NotEmpty(row.Values);
        Assert.Throws<MateuTestException>(() => listing.Row(9));
        Assert.Throws<MateuTestException>(() => listing.Row("nothing"));
        screen.Listing().GoToPage(0);
        Assert.Equal(3, screen.Listing().Total);
        screen.Listing().Filter("searchText", "milk");
        Assert.Equal(["Milk frother"], screen.Listing().Rows.Select(r => r["name"]));
        screen.Listing().Search(null);
        Assert.Equal(3, screen.Listing().Total);
    }

    [Fact]
    public void A_record_is_edited_and_rows_are_deleted()
    {
        var screen = _mateu.Open("/harness-products");
        screen.Listing().Row("Milk frother").Open();
        Assert.True(screen.Field("price").ReadOnly);
        screen.Button("Edit").Press();
        screen.Field("price").Set(42.0);
        screen.Button("Save").Press();
        Assert.Equal(42.0, HarnessProducts.Store.Single(p => p.Id == "P-003").Price);
        screen = _mateu.Open("/harness-products");
        screen.Listing().Row("Coffee grinder").Select();
        screen.Button("Delete").Press();
        Assert.DoesNotContain(HarnessProducts.Store, p => p.Id == "P-002");
    }

    [Fact]
    public void Run_sends_parameters_and_a_rest_action_is_not_called()
    {
        var screen = _mateu.Open("/harness-actions");
        // the parameters travel as the wire JSON (a JsonNode as is, an enum by name, null as null)
        screen.Run("echo", new Dictionary<string, object?> { ["word"] = JsonValue.Create("hi"), ["count"] = 2, ["size"] = HarnessSize.Large, ["none"] = null });
        Assert.Equal("echo Ada", screen.LastMessage.Text);
        screen.Run("echo");
        Assert.Equal("echo Ada", screen.LastMessage.Text);
        Assert.Throws<NotSupportedException>(() => screen.Button("remote").Press());
    }

    [Fact]
    public void Page_titles_and_listing_fields()
    {
        Assert.Equal("Target", _mateu.Open("/harness-target").PageTitle);
        var products = _mateu.Open("/harness-products");
        Assert.DoesNotContain(products.Fields, f => f.Id == "status");
        Assert.True(products.HasListing);
    }

    [Fact]
    public void A_shell_opens_on_its_home()
    {
        var screen = _mateu.Open("/harness-shell");
        Assert.Equal(["Products", "More > Greeting"], screen.Menu);
        Assert.Equal(3, screen.Listing().Total);
    }

    [Fact]
    public void The_raw_exchange_answers_the_wire()
    {
        var answer = _mateu.Exchange(new JsonObject
        {
            ["route"] = "/harness-target", ["consumedRoute"] = "_empty", ["actionId"] = "",
        });
        Assert.NotNull(answer["fragments"]);
        var asAdmin = _mateu.Exchange(new JsonObject
        {
            ["route"] = "/harness-greeting", ["consumedRoute"] = "_empty", ["actionId"] = "",
        }, MateuTest.User("ada", "admin"));
        Assert.Contains("only admins", asAdmin.ToJsonString());
        Assert.Equal("ada", MateuTest.User("ada").Identity!.Name);
        Assert.Equal(new MateuCommand("NavigateTo", null), new MateuCommand("NavigateTo", null));
    }
}
