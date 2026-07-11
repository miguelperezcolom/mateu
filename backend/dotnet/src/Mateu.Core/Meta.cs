using System.Reflection;

namespace Mateu.Core;

/// <summary>
/// Resolves <b>semantic / composed</b> attributes: an attribute A is considered present on a
/// member either directly, or transitively through another attribute whose own class is decorated
/// with A. This lets a developer define a single semantic attribute that bundles framework
/// configuration, e.g.
/// <code>
/// [AttributeUsage(AttributeTargets.Property)]
/// [Money, Label("Importe total")]
/// public sealed class ImporteTotalAttribute : Attribute;
/// </code>
/// and then annotate a property with just [ImporteTotal]; the framework treats it as if it
/// carried the underlying [Money] and [Label]. The C# analogue of Java's MetaAnnotations —
/// minimal like it: first match wins, no attribute overriding.
/// </summary>
public static class Meta
{
    /// <summary>The A attribute present on <paramref name="element"/> directly or via a composed
    /// attribute (depth-first, cycle-safe; first match wins, also for repeatable attributes).</summary>
    public static TA? Find<TA>(this MemberInfo element) where TA : Attribute =>
        element.GetCustomAttributes<TA>().FirstOrDefault()
        ?? FindOnComposed<TA>(element.GetCustomAttributes(), []);

    private static TA? FindOnComposed<TA>(IEnumerable<Attribute> attributes, HashSet<Type> visited)
        where TA : Attribute
    {
        foreach (var attribute in attributes)
        {
            var type = attribute.GetType();
            // Skip system attributes ([AttributeUsage], …) and break cycles.
            if (type.Namespace?.StartsWith("System") == true || !visited.Add(type)) continue;
            if (type.GetCustomAttribute<TA>() is { } direct) return direct;
            if (FindOnComposed<TA>(type.GetCustomAttributes(), visited) is { } nested) return nested;
        }
        return null;
    }
}
