using Mateu.Dtos;

namespace Mateu.Core;

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
