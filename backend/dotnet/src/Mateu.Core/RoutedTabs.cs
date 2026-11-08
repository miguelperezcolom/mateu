using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>
/// Routed tabs — a record master whose registry <c>Children</c> are its tabs, and in-page tabs that
/// are URLs (Java's <c>RouteChains</c> + <c>RouteRegistry.chain/childrenOf/defaultChildOf</c>,
/// <c>AppMenuBuilder.childRouteTabs</c>, <c>FormLayoutBuilder.routedTabKey</c> and
/// <c>FeatureFlagGate</c>; Python's <c>routed_tabs</c>).
/// <para>A child route (<c>customers/:customerId/orders</c>) is the content of its parent's slot:
/// the parent — an app with no menu of its own, typically <c>[App(Variant = AppVariant.Tabs)]</c> —
/// offers its children as its tabs, opens its default one (<c>DefaultChild</c>, else the first
/// visible) when reached on its own, and a tab's own page does not repeat the tab's label as its
/// title (<see cref="DedupeTitle"/>). A child's <c>Show</c> names a feature flag
/// (<see cref="IFeatureFlags"/>): a tab whose flag is off leaves the bar, but its route keeps
/// answering. Every helper answers "nothing" rather than throwing.</para>
/// </summary>
internal static class RoutedTabs
{
    private sealed record Context(string? Route, IReadOnlyList<IFeatureFlags> Flags, RouteRegistry? Routes,
        MateuRegistry? Registry);

    private static readonly AsyncLocal<Context?> Current = new();

    /// <summary>Remembers the request's route, the deployment's flags and its tables for the
    /// mapping; dispose the result to forget them.</summary>
    public static IDisposable Begin(string? route, IReadOnlyList<IFeatureFlags> flags, RouteRegistry routes,
        MateuRegistry registry)
    {
        var previous = Current.Value;
        Current.Value = new Context(route, flags, routes, registry);
        return new Restore(previous);
    }

    private sealed class Restore(Context? previous) : IDisposable
    {
        public void Dispose() => Current.Value = previous;
    }

    /// <summary>The request route of the request being handled.</summary>
    public static string? RequestRoute => Current.Value?.Route;

    private static string Normalize(string? path) => RouteRegistry.Normalize((path ?? "").Split('?')[0]);

    /// <summary>A flag no <see cref="IFeatureFlags"/> knows is ON (Java's FeatureFlagGate.isOn).</summary>
    public static bool IsOn(string flag)
    {
        foreach (var supplier in Current.Value?.Flags ?? [])
        {
            bool? answer;
            try { answer = supplier.IsEnabled(flag); }
            catch (Exception) { continue; } // a broken supplier has no say
            if (answer is { } on) return on;
        }
        return true;
    }

    /// <summary>A <c>Show</c> condition — a flag name, optionally negated with <c>!</c>; blank = shown.</summary>
    public static bool Shows(string? condition)
    {
        if (string.IsNullOrWhiteSpace(condition)) return true;
        var trimmed = condition.Trim();
        var negated = trimmed.StartsWith('!');
        var flag = negated ? trimmed[1..].Trim() : trimmed;
        return negated != IsOn(flag);
    }

    /// <summary>A child route as seen from a concrete parent path: <c>Relative</c> with a leading
    /// slash (<c>/orders</c>), <c>Path</c> the child's concrete absolute path.</summary>
    public sealed record ChildRoute(RouteEntry Entry, string Relative, string Path);

    /// <summary>The authored children of the route answering <paramref name="concretePath"/>.</summary>
    public static List<ChildRoute> ChildrenOf(RouteRegistry? routes, string? concretePath)
    {
        if (routes is null || concretePath is null) return [];
        try
        {
            var normalized = Normalize(concretePath);
            if (routes.Match(normalized) is not { } match) return [];
            var parentRoute = Normalize(match.Entry.Route);
            var children = new List<ChildRoute>();
            foreach (var entry in routes.Authored().Routes)
            {
                if (!entry.HasParent() || Normalize(entry.Parent) != parentRoute) continue;
                var childRoute = Normalize(entry.Route);
                var suffix = childRoute[Math.Min(parentRoute.Length, childRoute.Length)..];
                if (!suffix.StartsWith('/')) suffix = "/" + suffix;
                children.Add(new ChildRoute(entry, suffix, "/" + normalized + suffix));
            }
            return children;
        }
        catch (Exception)
        {
            return [];
        }
    }

    /// <summary><see cref="ChildrenOf"/> without the ones whose <c>Show</c> flag is off, or whose
    /// <c>access:</c> the caller does not satisfy.</summary>
    public static List<ChildRoute> VisibleChildrenOf(RouteRegistry? routes, string? concretePath) =>
        ChildrenOf(routes, concretePath)
            .Where(c => Shows(c.Entry.Show) && (c.Entry.Access is not { } access || ActionGuard.Authorized(access)))
            .ToList();

    /// <summary>The default child of the route answering <paramref name="concretePath"/> among the
    /// visible ones: the one its <c>DefaultChild</c> names when that one shows, else the first.</summary>
    public static string? DefaultChildPath(RouteRegistry? routes, string? concretePath)
    {
        var children = VisibleChildrenOf(routes, concretePath);
        if (children.Count == 0) return null;
        var named = routes?.Match(Normalize(concretePath))?.Entry.DefaultChild;
        if (!string.IsNullOrWhiteSpace(named))
        {
            var wanted = "/" + Normalize(named);
            if (children.FirstOrDefault(c => c.Relative == wanted) is { } child) return child.Path;
        }
        return children[0].Path;
    }

    /// <summary>The chain answering <paramref name="path"/> (outermost first), each entry with its
    /// CONCRETE path (Java's RouteRegistry.chain).</summary>
    public static List<(RouteEntry Entry, string Path)> ChainLinks(RouteRegistry? routes, string? path)
    {
        if (routes is null || path is null) return [];
        try
        {
            var segments = Normalize(path) is { Length: > 0 } n ? n.Split('/') : [];
            return routes.Chain(path)
                .Select(e =>
                {
                    var depth = Normalize(e.Route) is { Length: > 0 } r ? r.Split('/').Length : 0;
                    return (e, "/" + string.Join('/', segments.Take(depth)));
                })
                .ToList();
        }
        catch (Exception)
        {
            return [];
        }
    }

    private static string? StaticTitleOf(MateuRegistry? registry, string? viewModel)
    {
        if (string.IsNullOrWhiteSpace(viewModel) || registry is null) return null;
        try
        {
            var title = registry.TypeByName(viewModel)?.GetCustomAttributes(typeof(TitleAttribute), false)
                .OfType<TitleAttribute>().FirstOrDefault()?.Value;
            return string.IsNullOrWhiteSpace(title) ? null : title;
        }
        catch (Exception)
        {
            return null;
        }
    }

    /// <summary>The label of a child route offered as a tab: its view model's [Title], else its
    /// segment humanized.</summary>
    public static string TabLabel(MateuRegistry? registry, RouteEntry entry, string relative)
    {
        if (StaticTitleOf(registry, entry.ViewModel) is { } title) return title;
        var trimmed = relative.Trim('/');
        var last = trimmed.Contains('/') ? trimmed[(trimmed.LastIndexOf('/') + 1)..] : trimmed;
        return Naming.HumanizeConstant(last.Replace('-', ' '));
    }

    /// <summary><paramref name="title"/> unless the request is a routed tab's own page and the title
    /// equals that tab's label or the enclosing master's title — then null: the label is drawn once,
    /// by the tab (Java's RouteChains.dedupeTitle).</summary>
    public static string? DedupeTitle(string? title)
    {
        var context = Current.Value;
        if (string.IsNullOrWhiteSpace(title) || context?.Route is not { } route) return title;
        try
        {
            var chain = ChainLinks(context.Routes, route);
            if (chain.Count < 2) return title;
            var (leaf, leafPath) = chain[^1];
            if ("/" + Normalize(route) != leafPath) return title; // a record inside the tab
            var (parent, parentPath) = chain[^2];
            var relative = leafPath[Math.Min(parentPath.Length, leafPath.Length)..];
            if (string.Equals(title.Trim(), TabLabel(context.Registry, leaf, relative).Trim(),
                    StringComparison.OrdinalIgnoreCase)) return null;
            if (StaticTitleOf(context.Registry, parent.ViewModel) is { } parentTitle
                && string.Equals(title.Trim(), parentTitle.Trim(), StringComparison.OrdinalIgnoreCase)) return null;
            return title;
        }
        catch (Exception)
        {
            return title;
        }
    }

    /// <summary>Where the type named <paramref name="wanted"/> is mounted inside
    /// <paramref name="route"/>: the SHORTEST prefix the authored table answers with that very view
    /// model (Java's ActionInstanceCreator.mountOf); null when none does.</summary>
    public static string? MountOf(RouteRegistry? routes, string? route, string? wanted)
    {
        if (routes is null || route is null || string.IsNullOrWhiteSpace(wanted)) return null;
        var segments = Normalize(route).Split('/', StringSplitOptions.RemoveEmptyEntries);
        for (var n = 1; n <= segments.Length; n++)
        {
            var prefix = string.Join('/', segments.Take(n));
            RouteMatch? match;
            try { match = routes.Match(prefix); }
            catch (Exception) { match = null; }
            if (match is not null && match.Entry.ViewModel == wanted) return "/" + prefix;
        }
        return null;
    }

    /// <summary>The tab key the request route ends with, or null: <c>/vcn/7/gateways</c> opens Gateways.</summary>
    public static string? RoutedTabKey(IEnumerable<string?> keys)
    {
        var route = RequestRoute;
        if (string.IsNullOrWhiteSpace(route)) return null;
        var path = route.Split('?')[0].TrimEnd('/');
        var last = path[(path.LastIndexOf('/') + 1)..];
        return keys.FirstOrDefault(k => !string.IsNullOrWhiteSpace(k) && k == last);
    }
}
