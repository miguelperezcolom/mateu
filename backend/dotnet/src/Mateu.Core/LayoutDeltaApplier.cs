using System.Collections;
using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.Extensions.Logging;

namespace Mateu.Core;

/// <summary>Re-applies a page's <c>layoutDelta:</c> on top of whatever inference just produced
/// (mirrors Java's LayoutDeltaApplier). A delta speaks about fields by id, and an inferred tree may
/// spread those fields over sections, tabs or rows, so:
/// <list type="bullet">
/// <item><b>hidden</b> removes that field wherever it sits (from any list of components);</item>
/// <item><b>overrides</b> (label, colspan) apply to the field wherever it sits;</item>
/// <item><b>order</b> reorders the fields <i>within each container that holds them</i>, leaving
/// non-field siblings in their slots — a delta cannot move a field between containers.</item>
/// </list>
/// The walk covers children AND the components nested inside metadata (a Card's content, a tab's
/// panels…), since inferred forms nest their fields there.</summary>
public static class LayoutDeltaApplier
{
    /// <summary>The tree with the delta applied; the same instance when the delta is empty or
    /// changes nothing. A failure renders the inferred layout (logged) — a page that renders beats
    /// a page that does not.</summary>
    public static T Apply<T>(T tree, LayoutDelta? delta) where T : ComponentDto
    {
        if (delta is null || delta.IsEmpty) return tree;
        try
        {
            return (T)Rewrite(tree, delta);
        }
        catch (Exception e)
        {
            MateuLogging.For("Mateu.Yaml").LogError(e, "Could not apply the layout delta; rendering the inferred layout");
            return tree;
        }
    }

    private static ComponentDto Rewrite(ComponentDto component, LayoutDelta delta)
    {
        switch (component)
        {
            case ClientSideComponentDto client:
            {
                var metadata = ApplyOverride(client.Metadata, delta);
                metadata = (ComponentMetadataDto)RewriteMembers(metadata, delta);
                var children = RewriteList(client.Children, delta);
                return ReferenceEquals(metadata, client.Metadata) && children is null
                    ? client
                    : client with { Metadata = metadata, Children = children ?? client.Children };
            }
            case ServerSideComponentDto server:
            {
                var children = RewriteList(server.Children, delta);
                return children is null ? server : server with { Children = children };
            }
            default:
                return component;
        }
    }

    /// <summary>A FormField's label/colspan override, or the same metadata.</summary>
    private static ComponentMetadataDto ApplyOverride(ComponentMetadataDto metadata, LayoutDelta delta)
    {
        if (metadata is not FormFieldMetadataDto field || string.IsNullOrEmpty(field.FieldId)) return metadata;
        var o = delta.OverrideFor(field.FieldId);
        if (o.Label is null && o.Colspan is null) return metadata;
        return field with { Label = o.Label ?? field.Label, Colspan = o.Colspan ?? field.Colspan };
    }

    /// <summary>A record (metadata) with every component-typed member rewritten: a single component
    /// slot or a list of components. Same instance when nothing changed.</summary>
    private static object RewriteMembers(object record, LayoutDelta delta)
    {
        object? copy = null;
        foreach (var p in record.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (!p.CanRead || !p.CanWrite || p.GetIndexParameters().Length > 0) continue;
            var value = p.GetValue(record);
            object? rewritten = null;
            if (value is ComponentDto single)
            {
                var r = Rewrite(single, delta);
                if (!ReferenceEquals(r, single) && p.PropertyType.IsInstanceOfType(r)) rewritten = r;
            }
            else if (value is IEnumerable list and not string && IsComponentList(p.PropertyType)
                     && list.Cast<object?>().All(item => item is ComponentDto))
            {
                var r = RewriteList(list.Cast<ComponentDto>().ToList(), delta);
                if (r is not null) rewritten = r;
            }
            if (rewritten is null) continue;
            copy ??= Clone(record);
            p.SetValue(copy, rewritten);
        }
        return copy ?? record;
    }

    /// <summary>A property that can hold a <see cref="List{ComponentDto}"/> (IReadOnlyList,
    /// IEnumerable… of ComponentDto).</summary>
    private static bool IsComponentList(Type t) => t.IsAssignableFrom(typeof(List<ComponentDto>))
        && t != typeof(object);

    private static object Clone(object record) =>
        record.GetType().GetMethod("<Clone>$")?.Invoke(record, null)
        ?? throw new InvalidOperationException($"{record.GetType().Name} is not a record");

    /// <summary>The list with hidden fields removed, every item rewritten and the fields reordered
    /// among their own slots; null when nothing changed.</summary>
    private static List<ComponentDto>? RewriteList(IReadOnlyList<ComponentDto> children, LayoutDelta delta)
    {
        var result = new List<ComponentDto>(children.Count);
        var changed = false;
        foreach (var child in children)
        {
            if (FieldId(child) is { } id && delta.Hidden.Contains(id))
            {
                changed = true;
                continue;
            }
            var rewritten = Rewrite(child, delta);
            changed |= !ReferenceEquals(rewritten, child);
            result.Add(rewritten);
        }
        if (ReorderFields(result, delta.Order) is { } ordered)
        {
            result = ordered;
            changed = true;
        }
        return changed ? result : null;
    }

    private static string? FieldId(ComponentDto c) =>
        c is ClientSideComponentDto { Metadata: FormFieldMetadataDto f } ? f.FieldId : null;

    /// <summary>The children with the form fields among them rearranged (the delta's order first,
    /// the rest in inferred order), or null when the order already matches. Only the field slots
    /// move: a Text or a nested layout between two fields stays put.</summary>
    private static List<ComponentDto>? ReorderFields(List<ComponentDto> children, IReadOnlyList<string> order)
    {
        if (order.Count == 0) return null;
        var slots = new List<int>();
        var fields = new List<ComponentDto>();
        for (var i = 0; i < children.Count; i++)
            if (FieldId(children[i]) is not null)
            {
                slots.Add(i);
                fields.Add(children[i]);
            }
        if (fields.Count < 2) return null;
        var rearranged = new List<ComponentDto>(fields.Count);
        foreach (var id in order)
            if (fields.FirstOrDefault(f => FieldId(f) == id && !rearranged.Contains(f)) is { } match)
                rearranged.Add(match);
        foreach (var f in fields)
            if (!rearranged.Contains(f)) rearranged.Add(f);
        if (rearranged.SequenceEqual(fields, ReferenceEqualityComparer.Instance)) return null;
        var result = new List<ComponentDto>(children);
        for (var i = 0; i < slots.Count; i++) result[slots[i]] = rearranged[i];
        return result;
    }
}
