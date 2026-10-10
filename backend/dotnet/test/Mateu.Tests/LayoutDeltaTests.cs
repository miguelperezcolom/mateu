using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>The view model of delta-page.yaml: no [UI] route, so /delta-page falls back to the YAML
/// definition, which binds it and records a delta instead of a layout.</summary>
public class DeltaLogic
{
    public string? Name { get; set; } = "Ada";
    public string? Email { get; set; } = "ada@example.com";
    public string? InternalNote { get; set; } = "hidden";
}

/// <summary><c>layoutDelta:</c> — the .NET mirror of Java's LayoutDeltaTest (uidl),
/// LayoutDeltaApplierTest and LayoutDeltaSpecTest. A delta records what a human decided about the
/// INFERRED layout, anchored to field ids, and is re-applied on every request.</summary>
public class LayoutDeltaTests
{
    private static readonly string SpecsDir = Path.Combine(AppContext.BaseDirectory, "specs", "ui");

    // ── the delta itself ──────────────────────────────────────────────────────

    [Fact]
    public void Fields_the_delta_does_not_mention_keep_their_inferred_place()
    {
        var delta = new LayoutDelta(["email", "name"]);
        Assert.Equal(["email", "name", "age", "phone"], delta.ApplyTo(["name", "email", "age", "phone"]));
    }

    [Fact]
    public void Stale_entries_are_ignored_and_hidden_fields_dropped()
    {
        var delta = new LayoutDelta(["email", "removed", "name"], ["age"]);
        Assert.Equal(["email", "name"], delta.ApplyTo(["name", "email", "age"]));
    }

    [Fact]
    public void Between_records_only_what_differs()
    {
        Assert.True(LayoutDelta.Between(["a", "b", "c"], ["a", "b", "c"]).IsEmpty);
        var hidden = LayoutDelta.Between(["a", "b", "c"], ["a", "c"]);
        Assert.Equal(["b"], hidden.Hidden);
        Assert.Empty(hidden.Order);
        var moved = LayoutDelta.Between(["a", "b"], ["b", "a"]);
        Assert.Equal(["b", "a"], moved.Order);
        Assert.Equal(new LayoutDelta.FieldOverride(), moved.OverrideFor("a"));
    }

    // ── the applier, on wire trees ────────────────────────────────────────────

    private static ClientSideComponentDto Field(string id) =>
        new(new FormFieldMetadataDto(id, "string", id), id, [], null, null, null);

    private static ClientSideComponentDto Inferred(params string[] ids) =>
        new(new FormLayoutMetadataDto(), null, ids.Select(Field).ToList<ComponentDto>(), null, null, null);

    private static IEnumerable<string> IdsOf(ComponentDto c) => c is ClientSideComponentDto client
        ? client.Children.OfType<ClientSideComponentDto>().Select(x => x.Metadata)
            .OfType<FormFieldMetadataDto>().Select(f => f.FieldId)
        : [];

    [Fact]
    public void An_empty_delta_leaves_the_inferred_tree_untouched()
    {
        var tree = Inferred("name", "email", "age");
        Assert.Same(tree, LayoutDeltaApplier.Apply(tree, LayoutDelta.Empty));
    }

    [Fact]
    public void The_order_the_human_chose_is_applied_and_grown_fields_still_appear()
    {
        var delta = new LayoutDelta(["email", "name"]);
        Assert.Equal(["email", "name", "age"], IdsOf(LayoutDeltaApplier.Apply(Inferred("name", "email", "age"), delta)));
        Assert.Equal(["email", "name", "age", "phone"],
            IdsOf(LayoutDeltaApplier.Apply(Inferred("name", "email", "age", "phone"), delta)));
        Assert.Equal(["email", "name"],
            IdsOf(LayoutDeltaApplier.Apply(Inferred("name", "email"), new LayoutDelta(["email", "removed", "name"]))));
    }

    [Fact]
    public void Hidden_fields_are_removed_wherever_they_sit_even_inside_metadata()
    {
        var delta = new LayoutDelta(hidden: ["age"]);
        // a card nests its content in METADATA, not in children — the walk must reach it
        var card = new ClientSideComponentDto(new CardMetadataDto(Inferred("age")), null, [], null, null, null);
        var nested = new ClientSideComponentDto(new VerticalLayoutMetadataDto(), null,
            [Inferred("name"), Inferred("age"), card], null, null, null);

        var applied = (ClientSideComponentDto)LayoutDeltaApplier.Apply(nested, delta);

        Assert.Equal(["name"], IdsOf(applied.Children[0]));
        Assert.Empty(IdsOf(applied.Children[1]));
        Assert.Empty(IdsOf(((CardMetadataDto)((ClientSideComponentDto)applied.Children[2]).Metadata).Content));
    }

    [Fact]
    public void Overrides_are_applied_to_the_field_rather_than_to_a_position()
    {
        var delta = new LayoutDelta(overrides: new Dictionary<string, LayoutDelta.FieldOverride>
        {
            ["name"] = new("Full name", 2),
        });
        var applied = (ClientSideComponentDto)LayoutDeltaApplier.Apply(Inferred("name", "email"), delta);
        var name = (FormFieldMetadataDto)((ClientSideComponentDto)applied.Children[0]).Metadata;
        Assert.Equal("Full name", name.Label);
        Assert.Equal(2, name.Colspan);
        Assert.Equal("email", ((FormFieldMetadataDto)((ClientSideComponentDto)applied.Children[1]).Metadata).Label);
    }

    [Fact]
    public void Non_field_siblings_keep_their_slot_when_fields_are_reordered()
    {
        var tree = new ClientSideComponentDto(new FormLayoutMetadataDto(), null,
            [Field("name"), new ClientSideComponentDto(new TextMetadataDto("a note"), null, [], null, null, null), Field("email")],
            null, null, null);
        var applied = (ClientSideComponentDto)LayoutDeltaApplier.Apply(tree, new LayoutDelta(["email", "name"]));
        Assert.IsType<TextMetadataDto>(((ClientSideComponentDto)applied.Children[1]).Metadata);
        Assert.Equal(["email", "name"], IdsOf(applied));
    }

    // ── the YAML definition, end to end ───────────────────────────────────────

    [Fact]
    public void A_page_can_declare_a_delta_instead_of_a_layout()
    {
        var spec = new YamlSpecLoader(SpecsDir).LoadSpec("delta-page");
        Assert.NotNull(spec);
        Assert.Null(spec!.Layout);
        Assert.Equal(["email", "name"], spec.Delta.Order);
        Assert.Equal(["internalNote"], spec.Delta.Hidden);
        Assert.Equal("Full name", spec.Delta.OverrideFor("name").Label);
        Assert.Equal(2, spec.Delta.OverrideFor("name").Colspan);
        // a page with no delta carries an empty one rather than null
        Assert.True(new YamlSpecLoader(SpecsDir).LoadSpec("partial-page")!.Delta.IsEmpty);
    }

    private static List<JsonObject> RenderedFields()
    {
        var handler = new SyncHandler(new MateuRegistry(typeof(DeltaLogic).Assembly));
        var increment = handler.Handle(new RunActionRqDto { Route = "delta-page", ConsumedRoute = "delta-page" });
        var root = JsonSerializer.SerializeToNode(increment, new JsonSerializerOptions(JsonSerializerDefaults.Web))!;
        var fields = new List<JsonObject>();
        void Walk(JsonNode? node)
        {
            switch (node)
            {
                case JsonObject o:
                    if ((string?)o["type"] == "FormField") fields.Add(o);
                    foreach (var (_, v) in o) Walk(v);
                    break;
                case JsonArray a:
                    foreach (var v in a) Walk(v);
                    break;
            }
        }
        Walk(root["fragments"]);
        return fields;
    }

    [Fact]
    public void The_rendered_page_carries_the_order_omission_and_overrides_the_human_chose()
    {
        var fields = RenderedFields();
        Assert.Equal(["email", "name"], fields.Select(f => (string?)f["fieldId"]));
        Assert.Equal("Full name", (string?)fields[1]["label"]);
        Assert.Equal(2, (int)fields[1]["colspan"]!);
    }
}
