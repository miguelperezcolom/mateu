using Mateu.Dtos;

namespace Mateu.Core;

/// <summary>
/// Conformance check for menu routes: every route a menu leaf points at must resolve to a known
/// route. A leaf is a route or a rule — a route leaf that points nowhere is the failure this
/// catches, recovering the safety a typed-class menu reference used to give (the class had to exist)
/// now that a leaf can carry a plain route string.
///
/// <para>Pure over the built menu and the known route table so it mirrors 1:1 across the backends
/// and can be asserted in a test / CI check. Only leaves that actually navigate LOCALLY are checked:
/// a rule leaf (runs client-side), a separator, a remote leaf (a federated app, not resolvable
/// here), an external URL and an empty placeholder are all skipped. (Mirrors Java's
/// io.mateu.core.application.MenuRouteConformance and Python's menu_route_conformance.)</para>
/// </summary>
public static class MenuRouteConformance
{
    /// <summary>The absolute routes of leaves that resolve to no entry in <paramref name="knownRoutes"/>,
    /// in menu order.</summary>
    public static IReadOnlyList<string> DanglingRoutes(
        IReadOnlyList<MenuItemDto>? menu, RouteTable knownRoutes)
    {
        var dangling = new List<string>();
        Collect(menu, knownRoutes, dangling);
        return dangling;
    }

    private static void Collect(
        IReadOnlyList<MenuItemDto>? menu, RouteTable knownRoutes, List<string> outList)
    {
        if (menu is null) return;
        foreach (var option in menu)
        {
            if (option is null) continue;
            if (option.Submenus is { Count: > 0 })
            {
                Collect(option.Submenus, knownRoutes, outList); // a group, not a leaf — recurse
                continue;
            }
            if (option.Separator) continue;
            if (option.Rules is { Count: > 0 }) continue; // a rule leaf: runs client-side
            if (option.Remote) continue; // a federated app: resolved by the remote, not here
            var route = option.Route;
            if (string.IsNullOrWhiteSpace(route) || IsExternal(route)) continue; // placeholder / URL
            if (knownRoutes.Match(route) is null) outList.Add(route);
        }
    }

    private static bool IsExternal(string route) =>
        route.StartsWith("http:") || route.StartsWith("https:") || route.StartsWith("//");
}
