using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

[UI("envelope-actions"), Title("Actions")]
public class ActionKnobsPage
{
    public string? Name { get; set; }

    [Button, ActionOptions(Background = true, Sse = true, ConfirmationRequired = true,
        ConfirmationTitle = "Sure?", ConfirmationMessage = "This sends it", ConfirmationText = "Send",
        ConfirmationDenialText = "Keep")]
    public void Send() { }

    [Button, ActionOptions(Href = "https://example.com/help")]
    public void Help() { }

    [Button, ActionOptions(Js = "console.log(1)")]
    public void Log() { }

    [Button, ActionOptions(CustomEventName = "order-picked", CustomEventDetail = "42")]
    public void Pick() { }
}

[App("Branded", AccentColor = " #0a6 ", AskLabel = "Ask", AskIcon = "vaadin:chat", Layout = "SPLIT",
    Style = "background: #fff;", CssClasses = "branded")]
[Logo("/logo.svg"), FavIcon("/favicon.ico"), DrawerClosed, NoBreadcrumbs]
public class BrandedApp
{
    [MenuItem("Things")] public Things Home() => new();

    [Fab("vaadin:plus", "New order", 1)] public void NewOrder() { }

    [Fab("vaadin:search", order: 0), Label("Find")] public void Find() { }
}

public class HiddenThing
{
    [HiddenInCreate] public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    [HiddenInList, HiddenInEditor] public string Secret { get; set; } = "s";
    [HiddenInView] public string Draft { get; set; } = "d";
    [MainFilter] public string Category { get; set; } = "";
}

[UI("hidden-things"), Title("Hidden things")]
public class HiddenThings : Crud<HiddenThing>
{
    public static readonly List<HiddenThing> Store = [];

    public override IEnumerable<HiddenThing> Fetch(string? search) => Store;
    public override HiddenThing? Get(string id) => Store.FirstOrDefault(g => g.Id == id);
    public override void Save(HiddenThing thing)
    {
        if (string.IsNullOrEmpty(thing.Id)) thing.Id = "h" + (Store.Count + 1);
        Store.RemoveAll(g => g.Id == thing.Id);
        Store.Add(thing);
    }
}

[UI("section-extras"), Title("Sections")]
[FormLayout(Columns = 2)]
public class SectionExtrasForm
{
    [Section("Guests", Sticky = true)] public string? Lead { get; set; }
    [Section("Stay", Columns = 1, Style = "gap: 0;")] public string? Room { get; set; }
    public string? Nights { get; set; }
}

/// <summary>The envelope members that used to be Java-only: ActionDto knobs ([ActionOptions]),
/// DialogDto placement (dialog-placement case), AppDto presentation, CrudlDto presentation
/// (ListingComponent), FormFieldDto.mainFilter, [HiddenIn*] and [Section(Sticky, Columns, Style)].</summary>
public class EnvelopeMembersTests
{
    private static readonly JsonSerializerOptions Web = new(JsonSerializerDefaults.Web);

    private static UIIncrementDto Load(Type view, string route = "", string actionId = "",
        Dictionary<string, object?>? state = null) =>
        new SyncHandler(new MateuRegistry(view.Assembly)).Handle(new RunActionRqDto
        {
            Route = route, ConsumedRoute = route, ServerSideType = view.FullName, ActionId = actionId,
            InitiatorComponentId = "c1", Parameters = new(), ComponentState = state ?? new(),
        });

    private static string Json(object o) => JsonSerializer.Serialize(o, Web);

    private static ActionDto ActionOf(UIIncrementDto inc, string id) =>
        ((ServerSideComponentDto)inc.Fragments[0].Component!).Actions.Single(a => a.Id == id);

    [Fact]
    public void Action_options_reach_the_wire()
    {
        var inc = Load(typeof(ActionKnobsPage));
        var send = ActionOf(inc, "send");
        Assert.True(send.Background);
        Assert.True(send.Sse);
        Assert.True(send.ConfirmationRequired);
        Assert.Equal(new ConfirmationTextsDto("Sure?", "This sends it", "Send", "Keep"), send.ConfirmationTexts);
        Assert.Equal("https://example.com/help", ActionOf(inc, "help").Href);
        Assert.Equal("console.log(1)", ActionOf(inc, "log").Js);
        Assert.Equal(new CustomEventDto("order-picked", "42"), ActionOf(inc, "pick").CustomEvent);
        // an action declaring none keeps them off the wire
        var json = Json(ActionOf(inc, "help"));
        Assert.DoesNotContain("confirmationTexts", json);
        Assert.DoesNotContain("customEvent", json);
        Assert.DoesNotContain("background", json);
    }

    [Fact]
    public void A_dialog_carries_its_placement()
    {
        var meta = Assert.IsType<DialogMetadataDto>(ComponentMapper.Map(new Dialog
        {
            HeaderTitle = "Notes", Top = "4rem", Left = "2rem", Draggable = true, Resizable = true,
        }).Metadata);
        Assert.Equal(("4rem", "2rem", true, true), (meta.Top, meta.Left, meta.Draggable, meta.Resizable));
    }

    [Fact]
    public void The_app_shell_carries_its_presentation()
    {
        var meta = Assert.IsType<AppMetadataDto>(((ClientSideComponentDto)Load(typeof(BrandedApp)).Fragments[0].Component!).Metadata);
        Assert.Equal("#0a6", meta.AccentColor);
        Assert.Equal(("Ask", "vaadin:chat"), (meta.AskLabel, meta.AskIcon));
        Assert.Equal("SPLIT", meta.Layout);
        Assert.Equal(("/logo.svg", "/favicon.ico"), (meta.Logo, meta.Favicon));
        Assert.True(meta.DrawerClosed);
        Assert.True(meta.NoBreadcrumbs);
        Assert.Equal(("background: #fff;", "branded"), (meta.Style, meta.CssClasses));
        Assert.Equal(["find", "newOrder"], meta.Fabs.Select(f => f.ActionId));
        Assert.Equal(["Find", "New order"], meta.Fabs.Select(f => f.Label));
    }

    [Fact]
    public void A_plain_app_keeps_the_defaults()
    {
        var meta = Assert.IsType<AppMetadataDto>(((ClientSideComponentDto)Load(typeof(LocaleApp)).Fragments[0].Component!).Metadata);
        Assert.Equal("SINGLE_SLOT", meta.Layout);
        Assert.Null(meta.AccentColor);
        Assert.False(meta.DrawerClosed);
        Assert.Empty(meta.Fabs);
    }

    [Fact]
    public void A_listing_component_carries_its_table_presentation()
    {
        var meta = Assert.IsType<CrudMetadataDto>(ComponentMapper.Map(new ListingComponent
        {
            RowStripes = true, ColumnBorders = true, WrapCellContent = true, AllRowsVisible = true,
            NoBorder = true, NoRowBorder = true, ColumnReorderingAllowed = true, InfiniteScrolling = true,
            LazyLoading = true, MultipleRowSelectionEnabled = true, OnRowSelectionChangedActionId = "picked",
            GridStyle = "height: 20rem;", ContentHeight = "30rem",
        }).Metadata);
        Assert.True(meta.RowStripes && meta.ColumnBorders && meta.WrapCellContent && meta.AllRowsVisible
                    && meta.NoBorder && meta.NoRowBorder && meta.ColumnReorderingAllowed && meta.InfiniteScrolling
                    && meta.LazyLoading && meta.MultipleRowSelectionEnabled);
        Assert.Equal(("picked", "height: 20rem;", "30rem"), (meta.OnRowSelectionChangedActionId, meta.GridStyle, meta.ContentHeight));
        Assert.DoesNotContain("rowStripes", Json(ComponentMapper.Map(new ListingComponent())));
    }

    [Fact]
    public void Yaml_listings_read_the_table_presentation()
    {
        var listing = Assert.IsType<ListingComponent>(YamlComponentBuilder.Parse("""
            type: Listing
            rowStripes: true
            gridStyle: "height: 10rem;"
            """));
        Assert.True(listing.RowStripes);
        Assert.Equal("height: 10rem;", listing.GridStyle);
    }

    private static List<string> FieldIds(UIIncrementDto inc)
    {
        var ids = new List<string>();
        void Walk(JsonElement e)
        {
            if (e.ValueKind == JsonValueKind.Object)
            {
                if (e.TryGetProperty("type", out var t) && t.GetString() == "FormField"
                    && e.TryGetProperty("fieldId", out var f)) ids.Add(f.GetString()!);
                foreach (var p in e.EnumerateObject()) Walk(p.Value);
            }
            else if (e.ValueKind == JsonValueKind.Array) foreach (var x in e.EnumerateArray()) Walk(x);
        }
        Walk(JsonDocument.Parse(Json(inc)).RootElement);
        return ids;
    }

    private static List<string> ColumnIds(UIIncrementDto inc)
    {
        var json = JsonDocument.Parse(Json(inc)).RootElement;
        var ids = new List<string>();
        void Walk(JsonElement e)
        {
            if (e.ValueKind == JsonValueKind.Object)
            {
                if (e.TryGetProperty("type", out var t) && t.GetString() == "GridColumn"
                    && e.TryGetProperty("id", out var f)) ids.Add(f.GetString()!);
                foreach (var p in e.EnumerateObject()) Walk(p.Value);
            }
            else if (e.ValueKind == JsonValueKind.Array) foreach (var x in e.EnumerateArray()) Walk(x);
        }
        Walk(json);
        return ids;
    }

    [Fact]
    public void Hidden_in_list_drops_the_column_and_main_filter_marks_the_filter()
    {
        HiddenThings.Store.Clear();
        var all = Json(Load(typeof(HiddenThings), "/hidden-things"));
        Assert.DoesNotContain("\"secret\"", Json(ColumnIds(Load(typeof(HiddenThings), "/hidden-things"))));
        Assert.Contains("\"name\"", Json(ColumnIds(Load(typeof(HiddenThings), "/hidden-things"))));
        Assert.Contains("\"mainFilter\":true", all);
    }

    [Fact]
    public void Each_form_hides_what_it_declares()
    {
        HiddenThings.Store.Clear();
        HiddenThings.Store.Add(new HiddenThing { Id = "h1", Name = "One" });
        var create = FieldIds(Load(typeof(HiddenThings), "/hidden-things/new"));
        var edit = FieldIds(Load(typeof(HiddenThings), "/hidden-things/h1/edit"));
        var view = FieldIds(Load(typeof(HiddenThings), "/hidden-things/h1"));
        Assert.DoesNotContain("id", create);
        Assert.Contains("secret", create);
        Assert.DoesNotContain("secret", edit);
        Assert.Contains("draft", edit);
        Assert.DoesNotContain("draft", view);
        Assert.Contains("secret", view);
    }

    [Fact]
    public void A_save_does_not_take_a_field_its_form_hid()
    {
        HiddenThings.Store.Clear();
        HiddenThings.Store.Add(new HiddenThing { Id = "h1", Name = "One", Secret = "kept" });
        Load(typeof(HiddenThings), "/hidden-things/h1/edit", "save", new()
        {
            ["id"] = JsonSerializer.SerializeToElement("h1"),
            ["name"] = JsonSerializer.SerializeToElement("Renamed"),
            ["secret"] = JsonSerializer.SerializeToElement("forged"),
        });
        var saved = HiddenThings.Store.Single();
        Assert.Equal(("Renamed", "kept"), (saved.Name, saved.Secret));
    }

    [Fact]
    public void Sections_can_be_sticky_have_their_own_columns_and_style()
    {
        var json = Json(Load(typeof(SectionExtrasForm)));
        Assert.Contains("\"cssClasses\":\"mateu-section mateu-section--sticky\"", json);
        Assert.Contains("position: sticky; top: var(--mateu-sticky-top, 0.5rem); z-index: 2;", json);
        Assert.Contains("\"style\":\"gap: 0;\"", json);
        // Guests inherits the form's 2 columns, Stay forces 1
        var doc = JsonDocument.Parse(json).RootElement;
        var maxColumns = new List<int>();
        void Walk(JsonElement e)
        {
            if (e.ValueKind == JsonValueKind.Object)
            {
                if (e.TryGetProperty("type", out var t) && t.GetString() == "FormLayout"
                    && e.TryGetProperty("maxColumns", out var m)) maxColumns.Add(m.GetInt32());
                foreach (var p in e.EnumerateObject()) Walk(p.Value);
            }
            else if (e.ValueKind == JsonValueKind.Array) foreach (var x in e.EnumerateArray()) Walk(x);
        }
        Walk(doc);
        Assert.Equal([2, 1], maxColumns);
    }
}
