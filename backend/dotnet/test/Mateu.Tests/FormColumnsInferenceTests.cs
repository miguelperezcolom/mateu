using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Fixtures (mirror the Java FormColumnsInferenceSyncTest fixtures) ─────────

public class ColsOne { public string? F1 { get; set; } = "a"; }
public class ColsTwo : ColsOne { public string? F2 { get; set; } = "b"; }
public class ColsThree : ColsTwo { public string? F3 { get; set; } = "c"; }
public class ColsFour : ColsThree { public string? F4 { get; set; } = "d"; }
public class ColsFive : ColsFour { public string? F5 { get; set; } = "e"; }

/// <summary>Six short-labelled single-line fields: dense enough for labels aside — were it declared.</summary>
[UI("cols-six"), Title("Six")]
public class ColsSix : ColsFive { public string? F6 { get; set; } = "f"; }

[UI("cols-seven"), Title("Seven")]
public class ColsSeven : ColsSix { public string? F7 { get; set; } = "g"; }

/// <summary>Six visible fields plus everything that never renders as a form field.</summary>
[UI("cols-six-plus-excluded"), Title("Excluded")]
public class ColsSixPlusExcluded : ColsSix
{
    [Hidden] public string? Hidden { get; set; } = "h";
    [HeaderBadge] public string? Badge { get; set; } = "b";
    [Timestamp("Updated")] public string? Updated { get; set; } = "now";
    [Version] public int Version { get; set; }
}

/// <summary>A permission-dependent field still counts: one class gets one layout, whoever looks.</summary>
[UI("cols-six-plus-eyes-only"), Title("EyesOnly")]
public class ColsSixPlusEyesOnly : ColsSix
{
    [EyesOnly(Roles = ["admin"])] public string? Secret { get; set; } = "s";
}

/// <summary>Seven fields across two sections: the count is over the WHOLE form.</summary>
[UI("cols-sections"), Title("Sections")]
public class ColsSevenInSections
{
    [Section("A")] public string? A1 { get; set; } = "";
    public string? A2 { get; set; } = "";
    public string? A3 { get; set; } = "";
    [Section("B")] public string? B1 { get; set; } = "";
    public string? B2 { get; set; } = "";
    public string? B3 { get; set; } = "";
    public string? B4 { get; set; } = "";
}

[UI("cols-declared-two"), Title("Declared two"), FormLayout(Columns = 2)]
public class ColsDeclaredTwo : ColsThree;

[UI("cols-declared-one"), Title("Declared one"), FormLayout(Columns = 1)]
public class ColsDeclaredOne : ColsSeven;

/// <summary>A zoned form is a declared layout: its sections keep the classic 2.</summary>
[UI("cols-zones"), Title("Zones")]
[Zone("left", "50%"), Zone("right", "50%")]
public class ColsZoned
{
    [Section("L", Zone = "left")] public string? L1 { get; set; } = "";
    [Section("R", Zone = "right")] public string? R1 { get; set; } = "";
}

[UI("cols-wizard"), Title("Wizard")]
public class ColsWizard : Wizard
{
    [Step(1)] public string? A { get; set; }
    [Step(1)] public string? B { get; set; }
    [Step(2)] public string? C1 { get; set; }
    [Step(2)] public string? C2 { get; set; }
    [Step(2)] public string? C3 { get; set; }
    [Step(2)] public string? C4 { get; set; }
    [Step(2)] public string? C5 { get; set; }
    [Step(2)] public string? C6 { get; set; }
    [Step(2)] public string? C7 { get; set; }

    public override Message Complete() => new("done");
}

// ── Tests (mirror the Java FormColumnsInferenceSyncTest assertions) ──────────

/// <summary>The inferred form column count: ONE column up to 6 visible fields, TWO from 7 on —
/// counted over the whole form, over the properties that render as form fields. Declarations
/// ([FormLayout(Columns)], [Zone]s) always win, each wizard step is its own form, and an inferred
/// single column keeps labels on top. Ported from the Java FormColumnsInferenceSyncTest.</summary>
public class FormColumnsInferenceTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static List<JsonElement> Layouts(Type viewType, string? actionId = null,
        Dictionary<string, object?>? state = null)
    {
        var root = JsonSerializer.SerializeToElement(
            new SyncHandler(new MateuRegistry(typeof(ColsSix).Assembly))
                .Handle(new RunActionRqDto
                {
                    ServerSideType = viewType.FullName, ActionId = actionId, ComponentState = state ?? new(),
                }), Json);
        var layouts = Objects(root)
            .Where(o => o.TryGetProperty("type", out var t) && t.ValueKind == JsonValueKind.String
                        && t.GetString() == "FormLayout")
            .ToList();
        Assert.NotEmpty(layouts);
        return layouts;
    }

    private static List<int> Columns(Type viewType, string? actionId = null,
        Dictionary<string, object?>? state = null) =>
        Layouts(viewType, actionId, state).Select(l => l.GetProperty("maxColumns").GetInt32()).ToList();

    [Theory]
    [InlineData(typeof(ColsOne))]
    [InlineData(typeof(ColsTwo))]
    [InlineData(typeof(ColsThree))]
    [InlineData(typeof(ColsFour))]
    [InlineData(typeof(ColsFive))]
    [InlineData(typeof(ColsSix))]
    public void Up_to_six_visible_fields_is_one_column(Type form) =>
        Assert.Equal(1, FormColumnsInference.FormColumns(form));

    [Fact]
    public void Seven_visible_fields_are_two_columns() =>
        Assert.Equal(2, FormColumnsInference.FormColumns(typeof(ColsSeven)));

    [Fact]
    public void The_wire_carries_the_inferred_count()
    {
        Assert.All(Columns(typeof(ColsSix)), c => Assert.Equal(1, c));
        Assert.All(Columns(typeof(ColsSeven)), c => Assert.Equal(2, c));
    }

    [Fact]
    public void Fields_that_never_render_as_form_fields_do_not_count() =>
        Assert.All(Columns(typeof(ColsSixPlusExcluded)), c => Assert.Equal(1, c));

    [Fact]
    public void A_permission_dependent_field_counts_whoever_looks() =>
        Assert.All(Columns(typeof(ColsSixPlusEyesOnly)), c => Assert.Equal(2, c));

    [Fact]
    public void The_count_is_over_the_whole_form_so_every_section_shares_it()
    {
        var columns = Columns(typeof(ColsSevenInSections));
        Assert.Equal(2, columns.Count);
        Assert.All(columns, c => Assert.Equal(2, c));
    }

    [Fact]
    public void An_explicit_form_layout_wins()
    {
        Assert.All(Columns(typeof(ColsDeclaredTwo)), c => Assert.Equal(2, c));
        Assert.All(Columns(typeof(ColsDeclaredOne)), c => Assert.Equal(1, c));
    }

    [Fact]
    public void A_zoned_form_keeps_two() =>
        Assert.All(Columns(typeof(ColsZoned)), c => Assert.Equal(2, c));

    [Fact]
    public void Each_wizard_step_is_its_own_form()
    {
        Assert.All(Columns(typeof(ColsWizard)), c => Assert.Equal(1, c));
        Assert.All(Columns(typeof(ColsWizard), "next", new() { ["__step"] = JsonSerializer.SerializeToElement(1) }), c => Assert.Equal(2, c));
    }

    [Fact]
    public void An_inferred_single_column_keeps_labels_on_top() =>
        Assert.All(Layouts(typeof(ColsSix)), l => Assert.False(l.GetProperty("labelsAside").GetBoolean()));

    [Fact]
    public void A_declared_single_column_still_gets_labels_aside() =>
        Assert.True(Layouts(typeof(ColsDeclaredOne))[0].GetProperty("labelsAside").GetBoolean());

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
