using Microsoft.Extensions.Logging;
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
public sealed class YamlSpecLoader : ISpecsCache
{
    /// <summary>A parsed page spec: the layout, plus the ModelView class name when the YAML declares
    /// one, plus its <c>layoutDelta:</c> (empty when none; a delta-only page has no Layout).</summary>
    public sealed record Spec(string? ModelView, IComponent? Layout)
    {
        public LayoutDelta Delta { get; init; } = LayoutDelta.Empty;

        /// <summary>The deserialised source tree, kept only when the spec depends on WHO asks
        /// (access keys) or in which LANGUAGE (<c>${i18n.…}</c>) — it is re-derived per request.</summary>
        public object? Source { get; init; }

        /// <summary>Ids of declared <c>actions:</c> the caller may not run (403 if invoked).</summary>
        public IReadOnlySet<string> RefusedActions { get; init; } = new HashSet<string>();

        /// <summary>Ids of fields hidden or read-only for the caller: their client values are dropped.</summary>
        public IReadOnlySet<string> LockedFields { get; init; } = new HashSet<string>();

        public bool DependsOnRequest => Source is not null;
    }

    private static readonly Spec None = new(null, null);
    private readonly ConcurrentDictionary<string, Spec> _byRoute = new();
    private readonly string _dir;

    /// <summary>When a route's registry entry names a <c>definition</c>, THAT file is the layout —
    /// instead of the <c>&lt;route&gt;.yaml</c> convention, which ties a screen's layout to its URL
    /// and so prevents one definition from serving several routes.</summary>
    private readonly RouteRegistry _registry;

    /// <summary>Resolves <c>type: Partial</c> nodes against <c>&lt;specs&gt;/partials/</c>, so a
    /// definition can reuse a piece rather than repeat it.</summary>
    private readonly PartialRegistry _partials;

    /// <summary>The catalogue <c>${i18n.…}</c> expressions resolve against.</summary>
    private readonly TranslationRegistry _translations;

    /// <summary>The field types (<c>types.yaml</c> + code suppliers) a <c>fieldType:</c> reference
    /// in a definition is resolved against, before the tree is built.</summary>
    private readonly FieldTypeRegistry _fieldTypes;

    public YamlSpecLoader(string? dir = null, RouteRegistry? registry = null, PartialRegistry? partials = null,
        TranslationRegistry? translations = null, FieldTypeRegistry? fieldTypes = null)
    {
        _dir = dir ?? Environment.GetEnvironmentVariable("MATEU_SPECS_DIR")
                   ?? Path.Combine("specs", "ui");
        _registry = registry ?? new RouteRegistry(_dir);
        _partials = partials ?? new PartialRegistry(_dir);
        _translations = translations ?? new TranslationRegistry(dir: _dir);
        _fieldTypes = fieldTypes ?? new FieldTypeRegistry(_dir);
        DevSpecs.Register(this);
    }

    /// <summary>The route registry this loader resolves definitions through.</summary>
    public RouteRegistry Routes => _registry;

    /// <summary>The spec for a route AS THIS REQUEST SEES IT: one that declares access keys or
    /// <c>${i18n.…}</c> is re-derived from its source for the caller (<paramref name="granted"/>)
    /// and <paramref name="locale"/> — on the server, so the wire already carries what this caller
    /// may see, in their language. (Mirrors Java's YamlUidlLoader.loadSpec(route, httpRequest).)</summary>
    public Spec? LoadSpec(string? route, Func<Access?, bool> granted, string? locale)
    {
        var spec = LoadSpec(route);
        if (spec is not { DependsOnRequest: true }) return spec;
        try
        {
            var tree = spec.Source;
            IReadOnlySet<string> refused = new HashSet<string>(), locked = new HashSet<string>();
            // the action catalogue's restricted entries this page names (not its own): enforced
            // like the page's own refused actions (mirrors Java's catalogueActionsRefusedIn)
            var catalogueRefused = ActionRegistry.CatalogueIdsNamedBy(tree);
            catalogueRefused.IntersectWith(MateuCatalogs.RefusedActions);
            if (YamlAccess.DeclaresAccess(tree) || catalogueRefused.Count > 0)
            {
                var applied = YamlAccess.Apply(tree, granted, path => _registry.IsReachable(path, granted),
                    catalogueRefused);
                (tree, refused, locked) = (applied.Tree, applied.RefusedActions, applied.LockedFields);
            }
            else tree = YamlAccess.DeepCopy(tree);
            if (tree is null) return null;
            tree = _translations.TranslateTree(tree, locale);
            var (_, layout, delta) = YamlComponentBuilder.ParsePageNode(tree, _partials, _fieldTypes);
            return spec with { Layout = layout, Delta = delta, Source = null, RefusedActions = refused, LockedFields = locked };
        }
        catch (Exception e)
        {
            MateuLogging.For("Mateu.Yaml").LogWarning(e, "Failed to personalise the YAML spec for {Route}: {Error}", route, e.Message);
            return spec;
        }
    }

    /// <summary>Dev mode: a spec changed — every parsed definition is read again on next use.</summary>
    public void InvalidateSpecs() => _byRoute.Clear();

    /// <summary>The partial registry this loader resolves refs against. Tests register in code.</summary>
    public PartialRegistry Partials => _partials;

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
        if (!File.Exists(path))
        {
            // routes.yaml names a layout file that is not there: say so, or the route answers "not
            // found" with nothing to tell a typo in the file name from a route nobody declared.
            if (declared is not null)
                MateuLogging.For("Mateu.Yaml").LogWarning(
                    "routes.yaml: route \"{Route}\" names layout \"{Layout}\", but {Path} does not exist. Check the file name (it is relative to specs/ui/) or create the file.",
                    normalizedRoute, declared, path);
            return None;
        }
        try
        {
            var root = YamlComponentBuilder.Deserialize(File.ReadAllText(path));
            var (modelView, layout, delta) = YamlComponentBuilder.ParsePageNode(root, _partials, _fieldTypes);
            if (layout is null && delta.IsEmpty) return None;
            // A spec that depends on who asks or in which language keeps its source tree, so it can
            // be re-derived per request; everything else is shared as-is.
            var dependsOnRequest = YamlAccess.DeclaresAccess(root) || TranslationRegistry.MentionsI18n(root)
                                   || ReferencesRestrictedCatalogueAction(root);
            // The definition is layout; the binding to a view model belongs to the route entry. A
            // YAML that still declares modelView: keeps working and wins — but a definition shared
            // by several routes must NOT name one, or it could only ever serve the class it names.
            if (string.IsNullOrWhiteSpace(modelView) && !string.IsNullOrWhiteSpace(entry?.ViewModel))
                modelView = entry!.ViewModel;
            return new Spec(modelView, layout) { Delta = delta, Source = dependsOnRequest ? root : null };
        }
        catch (Exception e)
        {
            // An unparseable definition used to answer a silent "Not found." — indistinguishable
            // from a route nobody declared. Say which file and why.
            MateuLogging.For("Mateu.Yaml").LogWarning(e, "YAML definition {Path} could not be loaded: {Error}", path, e.Message);
            return None;
        }
    }

    /// <summary>Whether the tree names a catalogue action that declares <c>access:</c> (the catalogue
    /// in effect for the request — set by the SyncHandler).</summary>
    private static bool ReferencesRestrictedCatalogueAction(object? root)
    {
        var restricted = ActionRegistry.RestrictedIn(MateuCatalogs.Actions);
        return restricted.Count > 0 && ActionRegistry.CatalogueIdsNamedBy(root).Overlaps(restricted);
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
