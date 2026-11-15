using System.Collections;
using System.Collections.Concurrent;
using System.Reflection;
using System.Text.Json.Serialization;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>A value as it may travel to THIS caller: every object inside it — a nested object of a
/// listing cell, a grid field's row, a list of them, a map of them, at any depth — leaves out the
/// properties whose [EyesOnly] the caller does not satisfy (Java's <c>FieldAccess</c> walk of a
/// state map; GA review 2, D3/D5). A value with no restricted member anywhere in its type goes out
/// exactly as before, so the wire of every other screen is unchanged.</summary>
internal static class ReadableValues
{
    private const int MaxDepth = 32;

    private static readonly ConcurrentDictionary<Type, bool> Restricted = new();

    /// <summary><paramref name="value"/> without what the caller may not read.</summary>
    internal static object? Of(object? value) => Of(value, 0, new HashSet<object>(ReferenceEqualityComparer.Instance));

    /// <summary>Whether this caller may read the property ([EyesOnly]).</summary>
    internal static bool MayRead(PropertyInfo p) => ActionGuard.Authorized(p.Find<EyesOnlyAttribute>());

    private static object? Of(object? value, int depth, HashSet<object> path)
    {
        if (value is null || depth > MaxDepth) return value;
        var type = value.GetType();
        if (IsScalar(type) || !MayHide(type)) return value;
        if (!path.Add(value)) return null; // a cycle: the object is already on the way down
        try
        {
            switch (value)
            {
                case IDictionary map:
                {
                    var copy = new Dictionary<string, object?>();
                    foreach (DictionaryEntry e in map) copy[e.Key.ToString() ?? ""] = Of(e.Value, depth + 1, path);
                    return copy;
                }
                case IEnumerable items:
                    return items.Cast<object?>().Select(i => Of(i, depth + 1, path)).ToList();
                default:
                {
                    var copy = new Dictionary<string, object?>();
                    foreach (var p in Readable(type))
                        copy[NameOf(p)] = Of(p.GetValue(value), depth + 1, path);
                    return copy;
                }
            }
        }
        finally { path.Remove(value); }
    }

    /// <summary>The public instance properties the serializer would write, minus the hidden ones.</summary>
    private static IEnumerable<PropertyInfo> Readable(Type type) =>
        type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => p.CanRead && p.GetIndexParameters().Length == 0
                        && p.GetCustomAttribute<JsonIgnoreAttribute>() is not { Condition: JsonIgnoreCondition.Always }
                        && MayRead(p));

    /// <summary>The wire name of a property: its [JsonPropertyName], else camelCase (the web wire).</summary>
    private static string NameOf(PropertyInfo p) =>
        p.GetCustomAttribute<JsonPropertyNameAttribute>()?.Name ?? Naming.CamelCase(p.Name);

    private static bool IsScalar(Type t) =>
        t.IsPrimitive || t.IsEnum || t == typeof(string) || t == typeof(decimal) || t == typeof(DateTime)
        || t == typeof(DateTimeOffset) || t == typeof(DateOnly) || t == typeof(TimeOnly) || t == typeof(TimeSpan)
        || t == typeof(Guid) || t == typeof(System.Text.Json.JsonElement) || t == typeof(System.Numerics.BigInteger);

    /// <summary>Whether a value of <paramref name="type"/> may hold a restricted member: a map or a
    /// list whose elements may (an untyped one may hold anything), or an object type with an
    /// [EyesOnly] property somewhere under it.</summary>
    private static bool MayHide(Type type) => Restricted.GetOrAdd(type, t => MayHide(t, new HashSet<Type>()));

    private static bool MayHide(Type t, HashSet<Type> seen)
    {
        t = Nullable.GetUnderlyingType(t) ?? t;
        if (IsScalar(t) || !seen.Add(t)) return false;
        if (t == typeof(object)) return true;
        if (typeof(IEnumerable).IsAssignableFrom(t))
        {
            var element = ElementTypes(t).ToList();
            return element.Count == 0 || element.Any(e => MayHide(e, seen));
        }
        var ns = t.Namespace ?? "";
        if (ns == "System" || ns.StartsWith("System.", StringComparison.Ordinal)) return false;
        foreach (var p in t.GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (p.GetIndexParameters().Length > 0) continue;
            if (p.Find<EyesOnlyAttribute>() is not null) return true;
            if (MayHide(p.PropertyType, seen)) return true;
        }
        return false;
    }

    /// <summary>The element (and, for a map, value) types of a generic collection type.</summary>
    private static IEnumerable<Type> ElementTypes(Type t)
    {
        if (t.IsArray) return [t.GetElementType()!];
        var dictionary = t.GetInterfaces().Append(t)
            .FirstOrDefault(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IDictionary<,>));
        if (dictionary is not null) return [dictionary.GetGenericArguments()[1]];
        var enumerable = t.GetInterfaces().Append(t)
            .FirstOrDefault(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IEnumerable<>));
        return enumerable is not null ? [enumerable.GetGenericArguments()[0]] : [];
    }
}
