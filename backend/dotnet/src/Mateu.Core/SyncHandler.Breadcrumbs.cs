using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// The page-level breadcrumb switch decided by the REQUEST, not by the page: a page whose route runs,
// through a routes.yaml parent chain, under an app declared [App(BackLink = Parent)] carries no trail
// of its own — the app's "← Parent" link replaces it (Java's PageMapper + RouteChains.insideBackLinkApp).
internal sealed partial class SyncHandler
{
    /// <summary>The increment with <c>NoBreadcrumbs</c> set on every page it carries when the request
    /// route runs under a back-link app (else unchanged).</summary>
    private UIIncrementDto WithBackLinkBreadcrumbs(UIIncrementDto increment, RunActionRqDto rq)
    {
        if (increment.Fragments.Count == 0 || !InsideBackLinkApp(rq.Route)) return increment;
        return increment with
        {
            Fragments = increment.Fragments
                .Select(f => f.Component is null ? f : f with { Component = PageBreadcrumbs.Off(f.Component, deep: true) })
                .ToList(),
        };
    }

    /// <summary>Whether <paramref name="route"/> runs through an app ANCESTOR (any link of its
    /// routes.yaml chain but the last) whose view model is an app offering a "← Parent" link.
    /// (Mirrors Java's RouteChains.insideBackLinkApp.) Like Java, only the class's
    /// <c>[App(BackLink = …)]</c> counts — a code shell's (IAppSupplier) own BackLink draws the app's
    /// "← Parent" link but does not turn its pages' trails off.</summary>
    internal bool InsideBackLinkApp(string? route)
    {
        if (route is null) return false;
        var chain = _routes.Chain(route);
        for (var i = 0; i < chain.Count - 1; i++)
        {
            if (chain[i].ViewModel is not { Length: > 0 } viewModel) continue;
            try
            {
                if (registry.TypeByName(viewModel) is { } type
                    && type.GetCustomAttribute<AppAttribute>()?.BackLink == BackLink.Parent) return true;
            }
            catch (Exception)
            {
                // not a class we can read: no say
            }
        }
        return false;
    }
}

/// <summary>Turns a page's automatic breadcrumb trail off on the wire.</summary>
internal static class PageBreadcrumbs
{
    /// <summary>The component with <c>NoBreadcrumbs = true</c> on its pages: the pages directly under
    /// it (<paramref name="deep"/> false — an embedded view's own page), or every page of the tree.</summary>
    /// <remarks>Deep, it walks the components a metadata record holds too (a card's, a drawer's or
    /// a dialog's content…), as Java's PageMapper marks every page it maps.</remarks>
    internal static ComponentDto Off(ComponentDto component, bool deep) => component switch
    {
        ClientSideComponentDto { Metadata: PageMetadataDto page } client => client with
        {
            Metadata = deep ? (PageMetadataDto)InMetadata(page with { NoBreadcrumbs = true })! : page with { NoBreadcrumbs = true },
            Children = deep ? client.Children.Select(c => Off(c, true)).ToList() : client.Children,
        },
        ClientSideComponentDto client when deep => client with
        {
            Metadata = (ComponentMetadataDto)InMetadata(client.Metadata)!,
            Children = client.Children.Select(c => Off(c, true)).ToList(),
        },
        ServerSideComponentDto server => server with
        {
            Children = server.Children.Select(c => deep ? Off(c, true) : TopPage(c)).ToList(),
        },
        _ => component,
    };

    private static readonly System.Reflection.Assembly Dtos = typeof(ComponentDto).Assembly;

    private static readonly System.Reflection.MethodInfo Clone =
        typeof(object).GetMethod("MemberwiseClone", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic)!;

    /// <summary>The value with every component it holds — at any depth of its wire-DTO members and
    /// lists — passed through <see cref="Off"/> (deep); the value itself when it holds none.</summary>
    private static object? InMetadata(object? value)
    {
        switch (value)
        {
            case null or string: return value;
            case ComponentDto component: return Off(component, true);
        }
        var type = value.GetType();
        if (type.IsArray || (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(List<>)))
        {
            var element = type.IsArray ? type.GetElementType()! : type.GetGenericArguments()[0];
            if (element.IsValueType || element == typeof(string)
                || (element.Assembly != Dtos && element != typeof(object))) return value;
            var items = (System.Collections.IList)value;
            var mapped = new object?[items.Count];
            var changed = false;
            for (var i = 0; i < items.Count; i++)
            {
                mapped[i] = InMetadata(items[i]);
                changed |= !ReferenceEquals(mapped[i], items[i]);
            }
            if (!changed) return value;
            var copy = type.IsArray
                ? Array.CreateInstance(element, items.Count)
                : (System.Collections.IList)Activator.CreateInstance(type)!;
            for (var i = 0; i < mapped.Length; i++)
                if (copy is Array array) array.SetValue(mapped[i], i);
                else copy.Add(mapped[i]);
            return copy;
        }
        if (type.Assembly != Dtos || type.IsValueType || type.IsEnum) return value;
        object? clone = null;
        foreach (var property in type.GetProperties(System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.Public))
        {
            if (!property.CanRead || !property.CanWrite || property.GetIndexParameters().Length > 0) continue;
            var current = property.GetValue(value);
            var next = InMetadata(current);
            if (ReferenceEquals(next, current)) continue;
            clone ??= Clone.Invoke(value, null);
            property.SetValue(clone, next);
        }
        return clone ?? value;
    }

    private static ComponentDto TopPage(ComponentDto component) =>
        component is ClientSideComponentDto { Metadata: PageMetadataDto page } client
            ? client with { Metadata = page with { NoBreadcrumbs = true } }
            : component;
}
