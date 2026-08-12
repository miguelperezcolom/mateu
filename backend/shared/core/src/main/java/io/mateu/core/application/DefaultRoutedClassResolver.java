package io.mateu.core.application;

import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.annotations.UI;
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
  private Optional<ResolvedRoute> fromRegistry(String route) {
    return routeRegistry
        .authored()
        .match(route)
        .flatMap(
            match -> {
              var viewModel = match.entry().viewModel();
              if (viewModel == null || viewModel.isBlank()) {
                return Optional.empty();
              }
              try {
                var resolvedClass = Class.forName(viewModel);
                return Optional.of(
                    new ResolvedRoute(
                        route, match.entry().route(), resolvedClass, match.params(null)));
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

  @Override
  public Optional<ResolvedRoute> resolveAbsolute(String route, RunActionCommand command) {
    var ui =
        providers.stream()
            .filter(DefaultRoutedClassResolver::isUi)
            .map(
                provider -> safe(provider, route, command, RouteAnnotationMatcher::matchesAbsolute))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .findFirst();
    if (ui.isPresent()) {
      return ui;
    }
    return providers.stream()
        .map(provider -> safe(provider, route, command, RouteAnnotationMatcher::matchesAbsolute))
        .filter(Optional::isPresent)
        .map(Optional::get)
        .findFirst();
  }

  @Override
  public Optional<ResolvedRoute> resolveApp(String route, RunActionCommand command) {
    return providers.stream()
        .map(provider -> safe(provider, route, command, RouteAnnotationMatcher::matchesApp))
        .filter(Optional::isPresent)
        .map(Optional::get)
        .findFirst();
  }

  @Override
  public Optional<ResolvedRoute> resolve(String route, RunActionCommand command) {
    var authored = fromRegistry(route);
    if (authored.isPresent()) {
      return authored;
    }
    return providers.stream()
        .map(provider -> safe(provider, route, command, RouteAnnotationMatcher::matches))
        .filter(Optional::isPresent)
        .map(Optional::get)
        .findFirst();
  }

  /**
   * Evaluate one provider against the route, isolating any failure to THAT provider: a broken or
   * stale generated {@code RoutedClassProvider} (e.g. one whose {@code routedClass()} references a
   * class removed at runtime) is logged and skipped instead of aborting the whole resolution — one
   * bad provider must not 500 every route. Catches {@link Throwable} because a missing class
   * surfaces as {@link NoClassDefFoundError} (an Error, not an Exception).
   */
  private static Optional<ResolvedRoute> safe(
      RoutedClassProvider provider, String route, RunActionCommand command, RouteMatcher matcher) {
    try {
      return matcher.match(route, provider.routedClass(), command);
    } catch (Throwable t) {
      log.warn(
          "skipping route provider {}: its routed class could not be resolved ({})",
          provider.getClass().getName(),
          t.toString());
      return Optional.empty();
    }
  }

  private static boolean isUi(RoutedClassProvider provider) {
    try {
      return provider.routedClass().isAnnotationPresent(UI.class);
    } catch (Throwable t) {
      return false;
    }
  }

  @FunctionalInterface
  private interface RouteMatcher {
    Optional<ResolvedRoute> match(String route, Class<?> aClass, RunActionCommand command);
  }
}
