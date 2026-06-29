using System.Reflection;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>Discovers [UI] view types in the given assemblies and resolves them by route or type name.</summary>
public sealed class MateuRegistry
{
    private readonly Dictionary<string, Type> _byRoute = new();
    private readonly Dictionary<string, Type> _byName = new();

    public MateuRegistry(params Assembly[] assemblies)
    {
        var asms = assemblies.Length > 0 ? assemblies : [Assembly.GetEntryAssembly()!];
        foreach (var asm in asms)
        foreach (var type in asm.GetTypes())
        {
            var ui = type.GetCustomAttribute<UIAttribute>();
            if (ui is null) continue;
            _byRoute[Normalize(ui.Route)] = type;
            _byName[type.FullName!] = type;
        }
    }

    /// <summary>Resolves the view type for a request: by serverSideType if present, else by route.</summary>
    public Type? Resolve(string? serverSideType, string? route)
    {
        if (!string.IsNullOrEmpty(serverSideType) && _byName.TryGetValue(serverSideType, out var t))
            return t;
        return _byRoute.TryGetValue(Normalize(route), out var r) ? r : null;
    }

    // "", "/", "_empty", "_no_route" all mean the root route.
    private static string Normalize(string? route)
    {
        var r = (route ?? "").Trim('/');
        return r is "" or "_empty" or "_no_route" or "_no_home_route" ? "" : r;
    }
}
