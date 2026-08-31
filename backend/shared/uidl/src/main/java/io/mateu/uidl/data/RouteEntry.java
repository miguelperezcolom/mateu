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
 */
public record RouteEntry(
    String route,
    String definition,
    String viewModel,
    Map<String, Object> fixedParams,
    Map<String, Object> defaultParams) {

  public RouteEntry {
    route = route == null ? "" : route;
    fixedParams = fixedParams == null ? Map.of() : Map.copyOf(fixedParams);
    defaultParams = defaultParams == null ? Map.of() : Map.copyOf(defaultParams);
  }

  /** The plain case: a route backed by a view model, no parameters pinned. */
  public static RouteEntry of(String route, String viewModel) {
    return new RouteEntry(route, null, viewModel, null, null);
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
