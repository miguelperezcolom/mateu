using Mateu.Dtos;

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
    /// (Mirrors Java's RouteChains.insideBackLinkApp.)</summary>
    internal bool InsideBackLinkApp(string? route)
    {
        if (route is null) return false;
        var chain = _routes.Chain(route);
        for (var i = 0; i < chain.Count - 1; i++)
        {
            if (chain[i].ViewModel is not { Length: > 0 } viewModel) continue;
            try
            {
                if (registry.TypeByName(viewModel) is { } type && ReflectionMapper.BackLinkParent(type)) return true;
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
    internal static ComponentDto Off(ComponentDto component, bool deep) => component switch
    {
        ClientSideComponentDto { Metadata: PageMetadataDto page } client => client with
        {
            Metadata = page with { NoBreadcrumbs = true },
            Children = deep ? client.Children.Select(c => Off(c, true)).ToList() : client.Children,
        },
        ClientSideComponentDto client when deep => client with
        {
            Children = client.Children.Select(c => Off(c, true)).ToList(),
        },
        ServerSideComponentDto server => server with
        {
            Children = server.Children.Select(c => deep ? Off(c, true) : TopPage(c)).ToList(),
        },
        _ => component,
    };

    private static ComponentDto TopPage(ComponentDto component) =>
        component is ClientSideComponentDto { Metadata: PageMetadataDto page } client
            ? client with { Metadata = page with { NoBreadcrumbs = true } }
            : component;
}
