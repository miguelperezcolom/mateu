using System.Collections;
using System.Reflection;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>Infers where a form's field labels sit (the <c>labelsAside</c> wire flag), following
/// the dense backoffice data-entry idiom: labels-aside pays off (one compact row per field, a
/// scannable label column) only when the form is single-column AND dense AND short-labelled AND
/// made of single-line widgets; anything else keeps labels on top (also the Redwood form
/// convention). The explicit <c>[FormLayout(LabelsAside = …)]</c> always wins over this inference.
/// Port of the Java reference (io.mateu.core.domain.out.componentmapper.LabelsAsideInference):
/// same rule and thresholds, so the wire JSON stays identical across server implementations.</summary>
internal static class LabelsAsideInference
{
    /// <summary>Below this field count a form is not dense enough for labels-aside to pay off.</summary>
    private const int MinFields = 6;

    /// <summary>Longest label that fits the aside label column without truncation.</summary>
    private const int MaxLabelChars = 20;

    /// <summary>The form's labels mode: the explicit <c>[FormLayout(LabelsAside = …)]</c> on the
    /// view class wins; with <see cref="LabelsAsideMode.Auto"/> the mode is inferred from the
    /// form's shape.</summary>
    internal static bool LabelsAside(
        IReadOnlyList<PropertyInfo> fields, int maxColumns, Type? viewType,
        Func<string, string>? translate = null)
    {
        if (viewType?.Find<FormLayoutAttribute>() is { LabelsAside: not LabelsAsideMode.Auto } annotation)
            return annotation.LabelsAside == LabelsAsideMode.Aside;
        return Infer(fields, maxColumns, translate ?? (s => s));
    }

    private static bool Infer(
        IReadOnlyList<PropertyInfo> fields, int maxColumns, Func<string, string> translate)
    {
        if (maxColumns != 1 || fields.Count < MinFields)
            return false;
        foreach (var field in fields)
        {
            if (translate(LabelOf(field)).Length > MaxLabelChars)
                return false;
            if (IsWideWidget(field))
                return false;
        }
        return true;
    }

    /// <summary>The field's display label, exactly as the form computes it: [Label] wins, else the
    /// humanized property name (mirrors ReflectionMapper's field mapping).</summary>
    private static string LabelOf(PropertyInfo p) =>
        p.Find<LabelAttribute>()?.Value ?? Naming.Humanize(p.Name);

    /// <summary>Widgets that break the aside row: tall/wide content that needs the field's full
    /// width — a textarea/rich-text stereotype ([Multiline] or an explicit [Stereotype]), a
    /// collection/dictionary, a delegate/component field, or any non-basic non-enum type (a nested
    /// record).</summary>
    private static bool IsWideWidget(PropertyInfo p)
    {
        if (ReflectionMapper.EffectiveStereotype(p) is "textarea" or "richText")
            return true;
        var t = Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType;
        if (t != typeof(string) && (t.IsArray || typeof(IEnumerable).IsAssignableFrom(t)))
            return true;
        if (typeof(Delegate).IsAssignableFrom(t) || typeof(IComponent).IsAssignableFrom(t))
            return true;
        return !IsBasic(t) && !t.IsEnum;
    }

    /// <summary>The C# analogue of Java's BasicTypeChecker.isBasic: the scalar types a form edits
    /// with a single-line input (string, the numeric/boolean primitives, decimal, temporals).</summary>
    private static bool IsBasic(Type t) =>
        t == typeof(string) || t.IsPrimitive || t == typeof(decimal)
        || t == typeof(DateTime) || t == typeof(DateOnly) || t == typeof(TimeOnly);
}
