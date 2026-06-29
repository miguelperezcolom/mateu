using System.Reflection;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>Discovers [App] and [UI] view types in the given assemblies and resolves them by route or type name.</summary>
public sealed class MateuRegistry
{
    private readonly Dictionary<string, Type> _byRoute = new();
    private readonly Dictionary<string, Type> _byName = new();

    public Type? AppType { get; }

    public MateuRegistry(params Assembly[] assemblies)
    {
        var asms = assemblies.Length > 0 ? assemblies : [Assembly.GetEntryAssembly()!];
        foreach (var asm in asms)
        foreach (var type in asm.GetTypes())
        {
            if (type.GetCustomAttribute<AppAttribute>() is not null)
            {
                AppType = type;
                _byName[type.FullName!] = type;
            }
            var ui = type.GetCustomAttribute<UIAttribute>();
            if (ui is null) continue;
            _byRoute[Normalize(ui.Route)] = type;
            _byName[type.FullName!] = type;
        }
    }

    /// <summary>Resolves the type for a request: by serverSideType, else by route, else the app shell at root.</summary>
    public Type? Resolve(string? serverSideType, string? route)
    {
        if (!string.IsNullOrEmpty(serverSideType) && _byName.TryGetValue(serverSideType, out var t))
            return t;
        var norm = Normalize(route);
        if (_byRoute.TryGetValue(norm, out var r)) return r;
        return norm == "" ? AppType : null;
    }

    /// <summary>Finds the registered view whose route is the longest prefix of <paramref name="route"/>
    /// (so CRUD sub-routes like "reservations/7/edit" resolve to the "reservations" view).</summary>
    public (Type Type, string BaseRoute)? ResolveByPrefix(string? route)
    {
        var norm = Normalize(route);
        var parts = norm.Length == 0 ? [] : norm.Split('/');
        for (var n = parts.Length; n >= 1; n--)
        {
            var prefix = string.Join('/', parts.Take(n));
            if (_byRoute.TryGetValue(prefix, out var t)) return (t, prefix);
        }
        return null;
    }

    public static string Normalize(string? route)
    {
        var r = (route ?? "").Trim('/');
        return r is "" or "_empty" or "_no_route" or "_no_home_route" ? "" : r;
    }
}
