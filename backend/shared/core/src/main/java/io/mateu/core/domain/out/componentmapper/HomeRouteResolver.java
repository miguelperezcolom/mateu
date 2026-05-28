package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.application.runaction.RunActionUseCase.setResolvedPath;

import io.mateu.uidl.annotations.HomeRoute;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RemoteMenu;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HomeRouteSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Arrays;
import java.util.Collection;
import java.util.Optional;
import java.util.stream.Collectors;

public class HomeRouteResolver {

  public static Optional<Actionable> getSelectedOption(
      String appRoute,
      String route,
      Collection<? extends Actionable> menu,
      HttpRequest httpRequest) {
    return getSelectedOption(route, menu, httpRequest, appRoute);
  }

  public static Optional<Actionable> getSelectedOption(
      String route,
      Collection<? extends Actionable> actionables,
      HttpRequest httpRequest,
      String prefix) {
    if (route.startsWith(prefix)) {
      route = route.substring(prefix.length());
    }
    if (route.startsWith("/")) {
      route = route.substring(1);
    }
    var token = route.split("/")[0];
    if (!"".equals(token)) {
      token = "/" + token;
      for (Actionable actionable : actionables) {
        if (token.equals(actionable.path())) {
          String cleanPrefix = !"".equals(prefix) && !"/".equals(prefix) ? prefix : "";
          if (actionable instanceof Menu menu) {
            return getSelectedOption(
                Arrays.stream(route.split("/")).skip(1).collect(Collectors.joining("/")),
                menu.submenu(),
                httpRequest,
                cleanPrefix + token);
          }
          if (actionable instanceof RemoteMenu remoteMenu) {
            return Optional.of(remoteMenu);
          }
          setResolvedPath(httpRequest, cleanPrefix + token);
          return Optional.of(actionable);
        }
      }
    }
    return Optional.empty();
  }

  static String getHomeUriPrefix(Optional<? extends Actionable> selectedOption) {
    if (selectedOption.isPresent() && selectedOption.get() instanceof RemoteMenu remoteMenu) {
      return remoteMenu.path();
    }
    return null;
  }

  static String getHomeConsumedRoute(
      String appRoute, Optional<? extends Actionable> selectedOption) {
    if (selectedOption.isPresent() && selectedOption.get() instanceof RemoteMenu remoteMenu) {
      return remoteMenu.consumedRoute();
    }
    return appRoute;
  }

  static String getHomeServerSideType(
      Object instance, Optional<? extends Actionable> selectedOption) {
    if (selectedOption.isPresent() && selectedOption.get() instanceof RemoteMenu remoteMenu) {
      return remoteMenu.serverSideType();
    }
    return null;
  }

  static String getHomeBaseUrl(String baseUrl, Optional<? extends Actionable> selectedOption) {
    if (selectedOption.isPresent() && selectedOption.get() instanceof RemoteMenu remoteMenu) {
      return remoteMenu.baseUrl();
    }
    return null;
  }

  static String getHomeRoute(
      Object instance, Optional<Actionable> selectedOption, HttpRequest httpRequest) {
    var prefix = "";
    if (selectedOption.isPresent() && selectedOption.get() instanceof RemoteMenu remoteMenu) {
      prefix = remoteMenu.path();
      return httpRequest.runActionRq().route();
    }
    if (instance instanceof HomeRouteSupplier homeRouteSupplier) {
      return homeRouteSupplier.homeRoute().substring(prefix.length());
    }
    if (instance.getClass().isAnnotationPresent(HomeRoute.class)) {
      return instance.getClass().getAnnotation(HomeRoute.class).value().substring(prefix.length());
    }
    if (instance instanceof App app) {
      return app.homeRoute();
    }
    if (instance instanceof AppSupplier appSupplier) {
      return appSupplier.getApp(httpRequest).homeRoute();
    }
    return "_no_home_route";
  }
}
