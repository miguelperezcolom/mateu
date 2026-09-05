package io.mateu.uidl.data;

import java.util.List;
import java.util.Map;

/**
 * One entry of a mount's route registry: what a URL resolves to.
 *
 * <p>A <em>mount</em> is a UI application served at a base path (declared by {@code @UI}, whose
 * annotated class is the mount's root view — the entry whose {@link #route()} is {@code ""}).
 * Everything inside the mount is resolved through its registry, whose entries are declared in a
 * {@code routes.yaml} sitting next to the definitions.
 *
 * <p><strong>Routes are relative to the mount.</strong> An entry {@code orders/:id} under a mount
 * at {@code /back-office} answers {@code /back-office/orders/42}. That is what keeps two federated
 * domains from colliding just because both have an {@code orders} screen: uniqueness only has to
 * hold within a mount, and between mount base paths (which already fails at startup today).
 *
 * <p><strong>Why a registry and not just annotations.</strong> The three parts are separable and
 * each is reusable on its own — the same definition rendered for different view models, the same
 * view model presented by different definitions, and the same pair mounted at several routes with
 * different parameters ({@code orders/pending} and {@code orders/archived} over one screen). An
 * annotation can only ever express the one-to-one case. And a registry is <em>data</em>: it can be
 * shipped to a browser, which is what a fully static deployment needs, where no server exists to be
 * asked what a URL means.
 *
 * @param route path relative to the mount, with {@code :name} segments for path parameters. {@code
 *     ""} is the mount's root view.
 * @param definition the UI definition to render (the layout). May be {@code null} when the view
 *     model supplies its own component tree.
 * @param viewModel fully qualified name of the server class backing the route. <strong>Optional on
 *     purpose</strong>: a statically deployed route has no server behind it and gets its data from
 *     client-side sources ({@code @RestData} and friends), so an entry with a definition and no
 *     view model is a valid, complete route.
 * @param fixedParams parameters the entry pins. <strong>Not overridable by the request</strong>:
 *     the server re-applies them from the entry when resolving an action, rather than trusting the
 *     copy that comes back from the client — otherwise "fixed" would be a suggestion, and flipping
 *     one via the query string would be a capability escalation.
 * @param defaultParams parameters the entry seeds but the request may override — path parameters
 *     first, then the incoming query/state.
 * @param parent the ABSOLUTE route of the screen whose slot this route fills, or {@code null} for a
 *     top-level route. A sub-route with a parent does not replace the page: the parent renders its
 *     shell (a master-detail with tabs, a mediator app) and this route's screen is nested into the
 *     parent's slot. This is what {@code @Route(parentRoute=…)} expressed; it is set when the
 *     authored {@link #children} tree is flattened, so on a flat table entry it is the link back to
 *     the host.
 * @param children sub-routes nested under this one, authored RELATIVE to it (so {@code orders}
 *     under {@code use-cases/rra} answers {@code use-cases/rra/orders}). Each child fills this
 *     screen's slot. This is the AUTHORING shape; the registry flattens it into absolute entries
 *     carrying {@link #parent}, so a table entry read at runtime has an empty {@code children}.
 */
public record RouteEntry(
    String route,
    String definition,
    String viewModel,
    Map<String, Object> fixedParams,
    Map<String, Object> defaultParams,
    String parent,
    List<RouteEntry> children) {

  public RouteEntry {
    route = route == null ? "" : route;
    fixedParams = fixedParams == null ? Map.of() : Map.copyOf(fixedParams);
    defaultParams = defaultParams == null ? Map.of() : Map.copyOf(defaultParams);
    children = children == null ? List.of() : List.copyOf(children);
  }

  /** A top-level entry with no slot host and no nested children. */
  public RouteEntry(
      String route,
      String definition,
      String viewModel,
      Map<String, Object> fixedParams,
      Map<String, Object> defaultParams) {
    this(route, definition, viewModel, fixedParams, defaultParams, null, null);
  }

  /** The plain case: a route backed by a view model, no parameters pinned, no slot host. */
  public static RouteEntry of(String route, String viewModel) {
    return new RouteEntry(route, null, viewModel, null, null, null, null);
  }

  /** Whether this route fills the slot of a parent screen rather than replacing the page. */
  public boolean hasParent() {
    return parent != null && !parent.isBlank();
  }

  /** The names of the {@code :name} path parameters this route declares, in order. */
  public List<String> pathParams() {
    return java.util.Arrays.stream(route.split("/"))
        .filter(segment -> segment.startsWith(":") && segment.length() > 1)
        .map(segment -> segment.substring(1))
        .toList();
  }

  /**
   * Resolves the effective parameters for one request: defaults first, then whatever the request
   * brought (path parameters and incoming state), and finally the fixed ones — which win over
   * everything, which is the whole point of declaring them fixed.
   */
  public Map<String, Object> resolveParams(Map<String, Object> fromRequest) {
    var resolved = new java.util.LinkedHashMap<String, Object>(defaultParams);
    if (fromRequest != null) {
      resolved.putAll(fromRequest);
    }
    resolved.putAll(fixedParams);
    return resolved;
  }
}
