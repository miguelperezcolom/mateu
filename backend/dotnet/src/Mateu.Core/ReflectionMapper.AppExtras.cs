using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// The app-shell extras of the E2 patterns (Java: AppShellExtrasMapper): app-wide shortcuts and
// quick-launch codes, live header values (+ the live event stream flag) and the idle-session warning.
public sealed partial class ReflectionMapper
{
    /// <summary>The app-level keep-alive action id (Java's KeepAliveActionRunner.ACTION_ID).</summary>
    public const string KeepAliveActionId = "_keep-alive";

    /// <summary>The app-level live-updates action id (Java's LiveUpdatesActionRunner.ACTION_ID).</summary>
    public const string LiveUpdatesActionId = "_live-updates";

    /// <summary>[AppShortcut]s of the app class: key lowercased, route made absolute like the menu's,
    /// a missing label derived from the route (last segment humanized) or the action id; entries
    /// with nothing to press (no key, no code) or nowhere to go (no route, no action) dropped.</summary>
    internal static IReadOnlyList<AppShortcutDto> MapShortcuts(Type appType, string appRoute)
    {
        var result = new List<AppShortcutDto>();
        foreach (var s in appType.GetCustomAttributes<AppShortcutAttribute>())
        {
            var key = Blank(s.Key);
            var code = Blank(s.Code);
            var route = Blank(s.Route);
            var actionId = Blank(s.ActionId);
            if ((key is null && code is null) || (route is null && actionId is null)) continue;
            var label = Blank(s.Label)
                        ?? (route is not null ? RouteLabel(route) : Naming.HumanizeConstant(actionId!));
            result.Add(new AppShortcutDto(key?.ToLowerInvariant(), label,
                route is null ? null : AbsoluteRoute(appRoute, route), actionId, code));
        }
        return result;
    }

    internal static string AbsoluteRoute(string appRoute, string route)
    {
        if (appRoute.Length > 0 && (route == appRoute || route.StartsWith(appRoute + "/"))) return route;
        return Prepend(appRoute, route);
    }

    private static string RouteLabel(string route)
    {
        var path = route.TrimEnd('/');
        var segment = path[(path.LastIndexOf('/') + 1)..];
        return segment.Length == 0 ? "Home" : Naming.HumanizeConstant(segment.Replace('-', ' '));
    }

    /// <summary>The supplier's header values; for a live app the last PUBLISHED value of a declared
    /// id replaces the supplied one (it is newer), label kept.</summary>
    internal static IReadOnlyList<HeaderValueDto> MapHeaderValues(Type appType, AppAttribute app)
    {
        if (!typeof(IHeaderValuesSupplier).IsAssignableFrom(appType)
            || Activator.CreateInstance(appType) is not IHeaderValuesSupplier supplier)
            return [];
        var byId = new Dictionary<string, HeaderValue>();
        var order = new List<string>();
        foreach (var v in supplier.HeaderValues() ?? [])
        {
            if (v?.Id is null) continue;
            if (!byId.ContainsKey(v.Id)) order.Add(v.Id);
            byId[v.Id] = v;
        }
        if (app.LiveUpdates)
            foreach (var (id, published) in LiveHeaderValues.Current)
                if (byId.TryGetValue(id, out var declared)) byId[id] = declared with { Value = published };
        return order.Select(id => byId[id])
            .Select(v => new HeaderValueDto(v.Id, Blank(v.Label), v.Value)).ToList();
    }

    /// <summary>The idle-session warning in seconds; null when off. The warning is clamped to
    /// [5, timeout]; no sign-out url = the app's route, else "/".</summary>
    internal static IdleSessionDto? MapIdleSession(AppAttribute app, string appRoute)
    {
        if (app.IdleTimeoutMinutes <= 0) return null;
        var timeout = app.IdleTimeoutMinutes * 60;
        var warning = Math.Max(5, Math.Min(app.IdleWarningSeconds, timeout));
        var signOut = Blank(app.IdleSignOutUrl) ?? (appRoute.Length > 0 ? appRoute : "/");
        return new IdleSessionDto(timeout, warning, signOut, KeepAliveActionId);
    }

    private static string? Blank(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
