using System.Collections.Concurrent;
using System.Reflection;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>The form's column count when the developer did not declare one: ONE column for a form
/// with up to <see cref="MaxSingleColumnFields"/> visible fields, TWO from 7 on. Decided per CLASS
/// (deterministic, cached, never dependent on the caller), counted over the properties that render
/// as form fields: the editable properties minus what never renders in the form body whoever looks
/// (an unconditional [Hidden], [Kpi], [HeaderBadge], [Timestamp], [AppContext], [Aside],
/// [Version], and component holders — <see cref="IComponent"/>/delegate properties carry their own
/// content). Permission- or mode-dependent properties ([EyesOnly], [Audience], a conditional
/// [Hidden("…")]) COUNT, so one class gets one layout; a grid/list property counts as one.
/// Declarations win and never reach the inference: [FormLayout(Columns = N)], and [Zone]s (a zoned
/// form keeps the classic 2). Port of the Java reference
/// (io.mateu.core.domain.out.componentmapper.FormColumnsInference): same threshold, same counting,
/// so the wire stays identical (pinned by the conformance corpus).</summary>
internal static class FormColumnsInference
{
    /// <summary>Up to this many visible fields a form is laid out in one column.</summary>
    internal const int MaxSingleColumnFields = 6;

    private static readonly ConcurrentDictionary<Type, int> Inferred = new();

    /// <summary>The column count of a form of this type: the declared [FormLayout(Columns)] when
    /// ≥ 1, 2 for a zoned form, else the inferred one.</summary>
    internal static int FormColumns(Type? type)
    {
        if (type is null) return 2;
        var declared = DeclaredColumns(type);
        if (declared >= 1) return declared;
        if (type.GetCustomAttributes<ZoneAttribute>().Any()) return 2;
        return Inferred.GetOrAdd(type, t => VisibleFieldCount(t) <= MaxSingleColumnFields ? 1 : 2);
    }

    /// <summary>The column count of a form made of <paramref name="props"/> — a wizard step, whose
    /// properties live on the wizard type: declarations on the type still win, the inference
    /// counts only the step's own properties (each step is its own form, like Java's step
    /// classes).</summary>
    internal static int FormColumns(Type? type, IEnumerable<PropertyInfo> props)
    {
        if (!IsInferred(type)) return FormColumns(type);
        return props.Count(RendersInAnyForm) <= MaxSingleColumnFields ? 1 : 2;
    }

    /// <summary>The type's [FormLayout(Columns)] when declared (≥ 1), else 0.</summary>
    internal static int DeclaredColumns(Type? type) =>
        type?.Find<FormLayoutAttribute>() is { Columns: >= 1 } layout ? layout.Columns : 0;

    /// <summary>Whether the type's column count is inferred (nothing declared on the type).</summary>
    internal static bool IsInferred(Type? type) =>
        type is not null && DeclaredColumns(type) == 0 && !type.GetCustomAttributes<ZoneAttribute>().Any();

    internal static int VisibleFieldCount(Type type) =>
        ReflectionMapper.EditableProperties(type).Count(RendersInAnyForm);

    private static bool RendersInAnyForm(PropertyInfo p)
    {
        if (p.Find<HiddenAttribute>() is { } hidden && string.IsNullOrWhiteSpace(hidden.Value)) return false;
        if (typeof(IComponent).IsAssignableFrom(p.PropertyType) || typeof(Delegate).IsAssignableFrom(p.PropertyType))
            return false;
        return p.Find<KpiAttribute>() is null
            && p.Find<HeaderBadgeAttribute>() is null
            && p.Find<TimestampAttribute>() is null
            && p.Find<AppContextAttribute>() is null
            && p.Find<AsideAttribute>() is null
            && p.Find<VersionAttribute>() is null;
    }
}
