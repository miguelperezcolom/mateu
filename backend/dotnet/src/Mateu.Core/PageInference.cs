using System.Reflection;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>Page-level inference — the C# port of Java's PageInference (fase 1 of
/// design/page-level-inference-plan.md; the Java class is the reference decision table).
/// Under the explicit [AutoPage] opt-in (or the global "Mateu.LayoutInference" switch), a plain
/// class whose structure spells an archetype is COMPOSED as that archetype by the mapper instead
/// of rendered as a reflected form. Explicit always wins — archetype subclasses and component
/// tree suppliers are never rewritten (crud/listing views take their own mapping paths before
/// this is consulted). Only fully-derivable archetypes compose: dashboard (MetricCard
/// properties) and welcome (nothing but calls-to-action and presentational components).</summary>
public static class PageInference
{
    /// <summary>[AutoPage] decides when present; otherwise the "Mateu.LayoutInference"
    /// AppContext switch enables it globally (same switch as the form-level inference).</summary>
    public static bool Enabled(Type? type)
    {
        if (type is null) return false;
        if (type.Find<AutoPageAttribute>() is { } auto) return auto.Value;
        return AppContext.TryGetSwitch("Mateu.LayoutInference", out var on) && on;
    }

    /// <summary>Whether ANY composition rule applies.</summary>
    public static bool Composes(Type type) => ComposesDashboard(type) || ComposesWelcome(type);

    /// <summary>Dashboard rule: an enabled plain class declaring at least one MetricCard
    /// property composes the Dashboard archetype. Checked before the welcome rule — the
    /// stronger signal.</summary>
    public static bool ComposesDashboard(Type type) =>
        Composable(type) && Properties(type).Any(p => p.PropertyType == typeof(MetricCard));

    /// <summary>Welcome rule: an enabled plain class declaring at least one Button property and
    /// NOTHING but presentational properties (buttons, components) composes the Welcome landing
    /// — a page made only of calls-to-action is a landing; a single data property keeps the
    /// class a form.</summary>
    public static bool ComposesWelcome(Type type)
    {
        if (!Composable(type)) return false;
        var properties = Properties(type).ToList();
        return properties.Any(p => p.PropertyType == typeof(Button))
            && properties.All(Presentational);
    }

    private static bool Presentational(PropertyInfo property) =>
        typeof(IComponent).IsAssignableFrom(property.PropertyType);

    private static bool Composable(Type type) =>
        Enabled(type) && !typeof(IComponentTreeSupplier).IsAssignableFrom(type);

    private static IEnumerable<PropertyInfo> Properties(Type type) =>
        type.GetProperties(BindingFlags.Public | BindingFlags.Instance);
}
