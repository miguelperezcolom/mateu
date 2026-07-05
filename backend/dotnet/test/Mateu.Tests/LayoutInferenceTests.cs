using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Fixtures (mirrors the Java LayoutInferenceSyncTest fixtures) ──────────────

public enum InferSize { Small, Medium, Large }

public enum InferWeekday { Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday }

/// <summary>Light form: inference enabled but under every threshold — must stay a plain flat form.</summary>
[UI("infer/small"), AutoLayout]
public class SmallAutoForm
{
    [Required] public string? Name { get; set; } = "n";
    public string? Nickname { get; set; } = "nick";
    public string? City { get; set; } = "c";
}

/// <summary>Heavy unstructured editable form: required stays visible, optionals fold away.</summary>
[UI("infer/fold"), AutoLayout]
public class HeavyAutoForm
{
    [Required] public string? Name { get; set; } = "n";
    [Required] public string? Email { get; set; } = "e";
    [Required] public string? Phone { get; set; } = "p";
    [Multiline] public string? Notes1 { get; set; }
    [Multiline] public string? Notes2 { get; set; }
    [Multiline] public string? Notes3 { get; set; }
    [Multiline] public string? Notes4 { get; set; }
    public string? Extra1 { get; set; }
    public string? Extra2 { get; set; }
}

/// <summary>Same shape as <see cref="HeavyAutoForm"/> but no [AutoLayout]: previous behaviour.</summary>
[UI("infer/fold-off")]
public class HeavyPlainForm
{
    [Required] public string? Name { get; set; } = "n";
    [Required] public string? Email { get; set; } = "e";
    [Required] public string? Phone { get; set; } = "p";
    [Multiline] public string? Notes1 { get; set; }
    [Multiline] public string? Notes2 { get; set; }
    [Multiline] public string? Notes3 { get; set; }
    [Multiline] public string? Notes4 { get; set; }
    public string? Extra1 { get; set; }
    public string? Extra2 { get; set; }
}

[UI("infer/enums"), AutoLayout]
public class AutoEnumForm
{
    public InferSize Size { get; set; } = InferSize.Medium;
    public InferWeekday Day { get; set; } = InferWeekday.Monday;
}

[UI("infer/enums-off")]
public class PlainEnumForm
{
    public InferSize Size { get; set; } = InferSize.Medium;
    [UseRadioButtons] public InferWeekday Day { get; set; } = InferWeekday.Monday;
}

/// <summary>Heavy read-only view with many substantial sections: presented as adaptable tabs.</summary>
[UI("infer/tabs"), AutoLayout, ReadOnly]
public class ReadOnlySectionsView
{
    [Section("Uno"), Multiline] public string? A1 { get; set; } = "x";
    [Multiline] public string? A2 { get; set; } = "x";
    [Section("Dos"), Multiline] public string? B1 { get; set; } = "x";
    [Multiline] public string? B2 { get; set; } = "x";
    [Section("Tres"), Multiline] public string? C1 { get; set; } = "x";
    [Multiline] public string? C2 { get; set; } = "x";
    [Section("Cuatro"), Multiline] public string? D1 { get; set; } = "x";
    [Multiline] public string? D2 { get; set; } = "x";
    [Section("Cinco"), Multiline] public string? E1 { get; set; } = "x";
    [Multiline] public string? E2 { get; set; } = "x";
}

/// <summary>Same as <see cref="ReadOnlySectionsView"/> but editable: hiding groups could hide
/// invalid required fields, so the sections stay stacked.</summary>
[UI("infer/tabs-editable"), AutoLayout]
public class EditableSectionsForm
{
    [Section("Uno"), Multiline] public string? A1 { get; set; } = "x";
    [Multiline] public string? A2 { get; set; } = "x";
    [Section("Dos"), Multiline] public string? B1 { get; set; } = "x";
    [Multiline] public string? B2 { get; set; } = "x";
    [Section("Tres"), Multiline] public string? C1 { get; set; } = "x";
    [Multiline] public string? C2 { get; set; } = "x";
    [Section("Cuatro"), Multiline] public string? D1 { get; set; } = "x";
    [Multiline] public string? D2 { get; set; } = "x";
    [Section("Cinco"), Multiline] public string? E1 { get; set; } = "x";
    [Multiline] public string? E2 { get; set; } = "x";
}

/// <summary>Developer-declared tabs on an inferring class: respected, and marked adaptable.</summary>
[UI("infer/devtabs"), AutoLayout]
public class AutoDevTabsForm
{
    [Tab("Uno")] public string? First { get; set; } = "1";
    [Tab("Dos")] public string? Second { get; set; } = "2";
}

[UI("infer/devtabs-off")]
public class PlainDevTabsForm
{
    [Tab("Uno")] public string? First { get; set; } = "1";
    [Tab("Dos")] public string? Second { get; set; } = "2";
}

// ── Tests (mirrors the Java LayoutInferenceSyncTest assertions) ───────────────

/// <summary>[AutoLayout] inference: fold-optionals (required fields visible, optionals collapsed
/// into a "More options" accordion), sections-to-tabs on heavy read-only views (with the editable
/// escape hatch), small-enum-as-radio (plus the [UseRadioButtons] override), and the
/// groupRelationship/adaptable semantic hints on the tab layout wire DTO — asserted on the JSON a
/// real sync request produces, and asserting classes WITHOUT [AutoLayout] keep the previous
/// behaviour. Ported from the Java LayoutInferenceSyncTest (the behavioural spec).</summary>
public class LayoutInferenceTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(SmallAutoForm).Assembly));

    private static JsonElement RenderView(Type viewType) =>
        JsonSerializer.SerializeToElement(
            Handler().Handle(new RunActionRqDto { ServerSideType = viewType.FullName }), Json);

    // ── fold optionals ─────────────────────────────────────────────────────────

    [Fact]
    public void Light_auto_form_stays_flat()
    {
        var root = RenderView(typeof(SmallAutoForm));

        Assert.Null(ComponentOfType(root, "AccordionLayout"));
        Assert.Null(ComponentOfType(root, "TabLayout"));
        Assert.Equal(new List<string> { "name", "nickname", "city" }, FieldIds(root));
    }

    [Fact]
    public void Heavy_auto_form_folds_optional_fields_into_a_more_options_panel()
    {
        var root = RenderView(typeof(HeavyAutoForm));

        var accordion = ComponentOfType(root, "AccordionLayout");
        Assert.NotNull(accordion);
        var panel = Assert.Single(accordion.Value.GetProperty("children").EnumerateArray());
        Assert.Equal("AccordionPanel", panel.GetProperty("metadata").GetProperty("type").GetString());
        Assert.Equal("More options", panel.GetProperty("metadata").GetProperty("label").GetString());
    }

    [Fact]
    public void Required_fields_stay_visible_and_optional_fields_fold_away()
    {
        var root = RenderView(typeof(HeavyAutoForm));

        var accordion = ComponentOfType(root, "AccordionLayout")!;
        Assert.Equal(
            new SortedSet<string> { "notes1", "notes2", "notes3", "notes4", "extra1", "extra2" },
            new SortedSet<string>(FieldIds(accordion.Value)));

        // every field still reaches the wire exactly once — folding regroups, never drops
        Assert.Equal(
            new SortedSet<string>
            {
                "name", "email", "phone", "notes1", "notes2", "notes3", "notes4", "extra1", "extra2",
            },
            new SortedSet<string>(FieldIds(root)));
        Assert.Equal(9, FieldIds(root).Count);
    }

    [Fact]
    public void Without_auto_layout_the_heavy_form_keeps_the_previous_flat_behaviour()
    {
        var root = RenderView(typeof(HeavyPlainForm));

        Assert.Null(ComponentOfType(root, "AccordionLayout"));
        Assert.Equal(9, FieldIds(root).Count);
    }

    // ── enums ──────────────────────────────────────────────────────────────────

    [Fact]
    public void Small_enum_renders_as_radio_buttons_under_auto_layout() =>
        Assert.Equal("radio", Stereotype(RenderView(typeof(AutoEnumForm)), "size"));

    [Fact]
    public void Large_enum_keeps_the_dropdown_under_auto_layout() =>
        Assert.Equal("select", Stereotype(RenderView(typeof(AutoEnumForm)), "day"));

    [Fact]
    public void Without_auto_layout_enums_keep_the_dropdown() =>
        Assert.Equal("select", Stereotype(RenderView(typeof(PlainEnumForm)), "size"));

    [Fact]
    public void UseRadioButtons_forces_radio_regardless_of_size_and_auto_layout() =>
        Assert.Equal("radio", Stereotype(RenderView(typeof(PlainEnumForm)), "day"));

    // ── sections → tabs ────────────────────────────────────────────────────────

    [Fact]
    public void Heavy_read_only_sections_become_adaptable_tabs()
    {
        var root = RenderView(typeof(ReadOnlySectionsView));

        var tabLayout = ComponentOfType(root, "TabLayout");
        Assert.NotNull(tabLayout);
        var metadata = tabLayout.Value.GetProperty("metadata");
        Assert.True(metadata.GetProperty("adaptable").GetBoolean());
        Assert.Equal("alternative", metadata.GetProperty("groupRelationship").GetString());

        var labels = tabLayout.Value.GetProperty("children").EnumerateArray()
            .Select(tab => tab.GetProperty("metadata").GetProperty("label").GetString()).ToList();
        Assert.Equal(new List<string?> { "Uno", "Dos", "Tres", "Cuatro", "Cinco" }, labels);
    }

    [Fact]
    public void Every_section_field_survives_the_tabs_presentation()
    {
        var root = RenderView(typeof(ReadOnlySectionsView));

        Assert.Equal(
            new SortedSet<string> { "a1", "a2", "b1", "b2", "c1", "c2", "d1", "d2", "e1", "e2" },
            new SortedSet<string>(FieldIds(root)));
        Assert.Equal(10, FieldIds(root).Count);
    }

    [Fact]
    public void Editable_sections_stay_stacked_so_validation_never_hides() =>
        Assert.Null(ComponentOfType(RenderView(typeof(EditableSectionsForm)), "TabLayout"));

    // ── semantic hints on dev tabs ─────────────────────────────────────────────

    [Fact]
    public void Developer_tabs_on_an_inferring_class_are_adaptable()
    {
        var metadata = ComponentOfType(RenderView(typeof(AutoDevTabsForm)), "TabLayout")!
            .Value.GetProperty("metadata");

        Assert.True(metadata.GetProperty("adaptable").GetBoolean());
        Assert.Equal("alternative", metadata.GetProperty("groupRelationship").GetString());
    }

    [Fact]
    public void Developer_tabs_without_auto_layout_carry_semantics_but_are_not_adaptable()
    {
        var metadata = ComponentOfType(RenderView(typeof(PlainDevTabsForm)), "TabLayout")!
            .Value.GetProperty("metadata");

        Assert.False(metadata.GetProperty("adaptable").GetBoolean());
        Assert.Equal("alternative", metadata.GetProperty("groupRelationship").GetString());
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    /// <summary>Every JSON object anywhere under <paramref name="el"/> (including itself).</summary>
    private static IEnumerable<JsonElement> Objects(JsonElement el)
    {
        switch (el.ValueKind)
        {
            case JsonValueKind.Object:
                yield return el;
                foreach (var property in el.EnumerateObject())
                foreach (var nested in Objects(property.Value))
                    yield return nested;
                break;
            case JsonValueKind.Array:
                foreach (var item in el.EnumerateArray())
                foreach (var nested in Objects(item))
                    yield return nested;
                break;
        }
    }

    /// <summary>The first component whose metadata "type" discriminator equals <paramref name="type"/>.</summary>
    private static JsonElement? ComponentOfType(JsonElement root, string type) =>
        Objects(root)
            .Where(o => o.TryGetProperty("metadata", out var m)
                        && m.ValueKind == JsonValueKind.Object
                        && m.TryGetProperty("type", out var t)
                        && t.GetString() == type)
            .Cast<JsonElement?>()
            .FirstOrDefault();

    /// <summary>All FormField fieldIds under <paramref name="scope"/>, in document order.</summary>
    private static List<string> FieldIds(JsonElement scope) =>
        Objects(scope)
            .Where(o => o.TryGetProperty("type", out var t) && t.GetString() == "FormField")
            .Select(o => o.GetProperty("fieldId").GetString()!)
            .ToList();

    private static string? Stereotype(JsonElement root, string fieldId) =>
        Objects(root)
            .Single(o => o.TryGetProperty("fieldId", out var f) && f.GetString() == fieldId)
            .GetProperty("stereotype").GetString();
}
