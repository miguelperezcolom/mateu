package io.mateu.core.application;

import static io.mateu.core.domain.out.componentmapper.ViewTypeClassifier.isApp;

import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.interfaces.RoutedClassProvider;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Named
@Singleton
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class DefaultRoutedClassResolver implements RoutedClassResolver {

  private final List<RoutedClassProvider> providers;
  private final RouteRegistry routeRegistry;
  private volatile RoutedClassIndex index;

  /**
   * Routed classes examined one by one since the JVM started (building an index, then only the
   * parameterised routes a lookup tries) — {@code RequestBudgetTest} pins that a warm request does
   * not walk them all.
   */
  public static long providersScanned() {
    return RoutedClassIndex.providersScanned();
  }

  /**
   * An entry AUTHORED in {@code specs/ui/routes.yaml} answers before the annotation-derived
   * providers — explicit beats derived, the same precedence the rest of the framework uses.
   *
   * <p>Only the authored half short-circuits. The derived half of the registry is the same
   * information the providers already carry, and the providers carry it better: they also serve the
   * CRUD sub-routes ({@code /new}, {@code /{id}/edit}) that the specialised resolvers build on. So
   * consulting the merged table here would hijack routes that work today, for no gain.
   *
   * <p>An entry with no {@code viewModel} is not a failure: it is a statically deployed route,
   * which has no server class to instantiate by definition. It falls through, and the renderer
   * resolves it from the shipped table.
   */
  private Optional<ResolvedRoute> fromRegistry(String route, RunActionCommand command) {
    var mount = MountPaths.mountOf(command);
    if (mount.isEmpty() || route == null || MountPaths.startsWithMount(route, mount)) {
      return fromRegistry(route, route, "");
    }
    // A CLASS-declared non-root mount (@UI("/shop")) is served by its own controller: the browser
    // on /shop/orders posts route=/orders with baseUrl /shop, while the route file tagged
    // `basePath: /shop` is loaded with the mount on every route (shop/orders). Look the route up
    // with the mount in front, and answer a pattern RELATIVE to the mount again, since the callers
    // read the path parameters by aligning that pattern with the route they asked for.
    //
    // ONLY with the mount in front: the table is absolute, so the bare route names an entry of the
    // ROOT mount — consulted first, a root `home` (a code RouteEntrySupplier) answered the
    // `/home` of every other mount, whose own @Menu entry was never reached. Routes are relative
    // to their mount; resolution stays inside the mount that was asked.
    return fromRegistry(route, MountPaths.withMount(mount, route), mount);
  }

  private Optional<ResolvedRoute> fromRegistry(String route, String lookup, String mount) {
    return routeRegistry
        .authored()
        .match(lookup)
        .flatMap(
            match -> {
              var viewModel = match.entry().viewModel();
              if (viewModel == null || viewModel.isBlank()) {
                return Optional.empty();
              }
              try {
                var resolvedClass = loadViewModel(viewModel);
                return Optional.of(
                    new ResolvedRoute(
                        route,
                        MountPaths.withoutMount(mount, match.entry().route()),
                        resolvedClass,
                        match.entry()));
              } catch (Throwable t) {
                // A route pointing at a class that is not on the classpath must not 500 every
                // request: log it once per resolution and let the providers answer.
                log.warn(
                    "Route '{}' in routes.yaml names viewModel '{}', which could not be loaded: {}",
                    match.entry().route(),
                    viewModel,
                    t.toString());
                return Optional.empty();
              }
            });
  }

  /**
   * The view model class, looked up in the context classloader first: at build time ({@code
   * mateu:bundle}) the framework lives in the plugin's realm and the app's classes only in the
   * context classloader, so a plain {@code Class.forName} from here could not see them — and every
   * routes.yaml route with a view model was exported as "Not found.".
   */
  private static Class<?> loadViewModel(String name) throws ClassNotFoundException {
    var context = Thread.currentThread().getContextClassLoader();
    if (context != null) {
      try {
        return Class.forName(name, true, context);
      } catch (ClassNotFoundException ignored) {
        // fall back to the framework's own loader
      }
    }
    return Class.forName(name);
  }

  @Override
  public Optional<ResolvedRoute> resolveAbsolute(String route, RunActionCommand command) {
    var index = index();
    if (index.isEmpty()) {
      return Optional.empty();
    }
    List<RoutedClassIndex.Entry> candidates;
    try {
      candidates = index.matching(command.baseUrl() + command.route(), null);
    } catch (Throwable t) {
      return unresolvable(route, t);
    }
    var ui = RoutedClassIndex.first(candidates, RoutedClassIndex.Entry::ui);
    var found = ui != null ? ui : RoutedClassIndex.first(candidates, entry -> true);
    return resolved(route, found);
  }

  @Override
  public Optional<ResolvedRoute> resolveApp(String route, RunActionCommand command) {
    var index = index();
    if (index.isEmpty()) {
      return Optional.empty();
    }
    List<RoutedClassIndex.Entry> candidates;
    try {
      candidates = index.matching(route, null);
    } catch (Throwable t) {
      return unresolvable(route, t);
    }
    return resolved(route, RoutedClassIndex.first(candidates, entry -> isApp(entry.type(), route)));
  }

  @Override
  public boolean authoredWithoutClass(String route) {
    return route != null
        && routeRegistry
            .authored()
            .match(route)
            .map(match -> match.entry())
            .map(
                entry ->
                    (entry.viewModel() == null || entry.viewModel().isBlank())
                        && entry.definition() != null
                        && !entry.definition().isBlank())
            .orElse(false);
  }

  @Override
  public Optional<ResolvedRoute> resolve(String route, RunActionCommand command) {
    var authored = fromRegistry(route, command);
    if (authored.isPresent()) {
      return authored;
    }
    var index = index();
    if (index.isEmpty()) {
      return Optional.empty();
    }
    List<RoutedClassIndex.Entry> candidates;
    try {
      // RouteAnnotationMatcher.matches: the route under the request's base url matches the
      // declared route, or the route without the command's base url EQUALS it
      var cleanRoute = route;
      if (cleanRoute.startsWith(command.baseUrl())) {
        cleanRoute = cleanRoute.substring(command.baseUrl().length());
      }
      var baseUrl = command.httpRequest().getAttribute("baseUrl");
      candidates = index.matching(baseUrl + route, baseUrl + cleanRoute);
    } catch (Throwable t) {
      return unresolvable(route, t);
    }
    return resolved(route, RoutedClassIndex.first(candidates, entry -> true));
  }

  /**
   * The routed classes, indexed by route on first use: the providers are the container's beans, so
   * the index lives as long as this resolver (a context refresh / dev restart builds a new one).
   */
  private RoutedClassIndex index() {
    var current = index;
    if (current == null) {
      synchronized (this) {
        current = index;
        if (current == null) {
          current = new RoutedClassIndex(providers);
          index = current;
        }
      }
    }
    return current;
  }

  private static Optional<ResolvedRoute> resolved(String route, RoutedClassIndex.Entry entry) {
    return entry == null
        ? Optional.empty()
        : Optional.of(new ResolvedRoute(route, entry.pattern(), entry.type()));
  }

  /** A request the matchers cannot read (no command, no request): nothing matches, as before. */
  private static Optional<ResolvedRoute> unresolvable(String route, Throwable t) {
    log.warn("route '{}' could not be matched against the routed classes: {}", route, t.toString());
    return Optional.empty();
  }
}
