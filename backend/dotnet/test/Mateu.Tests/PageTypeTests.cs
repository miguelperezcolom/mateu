using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Stubs: one concrete subclass per archetype (mirrors Java's PageTypeResolverSyncTest) ──────

[UI("typed-dashboard"), Title("Board")]
public class TypedDashboard : Dashboard
{
    public MetricCard Revenue { get; } = new() { Title = "Revenue", Value = "1.2" };
}

[UI("typed-welcome"), Title("Welcome")]
public class TypedWelcome : Welcome
{
}

[UI("typed-hero"), Title("Hero")]
public class TypedHeroSearch : HeroSearch<TypedHeroSearch.Hotel>
{
    public class Hotel
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
    }

    public override IEnumerable<Hotel> Fetch(string? search) => [];
}

[UI("typed-smart-search"), Title("Smart")]
public class TypedSmartSearch : SmartSearchPage<TypedSmartSearch.Filters, TypedSmartSearch.Row>
{
    public class Filters
    {
        public string? Name { get; set; }
    }

    public class Row
    {
        public string? Id { get; set; }
    }

    public override IEnumerable<Row> Search(string? searchText, Filters filters) => [];
}

[UI("typed-todos"), Title("Todos")]
public class TypedTodos : TodoList<TypedTodos.Todo>
{
    public record Todo(string Id, string Title, string Bucket);

    protected override IEnumerable<Todo> Rows() => [];

    protected override string? IdOf(Todo row) => row.Id;

    protected override string TitleOf(Todo row) => row.Title;

    protected override string GroupOf(Todo row) => row.Bucket;

    protected override object? ActionOn(Todo row) => null;
}

[UI("typed-calendar"), Title("Calendar")]
public class TypedCalendar : CalendarPage
{
    protected override IReadOnlyList<CalendarEvent> Events(DateOnly month) => [];

    protected override object? ActionOn(CalendarEvent ev) => null;
}

[UI("typed-collection-detail"), Title("Detail")]
public class TypedCollectionDetail : CollectionDetail<TypedCollectionDetail.Row>
{
    public record Row(string Id, string Name);

    protected override IEnumerable<Row> Rows(string? search) => [];

    protected override string? IdOf(Row row) => row.Id;

    protected override string TitleOf(Row row) => row.Name;

    protected override IComponent Detail(Row row) => new Text(row.Name);
}

[UI("typed-wizard"), Title("Wizard")]
public class TypedWizard : Wizard
{
    public override Message Complete() => new("done");
}

[UI("typed-import-wizard"), Title("Import")]
public class TypedImportWizard : ImportWizard<TypedImportWizard.Row>
{
    public class Row
    {
        public string? Name { get; set; }
    }

    protected override void ImportRows(List<Row> rows)
    {
    }
}

[UI("typed-foldout"), Title("Foldout")]
public class TypedFoldout : Foldout
{
    public Text Overview { get; } = new("the record overview");
}

[UI("typed-item-overview"), Title("Item")]
public class TypedItemOverview : ItemOverview
{
}

[UI("typed-general-overview"), Title("Overview")]
public class TypedGeneralOverview : GeneralOverview<TypedGeneralOverview.Row>
{
    public record Row(string Id, string Name);

    protected override IReadOnlyList<Option> SwitcherOptions() => [];

    protected override Row? Load(string id) => null;

    protected override IComponent Overview(Row row) => new Text(row.Name);
}

[UI("typed-crud"), Title("Crud")]
public class TypedCrud : Crud<TypedCrud.Entity>
{
    public class Entity
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
    }

    public override IEnumerable<Entity> Fetch(string? search) => [];
}

[UI("typed-listing"), Title("Listing")]
public class TypedListing : Listing<TypedListing.Filters, TypedListing.Row>
{
    public class Filters
    {
        public string? Name { get; set; }
    }

    public class Row
    {
        public string? Id { get; set; }
    }

    public override IEnumerable<Row> Search(string? searchText, Filters filters) => [];
}

[UI("plain-type-form"), Title("Plain")]
public class PlainTypeForm
{
    public string? Name { get; set; }
}

[UI("kpi-board"), Title("KPIs")]
public class KpiBoard
{
    public MetricCard? Revenue { get; set; }
}

[UI("typed-as-process"), Title("Typed"), PageTemplate(PageType.Process)]
public class TypedAsProcess
{
    public string? Name { get; set; }
}

/// <summary>The page's coarse template type (the Redwood page-template families) travels on the
/// wire and is inferred from the ModelView's shape: archetypes map to their family, a Listing is
/// a collection page, MetricCard fields make a dashboard, a plain reflected form is a form page —
/// and the explicit [PageTemplate] always wins. (Mirror of Java's PageTypeResolverSyncTest.)</summary>
public class PageTypeTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(TypedDashboard).Assembly));

    private static string PageType(string route)
    {
        var increment = Handler().Handle(new RunActionRqDto { Route = route, ConsumedRoute = route });
        foreach (var fragment in increment.Fragments)
            if (fragment.Component is ServerSideComponentDto server)
                return server.PageType!;
        throw new InvalidOperationException("no server side component for " + route);
    }

    [Fact]
    public void Archetypes_map_to_their_template_family()
    {
        Assert.Equal("dashboard", PageType("typed-dashboard"));
        Assert.Equal("landing", PageType("typed-welcome"));
        Assert.Equal("landing", PageType("typed-hero"));
        Assert.Equal("collection", PageType("typed-smart-search"));
        Assert.Equal("collection", PageType("typed-todos"));
        Assert.Equal("collection", PageType("typed-calendar"));
        Assert.Equal("collection", PageType("typed-collection-detail"));
        Assert.Equal("process", PageType("typed-wizard"));
        Assert.Equal("process", PageType("typed-import-wizard"));
        Assert.Equal("detail", PageType("typed-foldout"));
        Assert.Equal("detail", PageType("typed-item-overview"));
        Assert.Equal("detail", PageType("typed-general-overview"));
        Assert.Equal("collection", PageType("typed-crud"));
    }

    [Fact]
    public void A_plain_reflected_form_is_a_form_page()
    {
        Assert.Equal("form", PageType("plain-type-form"));
    }

    [Fact]
    public void The_page_type_travels_on_the_envelope_and_the_page_metadata()
    {
        var json = JsonSerializer.Serialize(
            Handler().Handle(new RunActionRqDto { Route = "plain-type-form", ConsumedRoute = "plain-type-form" }),
            Json);

        // Both the ServerSide envelope and the Page metadata carry the type (Java parity:
        // ServerSideComponentDto.pageType + PageDto.pageType) — hence two occurrences.
        Assert.Equal(2, json.Split("\"pageType\":\"form\"").Length - 1);
    }

    [Fact]
    public void Metric_card_fields_make_a_dashboard()
    {
        Assert.Equal("dashboard", PageType("kpi-board"));
    }

    [Fact]
    public void The_explicit_annotation_wins()
    {
        Assert.Equal("process", PageType("typed-as-process"));
    }

    [Fact]
    public void A_listing_is_a_collection_page()
    {
        Assert.Equal("collection", PageType("typed-listing"));
    }
}
