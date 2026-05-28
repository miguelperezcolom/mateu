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

@Named
@Singleton
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class DefaultRoutedClassResolver implements RoutedClassResolver {

  private final List<RoutedClassProvider> providers;

  @Override
  public Optional<ResolvedRoute> resolveAbsolute(String route, RunActionCommand command) {
    var ui =
        providers.stream()
            .filter(provider -> provider.routedClass().isAnnotationPresent(UI.class))
            .map(provider -> matchesAbsolute(route, provider.routedClass(), command))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .findFirst();
    if (ui.isPresent()) {
      return ui;
    }
    return providers.stream()
        .map(provider -> matchesAbsolute(route, provider.routedClass(), command))
        .filter(Optional::isPresent)
        .map(Optional::get)
        .findFirst();
  }

  @Override
  public Optional<ResolvedRoute> resolveApp(String route, RunActionCommand command) {
    return providers.stream()
        .map(provider -> matchesApp(route, provider.routedClass(), command))
        .filter(Optional::isPresent)
        .map(Optional::get)
        .findFirst();
  }

  @Override
  public Optional<ResolvedRoute> resolve(String route, RunActionCommand command) {
    return providers.stream()
        .map(provider -> matches(route, provider.routedClass(), command))
        .filter(Optional::isPresent)
        .map(Optional::get)
        .findFirst();
  }

  private Optional<ResolvedRoute> matchesAbsolute(
      String route, Class<?> aClass, RunActionCommand command) {
    return RouteAnnotationMatcher.matchesAbsolute(route, aClass, command);
  }

  private Optional<ResolvedRoute> matchesApp(
      String route, Class<?> aClass, RunActionCommand command) {
    return RouteAnnotationMatcher.matchesApp(route, aClass, command);
  }

  private Optional<ResolvedRoute> matches(String route, Class<?> aClass, RunActionCommand command) {
    return RouteAnnotationMatcher.matches(route, aClass, command);
  }
}
