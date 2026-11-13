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

public class GaFollowUpTests
{
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
