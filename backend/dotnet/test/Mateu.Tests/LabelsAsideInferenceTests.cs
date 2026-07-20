using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Fixtures (mirrors the Java LabelsAsideInferenceSyncTest fixtures) ─────────

/// <summary>Dense single-column form of short-labelled, single-line widgets: labels go aside.</summary>
[UI("aside-form"), FormLayout(Columns = 1)]
public class AsideForm
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
}

/// <summary>Same shape as <see cref="AsideForm"/> but two columns: labels stay on top.</summary>
[UI("multi-form"), FormLayout(Columns = 2)]
public class MultiColumnForm : AsideForm;

/// <summary>Under the minimum field count (6): not dense enough for labels-aside.</summary>
[UI("small-form"), FormLayout(Columns = 1)]
public class SmallForm
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
}

/// <summary>One 26-char label overflows the aside label column: the whole form stays on top.</summary>
[UI("long-label-form"), FormLayout(Columns = 1)]
public class LongLabelForm
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? City { get; set; }
    [Label("Security deposit reference")] public string? Deposit { get; set; }
}

/// <summary>A textarea needs the field's full width: the whole form stays on top.</summary>
[UI("textarea-form"), FormLayout(Columns = 1)]
public class TextareaForm
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? City { get; set; }
    [Multiline] public string? Notes { get; set; }
}

/// <summary>Explicit ASIDE wins over the multi-column rule.</summary>
[UI("forced-aside"), FormLayout(Columns = 2, LabelsAside = LabelsAsideMode.Aside)]
public class ForcedAsideForm : AsideForm;

/// <summary>Explicit TOP wins over the inference.</summary>
[UI("forced-top"), FormLayout(Columns = 1, LabelsAside = LabelsAsideMode.Top)]
public class ForcedTopForm : AsideForm;

// ── Tests (mirrors the Java LabelsAsideInferenceSyncTest assertions) ──────────

/// <summary>Labels-aside inference (the dense backoffice data-entry idiom): labels sit left of the
/// field only for dense single-column forms of short-labelled, single-line widgets — multi-column
/// forms, few fields, long labels and tall widgets keep labels on top. The explicit
/// [FormLayout(LabelsAside = …)] always wins over the inference. Asserted on the labelsAside flag
/// of the FormLayout metadata a real sync request produces. Ported from the Java
/// LabelsAsideInferenceSyncTest (the behavioural spec).</summary>
public class LabelsAsideInferenceTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static bool LabelsAsideOf(Type viewType)
    {
        var root = JsonSerializer.SerializeToElement(
            new SyncHandler(new MateuRegistry(typeof(AsideForm).Assembly))
                .Handle(new RunActionRqDto { ServerSideType = viewType.FullName }), Json);
        var layout = Objects(root)
            .First(o => o.TryGetProperty("metadata", out var m)
                        && m.ValueKind == JsonValueKind.Object
                        && m.TryGetProperty("type", out var t)
                        && t.GetString() == "FormLayout");
        return layout.GetProperty("metadata").GetProperty("labelsAside").GetBoolean();
    }

    [Fact]
    public void Dense_single_column_form_with_short_labels_gets_labels_aside() =>
        Assert.True(LabelsAsideOf(typeof(AsideForm)));

    [Fact]
    public void Multi_column_form_keeps_labels_on_top() =>
        Assert.False(LabelsAsideOf(typeof(MultiColumnForm)));

    [Fact]
    public void A_form_with_few_fields_keeps_labels_on_top() =>
        Assert.False(LabelsAsideOf(typeof(SmallForm)));

    [Fact]
    public void A_long_label_sends_the_whole_form_back_to_top() =>
        Assert.False(LabelsAsideOf(typeof(LongLabelForm)));

    [Fact]
    public void A_textarea_sends_the_whole_form_back_to_top() =>
        Assert.False(LabelsAsideOf(typeof(TextareaForm)));

    [Fact]
    public void Explicit_aside_wins_over_the_multi_column_rule() =>
        Assert.True(LabelsAsideOf(typeof(ForcedAsideForm)));

    [Fact]
    public void Explicit_top_wins_over_the_inference() =>
        Assert.False(LabelsAsideOf(typeof(ForcedTopForm)));

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
}
