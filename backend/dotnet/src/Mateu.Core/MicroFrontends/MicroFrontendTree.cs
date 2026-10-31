using System.Collections;
using System.Collections.Concurrent;
using System.Reflection;
using Mateu.Dtos;

namespace Mateu.Core.MicroFrontends;

/// <summary>Finds the micro frontends a response asks the server to resolve, and rebuilds the
/// response with each one replaced — the wire records are immutable, so every record on the path to
/// a replaced component is copied (record clone + its settable properties); everything else is
/// shared. Generic over the wire (it walks any Mateu.Dtos record), so a component wherever it sits —
/// a fragment, children, a card's content, a dialog — is found (Java: MicroFrontendTree).</summary>
internal static class MicroFrontendTree
{
    internal sealed record Found(ClientSideComponentDto Host, MicroFrontendMetadataDto MicroFrontend);

    /// <summary>A slot with nothing to paint: removed from the list it sits in.</summary>
    internal static readonly ClientSideComponentDto Remove =
        new(new DivMetadataDto { Content = "" }, "_removed", [], null, null, null);

    private static readonly ConcurrentDictionary<Type, PropertyInfo[]> Shapes = new();

    public static List<Found> Collect(UIIncrementDto increment)
    {
        var found = new List<Found>();
        Collect(increment.Fragments, found, new HashSet<object>(ReferenceEqualityComparer.Instance));
        return found;
    }

    private static void Collect(object? node, List<Found> found, HashSet<object> visited)
    {
        if (node is null || node is string || node.GetType().IsValueType || !visited.Add(node)) return;
        if (node is ClientSideComponentDto { Metadata: MicroFrontendMetadataDto mf } client)
        {
            // what it embeds is the remote's, resolved by the remote itself
            if (mf.Server is not null) found.Add(new Found(client, mf));
            return;
        }
        if (node is IDictionary) return;
        if (node is IEnumerable items && !IsWireRecord(node))
        {
            foreach (var item in items) Collect(item, found, visited);
            return;
        }
        if (!IsWireRecord(node)) return;
        foreach (var property in ShapeOf(node.GetType())) Collect(property.GetValue(node), found, visited);
    }

    public static UIIncrementDto Rewrite(UIIncrementDto increment,
        Dictionary<ClientSideComponentDto, ComponentDto> replacements)
    {
        var fragments = Rewrite(increment.Fragments, replacements, false);
        return ReferenceEquals(fragments, increment.Fragments)
            ? increment
            : increment with { Fragments = (IReadOnlyList<UIFragmentDto>)fragments! };
    }

    private static object? Rewrite(object? node, Dictionary<ClientSideComponentDto, ComponentDto> replacements, bool inList)
    {
        if (node is null || node is string || node.GetType().IsValueType) return node;
        if (node is ClientSideComponentDto client && replacements.TryGetValue(client, out var replacement))
            // a slot with nothing to paint outside a list: an empty element keeps the place valid
            return ReferenceEquals(replacement, Remove) && !inList ? EmptyIn(client) : replacement;
        if (node is IDictionary) return node;
        if (node is IList list && !IsWireRecord(node))
        {
            List<object?>? changed = null;
            for (var i = 0; i < list.Count; i++)
            {
                var item = list[i];
                var next = Rewrite(item, replacements, true);
                if (!ReferenceEquals(next, item) && changed is null)
                    changed = list.Cast<object?>().Take(i).ToList();
                if (changed is not null && !ReferenceEquals(next, Remove)) changed.Add(next);
            }
            return changed is null ? node : ListLike(node, changed);
        }
        if (!IsWireRecord(node) || node is MicroFrontendMetadataDto) return node;
        object? copy = null;
        foreach (var property in ShapeOf(node.GetType()))
        {
            var current = property.GetValue(node);
            var next = Rewrite(current, replacements, false);
            if (ReferenceEquals(next, current)) continue;
            copy ??= Clone(node);
            if (copy is null) return node;
            property.SetValue(copy, next);
        }
        return copy ?? node;
    }

    private static ClientSideComponentDto EmptyIn(ClientSideComponentDto client) =>
        new(new DivMetadataDto { Content = "" }, client.Id, [], client.Style, client.CssClasses, client.Slot);

    /// <summary>A list of the same element type as <paramref name="original"/> (an array stays an array).</summary>
    private static object ListLike(object original, List<object?> items)
    {
        var elementType = original.GetType().IsArray
            ? original.GetType().GetElementType()!
            : original.GetType().GetInterfaces().Append(original.GetType())
                  .FirstOrDefault(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IEnumerable<>))
                  ?.GetGenericArguments()[0] ?? typeof(object);
        if (original.GetType().IsArray)
        {
            var array = Array.CreateInstance(elementType, items.Count);
            for (var i = 0; i < items.Count; i++) array.SetValue(items[i], i);
            return array;
        }
        var typed = (IList)Activator.CreateInstance(typeof(List<>).MakeGenericType(elementType))!;
        foreach (var item in items) typed.Add(item);
        return typed;
    }

    private static object? Clone(object record) =>
        record.GetType().GetMethod("<Clone>$", BindingFlags.Public | BindingFlags.Instance)?.Invoke(record, null);

    private static bool IsWireRecord(object node)
    {
        var type = node.GetType();
        return type.IsClass && type.Namespace == "Mateu.Dtos";
    }

    /// <summary>The settable (positional or init) public properties of a wire record.</summary>
    private static PropertyInfo[] ShapeOf(Type type) => Shapes.GetOrAdd(type, t =>
        t.GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => p.CanRead && p.SetMethod is not null && p.GetIndexParameters().Length == 0)
            .ToArray());
}
