using System.Collections;
using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>Deterministic layout inference: picks the UX pattern (flat form, folded optionals,
/// tabs…) from the amount and structure of the declared information, so a class marked
/// [AutoLayout] only has to declare its data. Explicit layout attributes always win — inference
/// only fills the gaps the developer left open.
///
/// All decisions are based on the declared structure (never on runtime data) and on coarse counts
/// — number of sections, estimated visual weight — so adding one field never flips the whole
/// layout. This is a port of the Java reference decision table
/// (io.mateu.core.domain.out.componentmapper.LayoutInference): same rules and thresholds, so the
/// wire JSON stays identical across server implementations.</summary>
public static class LayoutInference
{
    /// <summary>Enums with up to this many constants render as radio buttons instead of a dropdown.</summary>
    public const int RadioMaxOptions = 4;

    /// <summary>Estimated weight (in standard field-row units) a form must exceed to fold its optionals.</summary>
    public const int FoldWeightThreshold = 16;

    /// <summary>Minimum number of optional fields worth folding into a "More options" panel.</summary>
    public const int FoldMinOptional = 4;

    /// <summary>Minimum number of sections before a read-only view is presented as tabs.</summary>
    public const int TabsMinSections = 5;

    /// <summary>Estimated total weight the sections must exceed before switching to tabs.</summary>
    public const int TabsWeightThreshold = 30;

    /// <summary>Label of the collapsed panel hosting the folded optional fields.</summary>
    public const string MoreOptionsLabel = "More options";

    /// <summary>Whether inference applies to the type: [AutoLayout] decides when present, otherwise
    /// the "Mateu.LayoutInference" AppContext switch enables it globally (the C# analogue of Java's
    /// mateu.layout.inference system property). Global default off.</summary>
    public static bool Enabled(Type? type)
    {
        if (type is null) return false;
        if (type.Find<AutoLayoutAttribute>() is { } auto) return auto.Value;
        return AppContext.TryGetSwitch("Mateu.LayoutInference", out var on) && on;
    }

    /// <summary>Estimated visual weight of a field in standard field-row units (1 = one regular
    /// input). The unit every threshold is measured in: a textarea or a nested grid "costs"
    /// several regular inputs, so thresholds hold across very different field mixes.</summary>
    public static int EstimatedWeight(PropertyInfo p)
    {
        switch (ReflectionMapper.EffectiveStereotype(p))
        {
            case "textarea" or "richText" or "html" or "markdown" or "image" or "uploadableImage": return 4;
            case "grid": return 6;
            case "radio" or "checkbox": return 2;
        }
        var t = Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType;
        return IsArrayLike(t) || typeof(IComponent).IsAssignableFrom(t) ? 6 : 1;
    }

    /// <summary>Sum of the estimated weights of a group of fields.</summary>
    public static int EstimatedWeight(IEnumerable<PropertyInfo> props) => props.Sum(EstimatedWeight);

    /// <summary>The C# analogue of Java's array/component dataType: collections and embedded
    /// fluent components render as heavy multi-row widgets.</summary>
    private static bool IsArrayLike(Type t) =>
        t != typeof(string) && (t.IsArray || typeof(IEnumerable).IsAssignableFrom(t));

    /// <summary>The split the fold-optionals rule produces: required stays visible, optional folds away.</summary>
    public sealed record FoldPlan(List<PropertyInfo> Main, List<PropertyInfo> Folded);

    /// <summary>Fold-optionals rule: on an editable form where the developer declared no grouping
    /// at all (a single unnamed section — [Tab] fields never reach this path) and the estimated
    /// weight exceeds one screen, keep the required fields visible and fold the optional ones into
    /// a collapsed "More options" panel. Null when the rule does not apply.</summary>
    internal static FoldPlan? BuildFoldPlan(Type type, string? sectionTitle, List<PropertyInfo> props, bool readOnly)
    {
        if (!Enabled(type) || readOnly) return null;
        // Only when the developer declared no grouping: a single unnamed section...
        if (!string.IsNullOrEmpty(sectionTitle)) return null;
        // ...and no embedded component fields (their layout is not ours to rearrange).
        if (props.Any(p => typeof(IComponent).IsAssignableFrom(p.PropertyType))) return null;
        if (EstimatedWeight(props) <= FoldWeightThreshold) return null;
        var main = props.Where(IsRequired).ToList();
        var folded = props.Where(p => !IsRequired(p)).ToList();
        if (main.Count == 0 || folded.Count < FoldMinOptional) return null;
        return new FoldPlan(main, folded);
    }

    private static bool IsRequired(PropertyInfo p) => p.Find<RequiredAttribute>() != null;

    /// <summary>Sections-to-tabs rule: a read-only view with many substantial sections reads
    /// better with random access (tabs) than as a long vertical stack — and unlike an editable
    /// form, hiding groups cannot hide invalid required fields.</summary>
    internal static bool PreferTabs(
        Type type, IReadOnlyList<(string? Title, List<PropertyInfo> Props)> sections, bool readOnly)
    {
        if (!Enabled(type) || !readOnly) return false;
        if (sections.Count < TabsMinSections) return false;
        return sections.Sum(s => EstimatedWeight(s.Props)) >= TabsWeightThreshold;
    }

    /// <summary>Small-enum rule: with up to <see cref="RadioMaxOptions"/> constants, radio buttons
    /// expose every option at a glance for the cost of one extra row; beyond that a dropdown is
    /// denser.</summary>
    internal static bool PreferRadio(PropertyInfo p)
    {
        var t = Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType;
        return t.IsEnum && Enabled(p.DeclaringType) && Enum.GetNames(t).Length <= RadioMaxOptions;
    }
}
