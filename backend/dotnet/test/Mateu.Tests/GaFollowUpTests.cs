using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// The Java reference's GA follow-ups the port mirrors: a crud entity's TECHNICAL id (Java's
// CrudTechnicalIdSyncTest), an INERT YAML button (YamlInertButtonSyncTest), the template image's
// alt (PageTemplateImageAltTest).

public class TidArtwork
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
}

[UI("tid-artworks"), Title("Artworks")]
public class TidArtworks : Crud<TidArtwork>
{
    public static readonly List<TidArtwork> Store = [];
    public override IEnumerable<TidArtwork> Fetch(string? search) => Store;
    public override TidArtwork? Get(string id) => Store.FirstOrDefault(a => a.Id == id);

    public override void Save(TidArtwork entity)
    {
        if (string.IsNullOrEmpty(entity.Id)) entity.Id = Guid.NewGuid().ToString("N");
        Store.RemoveAll(a => a.Id == entity.Id);
        Store.Add(entity);
    }
}

public class TidSku
{
    [EditableOnlyWhenCreating] public string Id { get; set; } = "";
    public string Title { get; set; } = "";
}

[UI("tid-skus"), Title("SKUs")]
public class TidSkus : Crud<TidSku>
{
    public static readonly List<TidSku> Store = [];
    public override IEnumerable<TidSku> Fetch(string? search) => Store;
    public override TidSku? Get(string id) => Store.FirstOrDefault(s => s.Id == id);

    public override void Save(TidSku entity)
    {
        if (string.IsNullOrEmpty(entity.Id)) entity.Id = "generated";
        Store.RemoveAll(s => s.Id == entity.Id);
        Store.Add(entity);
    }
}

/// <summary>The pattern the manuals taught before the technical-id rule: keyed by an id nobody
/// assigns (GA review 2, B-1).</summary>
[UI("tid-forgetful"), Title("Forgetful")]
public class TidForgetful : Crud<TidArtwork>
{
    public static readonly Dictionary<string, TidArtwork> Store = [];
    public override IEnumerable<TidArtwork> Fetch(string? search) => Store.Values;
    public override TidArtwork? Get(string id) => Store.GetValueOrDefault(id);
    public override void Save(TidArtwork entity) => Store[entity.Id] = entity;
}

/// <summary>A record keyed by a business code, edited in a drawer (Editable without Navigable) —
/// GA round 2, N2/D6.</summary>
public class TidBooking
{
    [Id] public string Code { get; set; } = "";
    public string Guest { get; set; } = "";
    [ReadOnly] public double Total { get; set; }
}

[UI("tid-bookings")]
public class TidBookings : IListing<TidBooking>, IEditable<TidBooking, string>
{
    public static readonly Dictionary<string, TidBooking> Store = [];
    public ListingData<TidBooking> Search(SearchRequest request) => ListingData.From(Store.Values);
    public TidBooking Edit(string id) =>
        Store.TryGetValue(id, out var b) ? new TidBooking { Code = b.Code, Guest = b.Guest, Total = b.Total } : null!;
    public string Save(TidBooking editor)
    {
        Store[editor.Code] = editor;
        return editor.Code;
    }
}

/// <summary>D2: a view model a definition file binds by declaring viewModel: itself.</summary>
[UI("d2-same"), Title("D2")]
public class D2SameView
{
    public double Salary { get; set; } = 100;

    [Button] public Message Pay() => new($"paid {Salary.ToString(System.Globalization.CultureInfo.InvariantCulture)}");
}

public class GaFollowUpTests
{
    private static readonly string D2Specs = WriteD2Specs();

    private static string WriteD2Specs()
    {
        var dir = Directory.CreateTempSubdirectory("ga-d2-").FullName;
        File.WriteAllText(Path.Combine(dir, "d2-same.yaml"), $"""
            viewModel: {typeof(D2SameView).FullName}
            layout:
              type: FormField
              id: salary
              dataType: number
              readOnlyUnless: {"{"}roles: [admin]{"}"}
            """);
        File.WriteAllText(Path.Combine(dir, "d2-hello.yaml"), "layout: {type: Text, text: Hello}\n");
        return dir;
    }

    [Theory]
    [InlineData("d2-same")]
    [InlineData("d2-same/x")]
    [InlineData("nowhere")]
    [InlineData("d2-hello")]
    [InlineData("")]
    public void A_view_model_a_definition_declares_keeps_its_locks_wherever_it_is_named(string route)
    {
        var inc = new SyncHandler(new MateuRegistry(typeof(SimpleForm).Assembly), specsDir: D2Specs).Handle(
            new RunActionRqDto
            {
                Route = route, ServerSideType = typeof(D2SameView).FullName, ActionId = "pay",
                ComponentState = new() { ["salary"] = J(999) },
            });
        Assert.Equal("paid 100", Assert.Single(inc.Messages).Text);
    }

    private const string NoLongerExists =
        "This record no longer exists. Reload the list to see the current records.";

    private static void SeedBookings()
    {
        TidBookings.Store.Clear();
        TidBookings.Store["B-1"] = new TidBooking { Code = "B-1", Guest = "Ana", Total = 120 };
        TidBookings.Store["B-2"] = new TidBooking { Code = "B-2", Guest = "Bob", Total = 80 };
    }

    [Fact]
    public void A_drawer_save_finds_a_record_keyed_by_its_code_and_keeps_its_read_only_values()
    {
        SeedBookings();
        Run(typeof(TidBookings), "tid-bookings", "save",
            new() { ["code"] = J("B-1"), ["guest"] = J("Ana Edited"), ["total"] = J(0) });
        Assert.Equal(("Ana Edited", 120d), (TidBookings.Store["B-1"].Guest, TidBookings.Store["B-1"].Total));
        Assert.Equal(2, TidBookings.Store.Count);
    }

    [Fact]
    public void A_capability_save_of_a_record_that_is_not_stored_is_refused_not_created()
    {
        SeedBookings();
        var refused = Assert.Throws<UserFacingException>(() => Run(typeof(TidBookings), "tid-bookings", "save",
            new() { ["code"] = J("B-9"), ["guest"] = J("Nobody"), ["total"] = J(999) }));
        Assert.Equal(NoLongerExists, refused.Message);
        Assert.False(TidBookings.Store.ContainsKey("B-9"));
    }

    [Fact]
    public void A_capability_save_at_a_record_route_saves_that_record_whatever_id_is_posted()
    {
        // D6: the posted id used to redirect the save to another record carrying this one's values
        SeedBookings();
        Run(typeof(TidBookings), "tid-bookings/B-1/edit", "save",
            new() { ["code"] = J("B-2"), ["guest"] = J("Hijack") });
        Assert.Equal("Bob", TidBookings.Store["B-2"].Guest);
        Assert.Equal("Hijack", TidBookings.Store["B-1"].Guest);
    }

    [Fact]
    public void A_create_whose_typed_id_already_exists_is_refused()
    {
        // N3: built from a creation form it would REPLACE the stored record (Java's text)
        TidSkus.Store.Clear();
        Run(typeof(TidSkus), "tid-skus/new", "create", new() { ["id"] = J("SKU-1"), ["title"] = J("Lamp") });
        var refused = Assert.Throws<UserFacingException>(() =>
            Run(typeof(TidSkus), "tid-skus/new", "create", new() { ["id"] = J("SKU-1"), ["title"] = J("Other") }));
        Assert.Equal("A record with this id already exists. Choose another id, or open the record to edit it.",
            refused.Message);
        Assert.Equal("Lamp", Assert.Single(TidSkus.Store).Title);
    }

    [Fact]
    public void A_crud_save_at_a_route_naming_no_stored_record_is_refused_not_inserted()
    {
        // D7
        TidSkus.Store.Clear();
        var refused = Assert.Throws<UserFacingException>(() =>
            Run(typeof(TidSkus), "tid-skus/NEW-1/edit", "save", new() { ["title"] = J("Inserted") }));
        Assert.Equal(NoLongerExists, refused.Message);
        Assert.Empty(TidSkus.Store);
    }

    [Fact]
    public void Made_up_routes_do_not_grow_the_spec_cache_without_bound()
    {
        // D9: every request route was cached, misses included
        var dir = Directory.CreateTempSubdirectory("mateu-d9").FullName;
        var loader = new YamlSpecLoader(dir);
        for (var i = 0; i < YamlSpecLoader.MaxCachedRoutes + 500; i++)
            Assert.Null(loader.LoadSpec($"nowhere-{i}"));
        Assert.True(loader.CachedRoutes <= YamlSpecLoader.MaxCachedRoutes);
    }

    [Fact]
    public void A_create_the_store_saved_without_an_id_is_told_so_instead_of_saved()
    {
        TidForgetful.Store.Clear();
        var refused = Assert.Throws<UserFacingException>(() =>
            Run(typeof(TidForgetful), "tid-forgetful/new", "create", new() { ["title"] = J("First") }));
        Assert.Equal(
            "The record was saved without an id. The store must assign the id of a new record, or the "
            + "id field must be marked EditableOnlyWhenCreating so the user types it.",
            refused.Message);
    }

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(SimpleForm).Assembly));

    private static JsonElement J(object v) => JsonSerializer.SerializeToElement(v);

    private static UIIncrementDto Run(Type crud, string route, string action, Dictionary<string, object?>? state = null) =>
        Handler().Handle(new RunActionRqDto
        {
            Route = route, ServerSideType = crud.FullName, ActionId = action,
            ComponentState = state ?? new(),
        });

    private static List<string> FieldIds(UIIncrementDto increment)
    {
        var ids = new List<string>();
        void Walk(JsonElement e)
        {
            if (e.ValueKind == JsonValueKind.Object)
            {
                if (e.TryGetProperty("type", out var t) && t.ValueKind == JsonValueKind.String
                    && t.GetString() == "FormField" && e.TryGetProperty("fieldId", out var id))
                    ids.Add(id.GetString() ?? "");
                foreach (var p in e.EnumerateObject()) Walk(p.Value);
            }
            else if (e.ValueKind == JsonValueKind.Array)
                foreach (var i in e.EnumerateArray()) Walk(i);
        }
        Walk(JsonSerializer.SerializeToElement(increment, SyncHandlerTests.JsonOptions));
        return ids;
    }

    [Fact]
    public void A_technical_id_has_no_input_on_the_creation_form_and_is_never_taken_from_a_create()
    {
        TidArtworks.Store.Clear();
        TidArtworks.Store.Add(new TidArtwork { Id = "a1", Title = "Water Lilies" });
        var form = FieldIds(Run(typeof(TidArtworks), "tid-artworks/new", ""));
        Assert.Contains("title", form);
        Assert.DoesNotContain("id", form);
        // a create naming an existing id does not overwrite it: the store assigns a new one
        Run(typeof(TidArtworks), "tid-artworks/new", "create",
            new() { ["id"] = J("a1"), ["title"] = J("Forged") });
        Assert.Equal(2, TidArtworks.Store.Count);
        Assert.Equal("Water Lilies", TidArtworks.Store.Single(a => a.Id == "a1").Title);
    }

    [Fact]
    public void An_id_the_user_chooses_on_create_keeps_its_input()
    {
        TidSkus.Store.Clear();
        var form = FieldIds(Run(typeof(TidSkus), "tid-skus/new", ""));
        Assert.Contains("id", form);
        Assert.Contains("title", form);
        Run(typeof(TidSkus), "tid-skus/new", "create", new() { ["id"] = J("SKU-1"), ["title"] = J("Lamp") });
        Assert.Equal("SKU-1", Assert.Single(TidSkus.Store).Id);
    }

    private static Dictionary<string, string?> ButtonIds(UIIncrementDto increment)
    {
        var ids = new Dictionary<string, string?>();
        void Walk(JsonElement e)
        {
            if (e.ValueKind == JsonValueKind.Object)
            {
                if (e.TryGetProperty("type", out var t) && t.ValueKind == JsonValueKind.String
                    && t.GetString() == "Button" && e.TryGetProperty("label", out var label))
                    ids[label.GetString() ?? ""] = e.TryGetProperty("actionId", out var a) ? a.GetString() : null;
                foreach (var p in e.EnumerateObject()) Walk(p.Value);
            }
            else if (e.ValueKind == JsonValueKind.Array)
                foreach (var i in e.EnumerateArray()) Walk(i);
        }
        Walk(JsonSerializer.SerializeToElement(increment, SyncHandlerTests.JsonOptions));
        return ids;
    }

    private static UIIncrementDto Preview(string yaml) => Handler().Handle(new RunActionRqDto
    {
        ActionId = "__preview__", Route = "", ConsumedRoute = "_empty",
        Parameters = new() { ["_yaml"] = J(yaml) },
    });

    [Fact]
    public void A_yaml_button_with_no_action_carries_no_action_id()
    {
        var ids = ButtonIds(Preview("""
            type: Form
            title: Orders
            toolbar:
              - type: Button
                label: Draft
              - type: Button
                label: Products
                actionable: {type: RouteLink, route: products}
            content:
              - type: Button
                label: Primary
                buttonStyle: primary
              - type: Button
                label: Go
                actionId: go
            """));
        Assert.True(string.IsNullOrEmpty(ids["Primary"]));
        Assert.True(string.IsNullOrEmpty(ids["Draft"]));
        Assert.Equal("go", ids["Go"]);
        // a route button navigates; its id stays the label's echo, as in Java (resolvedActionId)
        Assert.Equal("products", ids["Products"]);
    }

    [Fact]
    public void A_template_image_reads_its_alt_else_the_page_title()
    {
        var avatar = new TemplateImage { Src = "/a.png" };
        Assert.Equal("Luke", PageTemplateLayout.AltOf(avatar, "Luke"));
        Assert.Equal("Portrait", PageTemplateLayout.AltOf(avatar with { Alt = "Portrait" }, "Luke"));
        Assert.Null(PageTemplateLayout.AltOf(avatar, " "));
        var dto = PageTemplateLayout.DtoOf(new ItemOverviewPage { Photo = new TemplateImage { Src = "/p.png", Alt = "Photo" } }, "Luke");
        Assert.Equal("Photo", dto!.Photo!.Alt);
    }
}
