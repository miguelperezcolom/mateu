package io.mateu.core.application;

import static io.mateu.core.domain.out.componentmapper.ReflectionObjectToComponentMapper.isApp;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.RouteConstants;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.RoutedClassProvider;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;

@Named
@Singleton
@RequiredArgsConstructor
public class DefaultRoutedClassResolver implements RoutedClassResolver {

  private final List<RoutedClassProvider> providers;

  @Override
  public Optional<ResolvedRoute> resolveAbsolute(String route, RunActionCommand command) {
    return providers.stream()
        .filter(provider -> matchesAbsolute(route, provider.routedClass(), command))
        .findFirst()
        .map(RoutedClassProvider::routedClass)
        .map(type -> new ResolvedRoute(route, type));
  }

  @Override
  public Optional<ResolvedRoute> resolveApp(String route, RunActionCommand command) {
    return providers.stream()
        .filter(provider -> matchesApp(route, provider.routedClass(), command))
        .findFirst()
        .map(RoutedClassProvider::routedClass)
        .map(type -> new ResolvedRoute(route, type));
  }

  @Override
  public Optional<ResolvedRoute> resolve(String route, RunActionCommand command) {
    return providers.stream()
        .filter(provider -> matches(route, provider.routedClass(), command))
        .findFirst()
        .map(RoutedClassProvider::routedClass)
        .map(type -> new ResolvedRoute(route, type));
  }

  private boolean matchesAbsolute(String route, Class<?> aClass, RunActionCommand command) {
    if (aClass.isAnnotationPresent(UI.class)) {
      return route.equals(aClass.getAnnotation(UI.class).value());
    }
    if (aClass.isAnnotationPresent(Route.class)) {
      var annotation = aClass.getAnnotation(Route.class);
      return route.equals(annotation.value())
          && (annotation.parentRoute().equals(RouteConstants.NO_PARENT_ROUTE)
              || annotation.parentRoute().equals(command.consumedRoute()));
    }
    return false;
  }

  private boolean matchesApp(String route, Class<?> aClass, RunActionCommand command) {
    if (isApp(aClass, route)) {
      if (aClass.isAnnotationPresent(UI.class)) {
        return route.equals(aClass.getAnnotation(UI.class).value());
      }
      if (aClass.isAnnotationPresent(Route.class)) {
        return route.equals(aClass.getAnnotation(Route.class).value());
      }
    }
    return false;
  }

  private boolean matches(String route, Class<?> aClass, RunActionCommand command) {
    if (aClass.isAnnotationPresent(UI.class)) {
      return route.equals(aClass.getAnnotation(UI.class).value());
    }
    if (aClass.isAnnotationPresent(Route.class)) {
      return route.equals(aClass.getAnnotation(Route.class).value());
    }
    return false;
  }
}
