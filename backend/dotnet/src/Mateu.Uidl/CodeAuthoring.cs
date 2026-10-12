using Mateu.Dtos;
using Access = Mateu.Uidl.Access;

// The code-authoring types live in the Mateu.Uidl ASSEMBLY (since 3.0-alpha.412), so a UI module
// that only references Mateu.Uidl can author routes and app shells in code. Their full names keep
// the Mateu.Core NAMESPACE on purpose: Mateu.Core type-forwards them here, so code (and binaries)
// written against the old location keep compiling and loading — a second, same-named type in the
// Mateu.Uidl namespace would make every file importing both namespaces ambiguous (CS0104).
namespace Mateu.Core;

/// <summary>
/// One entry of a mount's route registry: what a URL resolves to. (Mirrors Java's
/// <c>io.mateu.uidl.data.RouteEntry</c> and Python's <c>RouteEntry</c>.)
/// </summary>
/// <param name="Route">Path RELATIVE to the mount, with <c>:name</c> segments for path parameters.
/// "" is the mount's root view.</param>
/// <param name="Definition">The layout file. Null when the view model supplies its own tree.</param>
/// <param name="ViewModel">The server class. <b>Optional on purpose</b>: a statically deployed route
/// has no server behind it, so a definition with no view model is a valid, complete route.</param>
/// <param name="FixedParams">Pinned — NOT overridable by the request. Re-applied on the server
/// rather than trusted from the client, or "fixed" would be a suggestion and flipping one via the
/// query string would be a capability escalation.</param>
/// <param name="DefaultParams">Seeded — the request may override them.</param>
/// <param name="Parent">The ABSOLUTE route of the screen whose slot this route fills, or null for a
/// top-level route. A sub-route with a parent does not replace the page: the parent renders its
/// shell and this route's screen is nested into the parent's slot. Set when the authored
/// <c>children</c> tree is flattened. (Mirrors Java's RouteEntry.parent.)</param>
/// <param name="Children">Sub-routes nested under this one, authored RELATIVE to it. Each child
/// fills this screen's slot. This is the AUTHORING shape; the registry flattens it into absolute
/// entries carrying <c>Parent</c>, so a table entry read at runtime has an empty Children.</param>
/// <param name="State">Literal values that seed the route's component/route state on entry (the
/// componentState scope). They enter at the client-state/defaults precedence level, so a pinned
/// parameter still wins. (Mirrors Java's RouteEntry.state.)</param>
/// <param name="AppState">Literal values that seed the app state on entry (the app-scoped store
/// that [AppContext] also feeds, persisted across navigation). (Mirrors RouteEntry.appState.)</param>
/// <param name="Data">The route's component/route data, a reference to a named data source; there
/// is no literal data channel, data is always sourced. Resolved when the route loads.</param>
/// <param name="AppData">The route's app data, a reference to a named data source resolved once at
/// app scope (shared across routes).</param>
/// <param name="Access">Who may reach this route (<c>access:</c> in routes.yaml): a caller who does
/// not satisfy it gets 403 for the route and every route nested under it — the same as a
/// class-level [EyesOnly] view. Null = anybody. (Mirrors Java's RouteEntry.access.)</param>
public sealed record RouteEntry(
    string Route,
    string? Definition,
    string? ViewModel,
    IReadOnlyDictionary<string, object?> FixedParams,
    IReadOnlyDictionary<string, object?> DefaultParams,
    string? Parent = null,
    IReadOnlyList<RouteEntry>? Children = null,
    IReadOnlyDictionary<string, object?>? State = null,
    IReadOnlyDictionary<string, object?>? AppState = null,
    RestDataSourceDto? Data = null,
    RestDataSourceDto? AppData = null,
    Access? Access = null)
{
    /// <summary>Whether this route declares an identity restriction (<c>access:</c>): a caller who
    /// does not satisfy it is refused this route and every route nested under it (403).</summary>
    public bool RestrictsAccess() => Access is { } a && a.Restricts();

    public static RouteEntry Of(string route, string? viewModel) =>
        new(route, null, viewModel, EmptyParams, EmptyParams);

    internal static readonly IReadOnlyDictionary<string, object?> EmptyParams =
        new Dictionary<string, object?>();

    /// <summary>Whether this route fills the slot of a parent screen rather than replacing the page.</summary>
    public bool HasParent() => !string.IsNullOrWhiteSpace(Parent);

    public IReadOnlyList<string> PathParams() =>
        Route.Split('/')
            .Where(s => s.StartsWith(':') && s.Length > 1)
            .Select(s => s[1..])
            .ToList();

    /// <summary>Defaults first (with <c>State</c> seeded at that same level), then whatever the
    /// request brought, then the fixed ones — which win over everything, which is the whole point of
    /// declaring them fixed.</summary>
    public Dictionary<string, object?> ResolveParams(IReadOnlyDictionary<string, object?>? fromRequest)
    {
        var resolved = new Dictionary<string, object?>(DefaultParams);
        // `State` seeds at the defaults level too (literal component state the route brings).
        if (State is not null)
            foreach (var kv in State) resolved.TryAdd(kv.Key, kv.Value);
        if (fromRequest is not null)
            foreach (var kv in fromRequest) resolved[kv.Key] = kv.Value;
        foreach (var kv in FixedParams) resolved[kv.Key] = kv.Value;
        return resolved;
    }
}

/// <summary>
/// Implemented by a class that contributes entries to the app's route registry IN CODE, rather than
/// declaring them in <c>routes.yaml</c> — for routes that come from configuration, a database, or
/// that differ per environment. The programmatic half of the authored side of the two-producer route
/// table (the C# mirror of Java's <c>RouteEntrySupplier</c>).
///
/// <para>An attribute can only express the one-to-one case (one class, one route). A <see
/// cref="RouteEntry"/> built here expresses the FULL model the YAML can — a route binding a
/// definition, a view model and pinned parameters independently, one definition serving several
/// routes, nested-slot sub-routes, and a route with NO view model at all.</para>
///
/// <para>Discovered by reflection across the scanned assemblies (like the <c>[UI]</c> views) and
/// instantiated with a parameterless constructor. The entries join the AUTHORED half and are
/// consulted by resolution; an entry in <c>routes.yaml</c> for the same route still wins, so the
/// order is <b>routes.yaml &gt; this supplier &gt; attribute-derived</b>.</para>
/// </summary>
public interface IRouteEntrySupplier
{
    IReadOnlyList<RouteEntry> Routes();
}

/// <summary>
/// Implemented by the <c>[App]</c> class to compose its navigation menu IN CODE at request time,
/// instead of (or in addition to) the static <c>[MenuItem]</c>/<c>[RemoteMenu]</c> attributes — for
/// a menu that depends on the user, configuration, or a database. The C# mirror of Java's
/// <c>MenuSupplier</c>. Returns the menu tree as wire menu items, so both leaf kinds compose: a
/// route link (<c>Route</c> set) and a rule link (<c>Rules</c> set), plus submenus.
/// </summary>
public interface IMenuSupplier
{
    IReadOnlyList<MenuItemDto> Menu();
}

/// <summary>
/// Implemented by the <c>[App]</c> class to compose the WHOLE app shell IN CODE — its chrome and its
/// menu — instead of the <c>[App]</c>/<c>[MenuItem]</c> attributes. The C# mirror of Java's
/// <c>AppSupplier</c>. Fields left null fall back to the <c>[App]</c> attribute / the derived menu.
/// </summary>
public interface IAppSupplier
{
    AppShell GetApp();
}

/// <summary>
/// A code-composed app shell: the chrome and the menu an <see cref="IAppSupplier"/> returns. The
/// lightweight C# counterpart of Java's fluent <c>AppShell</c> — the fields the port's <c>AppDto</c>
/// carries. A null field is not authored: the mapper falls back to the <c>[App]</c> attribute (or,
/// for the variant, to the auto heuristic) and to the first menu item for the home route.
/// </summary>
public sealed record AppShell(string? Title = null, IReadOnlyList<MenuItemDto>? Menu = null)
{
    public string? Subtitle { get; init; }
    public string? Variant { get; init; }
    public string? HomeRoute { get; init; }
}
