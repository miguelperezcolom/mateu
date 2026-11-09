using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

[UI("md-checkin"), Title("Check-in")]
public class MdCheckIn : MasterDetailView
{
    [Section("Reserva")] public string? Localizador { get; set; }

    [Section("Cliente"), DetailPart(Label = "Cliente", Key = "cliente")] public string? Nombre { get; set; }
    [DetailPart(Key = "cliente")] public string? Email { get; set; }

    [Section("Folios"), DetailPart(Label = "Folios", Key = "folios", Order = 1)] public decimal Saldo { get; set; }

    protected override void Load()
    {
        Localizador = "ABC123";
        Nombre = "Ada";
        Email = "ada@example.com";
        Saldo = 10;
    }

    protected override IReadOnlyList<IComponent> Header() => [new Text("Room 101")];
}

[UI("md-empty")]
public class MdEmpty : MdCheckIn
{
    protected override NoSelection NoSelection => NoSelection.Empty;
    protected override string? Title() => "Empty selection";
}

/// <summary>Master-detail views (Java's MasterDetailView): the master always visible, one detail
/// part at a time chosen from a button bar, with Java's pick → event → reload wire.</summary>
public class MasterDetailViewTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private static readonly SyncHandler Handler = new(new MateuRegistry(typeof(MasterDetailViewTests).Assembly));

    private static UIIncrementDto Run<T>(string route, string actionId, Dictionary<string, object?>? state = null,
        Dictionary<string, object?>? parameters = null) =>
        Handler.Handle(new RunActionRqDto
        {
            Route = route, ConsumedRoute = route, ActionId = actionId, ServerSideType = typeof(T).FullName,
            ComponentState = state ?? new(), Parameters = parameters ?? new(),
        });

    private static JsonObject Component(UIIncrementDto inc) =>
        JsonSerializer.SerializeToNode(inc, Json)!["fragments"]![0]!["component"]!.AsObject();

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

    private static JsonNode Page(JsonObject c) => Objects(c).Single(o => (string?)o["metadata"]?["type"] == "Page")["metadata"]!;

    private static List<string> Fields(JsonObject c) =>
        Objects(c).Where(o => (string?)o["metadata"]?["type"] == "FormField")
            .Select(o => (string)o["metadata"]!["fieldId"]!).ToList();

    [Fact]
    public void The_first_part_is_shown_with_the_master_and_the_bar_selects_it()
    {
        var c = Component(Handler.Handle(new RunActionRqDto { Route = "md-checkin" }));
        var bar = Page(c)["toolbar"]!.AsArray();
        Assert.Equal(["__md_pick:cliente", "__md_pick:folios"], bar.Select(b => (string?)b!["actionId"]));
        Assert.Equal(["primary", "tertiary"], bar.Select(b => (string?)b!["buttonStyle"]));
        var fields = Fields(c);
        Assert.Contains(fields, f => f == "localizador");
        Assert.Contains(fields, f => f == "nombre");
        Assert.DoesNotContain(fields, f => f == "saldo");
        Assert.Contains(Objects(c), o => (string?)o["metadata"]?["text"] == "Room 101");
        var trigger = Assert.Single(c["triggers"]!.AsArray(), t => (string?)t!["type"] == "OnCustomEvent")!;
        Assert.Equal("mateu-md:part-selected", (string?)trigger["eventName"]);
        Assert.Equal("__md_reload", (string?)trigger["actionId"]);
        Assert.Equal("DOCUMENT", (string?)trigger["source"]);
        Assert.Equal(["__md_reload", "__md_pick:cliente", "__md_pick:folios"],
            c["actions"]!.AsArray().Select(a => (string?)a!["id"]).Take(3));
        Assert.Equal("cliente", (string?)c["initialData"]!["_mdPart"]);
    }

    [Fact]
    public void A_pick_emits_the_event_and_the_reload_shows_that_part()
    {
        var pick = Run<MdCheckIn>("md-checkin", "__md_pick:folios");
        var command = Assert.Single(pick.Commands);
        Assert.Equal("DispatchEvent", command.Type);
        Assert.Equal("mateu-md:part-selected", ((CustomEventDto)command.Data!).EventName);

        var reload = Component(Run<MdCheckIn>("md-checkin", "__md_reload",
            new() { ["_mdPart"] = JsonSerializer.SerializeToElement("cliente") },
            new() { ["key"] = JsonSerializer.SerializeToElement("folios") }));
        var fields = Fields(reload);
        Assert.Contains(fields, f => f == "saldo");
        Assert.DoesNotContain(fields, f => f == "nombre");
        Assert.Equal("folios", (string?)reload["initialData"]!["_mdPart"]);
        // the selection persists in the state of later requests
        var again = Component(Run<MdCheckIn>("md-checkin", "", new() { ["_mdPart"] = JsonSerializer.SerializeToElement("folios") }));
        Assert.Contains(Fields(again), f => f == "saldo");
    }

    [Fact]
    public void An_unknown_part_is_refused_and_a_route_opens_on_its_part()
    {
        Assert.ThrowsAny<Exception>(() => Run<MdCheckIn>("md-checkin", "__md_pick:nope"));
        var deep = Component(Handler.Handle(new RunActionRqDto { Route = "/md-checkin/__md/folios", ConsumedRoute = "/md-checkin" }));
        Assert.Contains(Fields(deep), f => f == "saldo");
    }

    [Fact]
    public void No_selection_empty_shows_only_the_master_and_a_custom_title()
    {
        var c = Component(Handler.Handle(new RunActionRqDto { Route = "md-empty" }));
        var fields = Fields(c);
        Assert.DoesNotContain(fields, f => f == "nombre");
        Assert.DoesNotContain(fields, f => f == "saldo");
        Assert.All(Page(c)["toolbar"]!.AsArray(), b => Assert.Equal("tertiary", (string?)b!["buttonStyle"]));
        Assert.Equal("Empty selection", (string?)Page(c)["title"]);
    }
}
