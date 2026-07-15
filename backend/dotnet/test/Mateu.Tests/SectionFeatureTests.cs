using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Fixtures (mirror the Java PropertyListSyncTest / FramelessSectionSyncTest /
// BulletedListSyncTest fixtures) ───────────────────────────────────────────────

/// <summary>Property-list section + a regular section (Java: @Section(propertyList=true)).</summary>
[UI("sections/property-list")]
public class PropertyListForm
{
    [Section("Documento", PropertyList = true)]
    public string? Documento { get; set; } = "12345678X";

    public string? Nombre { get; set; } = "María";

    [Section("Otros")]
    public string? Email { get; set; }
}

/// <summary>A frameless band next to a framed section (Java: @Section(frameless=true)).</summary>
[UI("sections/frameless")]
public class FramelessForm
{
    [Section("Banda", Frameless = true)]
    public string? Aviso { get; set; } = "sin marco";

    [Section("Datos")]
    public string? Nombre { get; set; } = "María";
}

/// <summary>[BulletedList] marker on a collection property.</summary>
[UI("sections/bulleted")]
public class BulletedForm
{
    [BulletedList]
    public List<string> Preferencias { get; set; } = ["Almohada extra", "Planta alta"];
}

/// <summary>The fluent BulletedList component in a component-tree view.</summary>
[UI("sections/bulleted-fluent")]
public class BulletedFluentView : IComponentTreeSupplier
{
    public IComponent Component() => new BulletedList { Items = ["Vista mar", "Cuna"] };
}

/// <summary>The fluent Notice (compact inline banner) in a component-tree view.</summary>
[UI("sections/notice")]
public class NoticeView : IComponentTreeSupplier
{
    public IComponent Component() => new Notice("2 quejas pendientes")
    {
        Theme = "danger", ActionLabel = "Revisar", ActionId = "review",
    };
}

/// <summary>[SeparatorBefore] on a field (Java: @SeparatorBefore).</summary>
[UI("sections/separator")]
public class SeparatorForm
{
    public string? Nombre { get; set; } = "María";

    [SeparatorBefore]
    public string? Email { get; set; }
}

/// <summary>The fluent Text with a size + a Separator in a component-tree view.</summary>
[UI("sections/text-size")]
public class TextSizeView : IComponentTreeSupplier
{
    public IComponent Component() => new Text("pequeño") { Size = "xs" };
}

/// <summary>[WizardProgress("steps")]: connected bullets instead of the progress bar.</summary>
[UI("sections/wizard-steps"), Title("Steps wizard"), WizardProgress("steps")]
public class StepsWizard : Wizard
{
    [Step(1)] public string? A { get; set; }
    [Step(2)] public string? B { get; set; }
    public override Message Complete() => new("done");
}

public class SectionFeatureTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(PropertyListForm).Assembly));

    private static JsonElement RenderView(Type viewType) =>
        JsonSerializer.SerializeToElement(
            Handler().Handle(new RunActionRqDto { ServerSideType = viewType.FullName }), Json);

    [Fact]
    public void Property_list_section_marks_its_fields_as_read_only_property_rows()
    {
        var root = RenderView(typeof(PropertyListForm));
        Assert.True(Field(root, "documento").GetProperty("propertyRow").GetBoolean());
        Assert.True(Field(root, "documento").GetProperty("readOnly").GetBoolean());
        Assert.True(Field(root, "nombre").GetProperty("propertyRow").GetBoolean());
        // fields of other sections are unaffected
        Assert.False(Field(root, "email").GetProperty("propertyRow").GetBoolean());
        Assert.False(Field(root, "email").GetProperty("readOnly").GetBoolean());
    }

    [Fact]
    public void Frameless_section_emits_no_section_card_while_the_others_keep_theirs()
    {
        var root = RenderView(typeof(FramelessForm));
        var sectionTitles = Objects(root)
            .Where(o => o.TryGetProperty("type", out var t) && t.GetString() == "FormSection")
            .Select(o => o.GetProperty("title").GetString())
            .ToList();
        Assert.Equal(["Datos"], sectionTitles);
        // the frameless section's field still travels
        Assert.Equal("sin marco", Field(root, "aviso").GetProperty("initialValue").GetString());
    }

    [Fact]
    public void Bulleted_list_marker_becomes_its_stereotype()
    {
        var root = RenderView(typeof(BulletedForm));
        Assert.Equal("bulletedList", Field(root, "preferencias").GetProperty("stereotype").GetString());
    }

    [Fact]
    public void Fluent_bulleted_list_travels_as_its_dto_with_items()
    {
        var root = RenderView(typeof(BulletedFluentView));
        var list = Objects(root)
            .Single(o => o.TryGetProperty("type", out var t) && t.GetString() == "BulletedList");
        var items = list.GetProperty("items").EnumerateArray().Select(i => i.GetString()).ToList();
        Assert.Equal(["Vista mar", "Cuna"], items);
    }

    [Fact]
    public void Separator_before_paints_a_full_width_divider_above_the_field()
    {
        var root = RenderView(typeof(SeparatorForm));
        var separators = Objects(root)
            .Where(o => o.TryGetProperty("type", out var t) && t.GetString() == "Separator")
            .ToList();
        Assert.Single(separators);
        Assert.Equal("2", separators[0].GetProperty("attributes").GetProperty("data-colspan").GetString());
    }

    [Fact]
    public void Text_size_travels_on_the_wire()
    {
        var root = RenderView(typeof(TextSizeView));
        var text = Objects(root)
            .Single(o => o.TryGetProperty("type", out var t) && t.GetString() == "Text"
                         && o.GetProperty("text").GetString() == "pequeño");
        Assert.Equal("xs", text.GetProperty("size").GetString());
    }

    [Fact]
    public void Notice_travels_with_theme_text_and_action()
    {
        var root = RenderView(typeof(NoticeView));
        var notice = ComponentOfType(root, "Notice")!.Value.GetProperty("metadata");
        Assert.Equal("2 quejas pendientes", notice.GetProperty("text").GetString());
        Assert.Equal("danger", notice.GetProperty("theme").GetString());
        Assert.Equal("Revisar", notice.GetProperty("actionLabel").GetString());
        Assert.Equal("review", notice.GetProperty("actionId").GetString());
    }

    [Fact]
    public void Wizard_progress_steps_emits_connected_bullets_instead_of_the_bar()
    {
        var root = RenderView(typeof(StepsWizard));
        Assert.Null(ComponentOfType(root, "ProgressBar"));
        var stepper = ComponentOfType(root, "ProgressSteps");
        Assert.NotNull(stepper);
        var statuses = stepper!.Value.GetProperty("metadata").GetProperty("steps").EnumerateArray()
            .Select(s => s.GetProperty("status").GetString()).ToList();
        Assert.Equal(["current", "upcoming"], statuses);
    }

    private static JsonElement? ComponentOfType(JsonElement root, string type) =>
        Objects(root)
            .Where(o => o.TryGetProperty("metadata", out var m)
                        && m.ValueKind == JsonValueKind.Object
                        && m.TryGetProperty("type", out var t)
                        && t.GetString() == type)
            .Cast<JsonElement?>()
            .FirstOrDefault();

    // ── helpers (same walking approach as LayoutInferenceTests) ───────────────

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

    private static JsonElement Field(JsonElement root, string fieldId) =>
        Objects(root)
            .Single(o => o.TryGetProperty("type", out var t) && t.GetString() == "FormField"
                         && o.GetProperty("fieldId").GetString() == fieldId);
}
