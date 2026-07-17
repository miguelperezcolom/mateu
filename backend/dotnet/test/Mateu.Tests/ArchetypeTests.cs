using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

[UI("hotel-directory"), Title("Hotels")]
public class HotelDirectory : CollectionDetail<HotelDirectory.Hotel>
{
    public record Hotel(string Id, string Name, string City, int Rooms);

    public static readonly List<Hotel> Hotels =
    [
        new("h1", "Riu Palace", "Palma", 350),
        new("h2", "Riu Plaza", "Madrid", 500),
        new("h3", "Riu Playa", "Cancún", 420),
    ];

    protected override IEnumerable<Hotel> Rows(string? search) =>
        string.IsNullOrWhiteSpace(search)
            ? Hotels
            : Hotels.Where(h => (h.Name + " " + h.City).Contains(search, StringComparison.OrdinalIgnoreCase));

    protected override string? IdOf(Hotel row) => row.Id;

    protected override string TitleOf(Hotel row) => row.Name;

    protected override string? CaptionOf(Hotel row) => row.City;

    protected override IComponent Detail(Hotel row) =>
        new EntityHeader { Title = row.Name, Subtitle = row.City };
}

[UI("requisition-overview"), Title("Requisitions")]
public class RequisitionOverview : GeneralOverview<RequisitionOverview.Requisition>
{
    public record Requisition(string Id, string Title, string Unit);

    public static readonly List<Requisition> All =
    [
        new("r1", "Requisition 204", "Vision Operations"),
        new("r2", "Requisition 205", "Vision Services"),
    ];

    protected override IReadOnlyList<Option> SwitcherOptions() =>
        All.Select(r => new Option(r.Id, r.Title)).ToList();

    protected override Requisition? Load(string id) => All.FirstOrDefault(r => r.Id == id);

    protected override IComponent Overview(Requisition row) =>
        new EntityHeader { Title = row.Title, Facts = [new Fact { Label = "Business Unit", Value = row.Unit }] };
}

/// <summary>The CollectionDetail / GeneralOverview archetypes (Redwood "Collection Detail" and
/// "General Overview" templates), built on the fluent FormField primitive — mirroring Java's
/// CollectionDetailSyncTest / GeneralOverviewSyncTest.</summary>
public class ArchetypeTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(HotelDirectory).Assembly));

    private static string Render(UIIncrementDto inc) => JsonSerializer.Serialize(inc, Json);

    private static UIIncrementDto Run(string route, Type type, string? actionId,
        Dictionary<string, object?>? state = null, Dictionary<string, object?>? parameters = null) =>
        Handler().Handle(new RunActionRqDto
        {
            Route = route, ActionId = actionId, ServerSideType = type.FullName,
            InitiatorComponentId = "ux_main",
            ComponentState = state ?? [], Parameters = parameters ?? [],
        });

    private static JsonElement Val(string json) => JsonDocument.Parse(json).RootElement;

    [Fact]
    public void Collection_detail_renders_the_search_field_the_list_and_the_empty_detail()
    {
        var json = Render(Run("/hotel-directory", typeof(HotelDirectory), null));
        Assert.Contains("\"type\":\"FormField\"", json);
        Assert.Contains("\"fieldId\":\"search\"", json);
        Assert.Contains("\"type\":\"TaskQueue\"", json);
        Assert.Contains("Riu Palace", json);
        Assert.Contains("3 items", json);
        Assert.Contains("\"type\":\"EmptyState\"", json);
        // the state round-trips and typing re-filters through the AutoSave trigger
        Assert.Contains("\"type\":\"AutoSave\"", json);
        Assert.Contains("\"actionId\":\"filterCollection\"", json);
    }

    [Fact]
    public void Selecting_an_item_renders_its_detail_and_marks_the_card()
    {
        var json = Render(Run("/hotel-directory", typeof(HotelDirectory), "selectCollectionItem",
            parameters: new Dictionary<string, object?> { ["_item"] = Val("\"h2\"") }));
        Assert.Contains("\"type\":\"EntityHeader\"", json);
        Assert.Contains("Riu Plaza", json);
        Assert.Contains("\"selected\":true", json);
        Assert.DoesNotContain("\"type\":\"EmptyState\"", json);
        // the selection survives the response: it rides in initialData
        Assert.Contains("\"selectedId\":\"h2\"", json);
    }

    [Fact]
    public void Typing_in_the_search_box_filters_the_list()
    {
        var json = Render(Run("/hotel-directory", typeof(HotelDirectory), "filterCollection",
            state: new Dictionary<string, object?> { ["search"] = Val("\"cancún\"") }));
        Assert.Contains("Riu Playa", json);
        Assert.DoesNotContain("Riu Palace", json);
        Assert.Contains("1 items", json);
    }

    [Fact]
    public void General_overview_selects_the_first_record_and_renders_the_switcher()
    {
        var json = Render(Run("/requisition-overview", typeof(RequisitionOverview), null));
        Assert.Contains("\"fieldId\":\"record\"", json);
        Assert.Contains("Requisition 205", json);   // in the switcher options
        Assert.Contains("\"type\":\"EntityHeader\"", json);
        Assert.Contains("Vision Operations", json); // the FIRST record's overview
        Assert.Contains("\"record\":\"r1\"", json); // initialData carries the selection
    }

    [Fact]
    public void Switching_the_record_re_renders_the_overview_in_place()
    {
        var json = Render(Run("/requisition-overview", typeof(RequisitionOverview), "switchRecord",
            state: new Dictionary<string, object?> { ["record"] = Val("\"r2\"") }));
        Assert.Contains("Vision Services", json);
        Assert.DoesNotContain("Vision Operations", json);
        Assert.Empty(Run("/requisition-overview", typeof(RequisitionOverview), "switchRecord",
            state: new Dictionary<string, object?> { ["record"] = Val("\"r2\"") }).Commands
            .Where(c => c.Type == "NavigateTo"));
    }
}
