using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>An adapted order whose adapter reads every JSON scalar kind back from the state.</summary>
[UI("encargo")]
public class Encargo
{
    public string? Name = "Vino";
    public long Units = 1;
    public double Price = 9.5;
    public bool Urgent;
    public string? Note = "initial";
    public JsonElement? Extra;

    internal Encargo Confirmar() => this; // the model itself: re-render the island
    internal object? Recalcular() => null; // nothing to answer: re-render the island
}

public class EncargoAdapter : ComponentAdapter<Encargo>
{
    public static readonly System.Collections.Concurrent.ConcurrentQueue<Encargo> Seen = new();

    public override AdaptedView Adapt(Encargo e) => AdaptedView.Of(
        new Text($"{e.Name} x{e.Units} @ {e.Price} urgent={e.Urgent} note={e.Note ?? "none"}"),
        new Dictionary<string, object?> { ["name"] = e.Name, ["units"] = e.Units },
        ["confirmar", "recalcular", "anular"]); // "anular" has no model method

    public override Encargo Deserialize(IReadOnlyDictionary<string, object?> state)
    {
        var e = new Encargo();
        if (state.TryGetValue("name", out var n)) e.Name = (string?)n;
        if (state.TryGetValue("units", out var u)) e.Units = (long)u!;
        if (state.TryGetValue("price", out var p)) e.Price = (double)p!;
        if (state.TryGetValue("urgent", out var g)) e.Urgent = (bool)g!;
        if (state.TryGetValue("note", out var t)) e.Note = (string?)t;
        if (state.TryGetValue("extra", out var x)) e.Extra = (JsonElement?)x;
        Seen.Enqueue(e);
        return e;
    }
}

/// <summary>
/// The state round trip of islands: an adapted island's state reaches its adapter as plain CLR
/// scalars (long, double, bool, null — objects stay JSON), its declared actions re-render it in
/// place, and an embedded island's markers survive however the client spelled them.
/// </summary>
public class IslandRoundTripTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private static readonly SyncHandler Handler = new(new MateuRegistry(typeof(IslandRoundTripTests).Assembly));

    private static JsonElement J(object? v) => JsonSerializer.SerializeToElement(v);

    private static UIIncrementDto Run(string action, Dictionary<string, object?> state) => Handler.Handle(new RunActionRqDto
    {
        Route = "encargo", ConsumedRoute = "encargo", ActionId = action, ServerSideType = typeof(Encargo).FullName,
        ComponentState = state,
    });

    [Theory]
    [InlineData("confirmar")]
    [InlineData("recalcular")]
    public void The_adapter_gets_typed_scalars_and_the_action_re_renders_the_island(string action)
    {
        var marker = Guid.NewGuid().ToString();
        var inc = Run(action, new()
        {
            ["name"] = J(marker), ["units"] = J(12), ["price"] = J(3.25), ["urgent"] = J(true),
            ["note"] = J(null), ["extra"] = J(new { a = 1 }),
        });
        var model = Assert.Single(EncargoAdapter.Seen, e => e.Name == marker && e.Note is null);
        Assert.Equal(12L, model.Units);
        Assert.Equal(3.25, model.Price);
        Assert.True(model.Urgent);
        Assert.Equal(1, model.Extra!.Value.GetProperty("a").GetInt32());
        var json = JsonSerializer.Serialize(inc, Json);
        Assert.Contains($"{marker} x12 @ ", json);
        Assert.Contains("urgent=True note=none", json);
        Assert.Empty(inc.Messages);
    }

    [Fact]
    public void A_false_flag_round_trips_as_false()
    {
        var marker = Guid.NewGuid().ToString();
        Run("confirmar", new() { ["name"] = J(marker), ["urgent"] = J(false) });
        Assert.False(Assert.Single(EncargoAdapter.Seen, e => e.Name == marker).Urgent);
    }

    [Fact]
    public void A_declared_action_without_a_model_method_is_refused()
    {
        var e = Assert.Throws<MateuForbiddenException>(() => Run("anular", new()));
        Assert.Contains("no such action", e.Message);
    }

    [Theory]
    [InlineData("1")]
    [InlineData("true")]
    public void Island_markers_restored_as_text_still_load_the_island_without_chrome(string spelled)
    {
        var inc = Handler.Handle(new RunActionRqDto
        {
            Route = "/documento?_embeddedMediator=1&_inline=1&other=x",
            ConsumedRoute = "/documento?_embeddedMediator=1",
            ComponentState = new()
            {
                ["_embeddedMediator"] = J(spelled),
                ["_inline"] = spelled, // a plain string, as a host-side seed carries it
            },
        });
        Assert.Empty(inc.Commands); // an island never retitles the browser window
        var component = JsonSerializer.SerializeToNode(inc, Json)!["fragments"]![0]!["component"]!;
        Assert.Equal(typeof(DocumentoView).FullName, (string?)component["serverSideType"]);
        Assert.Null(component["initialData"]!["other"]); // only the island markers fold into the state
    }

    [Fact]
    public void A_marker_the_state_says_is_off_keeps_the_page_chrome()
    {
        var inc = Handler.Handle(new RunActionRqDto
        {
            Route = "/documento", ConsumedRoute = "/documento",
            ComponentState = new() { ["_embeddedMediator"] = J(0), ["_inline"] = false },
        });
        Assert.NotEmpty(inc.Commands); // a standalone page sets the window title
    }
}
