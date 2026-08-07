package io.mateu.core.application;

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
