using System.Collections.Concurrent;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>
/// Loads a page defined in a YAML file under <c>specs/ui/</c> relative to the working directory —
/// the .NET analogue of Java's classpath-based YamlUidlLoader. A spec is a component tree, optionally
/// wrapped in an envelope with a <c>modelView:</c> key naming the logic class that supplies state and
/// actions (the YAML supplies only the layout). The binding is by convention, as everywhere in Mateu:
/// a FormField <c>id="name"</c> binds to the ModelView's <c>Name</c> property, a Button
/// <c>actionId="save"</c> to its <c>Save()</c> method.
/// </summary>
/// <remarks>
/// Specs are static files, so each route is parsed once and cached (a miss is cached too, so an
/// unmatched route — checked on every request that has no view class — does not stat the disk each
/// time). Editing a spec during development needs a restart to be picked up. Override the specs
/// directory with the MATEU_SPECS_DIR environment variable (default: <c>specs/ui</c> under the cwd).
/// </remarks>
public sealed class YamlSpecLoader
{
    /// <summary>A parsed page spec: the layout, plus the ModelView class name when the YAML declares one.</summary>
    public sealed record Spec(string? ModelView, IComponent? Layout);

    private static readonly Spec None = new(null, null);
    private readonly ConcurrentDictionary<string, Spec> _byRoute = new();
    private readonly string _dir;

    /// <summary>When a route's registry entry names a <c>definition</c>, THAT file is the layout —
    /// instead of the <c>&lt;route&gt;.yaml</c> convention, which ties a screen's layout to its URL
    /// and so prevents one definition from serving several routes.</summary>
    private readonly RouteRegistry _registry;

    public YamlSpecLoader(string? dir = null, RouteRegistry? registry = null)
    {
        _dir = dir ?? Environment.GetEnvironmentVariable("MATEU_SPECS_DIR")
                   ?? Path.Combine("specs", "ui");
        _registry = registry ?? new RouteRegistry(_dir);
    }

    /// <summary>The parsed spec for a route (<c>specs/ui/&lt;route&gt;.yaml</c>), or null when there is none.</summary>
    public Spec? LoadSpec(string? route)
    {
        var spec = _byRoute.GetOrAdd(Normalize(route), Parse);
        return ReferenceEquals(spec, None) ? null : spec;
    }

    private Spec Parse(string normalizedRoute)
    {
        var entry = _registry.Match(normalizedRoute)?.Entry;
        var declared = string.IsNullOrWhiteSpace(entry?.Definition) ? null : entry!.Definition;
        var path = Path.Combine(_dir, declared ?? normalizedRoute + ".yaml");
        if (!File.Exists(path)) return None;
        try
        {
            var (modelView, layout) = YamlComponentBuilder.ParseSpec(File.ReadAllText(path));
            if (layout is null) return None;
            // The definition is layout; the binding to a view model belongs to the route entry. A
            // YAML that still declares modelView: keeps working and wins — but a definition shared
            // by several routes must NOT name one, or it could only ever serve the class it names.
            if (string.IsNullOrWhiteSpace(modelView) && !string.IsNullOrWhiteSpace(entry?.ViewModel))
                modelView = entry!.ViewModel;
            return new Spec(modelView, layout);
        }
        catch { return None; }
    }

    private static string Normalize(string? route)
    {
        var r = route ?? "";
        var q = r.IndexOf('?');
        if (q >= 0) r = r[..q];
        r = r.Trim('/');
        return r is "_empty" or "_no_route" or "_no_home_route" ? "" : r;
    }
}
