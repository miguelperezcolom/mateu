package io.mateu.core.domain.out.fragmentmapper.reflectionbased;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.GoToRouteDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.dtos.MenuTypeDto;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MenuSupplier;
import io.mateu.uidl.interfaces.RouteResolver;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;
import lombok.SneakyThrows;

public class ReflectionAppMapper {

  public static int totalMenuOptions(List<MenuOptionDto> menu) {
    int total = 0;
    if (menu != null) {
      for (int index = 0; index < menu.size(); index++) {
        total++;
        var option = menu.get(index);
        total += totalMenuOptions(option.submenus());
      }
    }
    return total;
  }

  public static String getHomeRoute(List<MenuOptionDto> menu, String route, String appRoute) {
    var optionRoute = route.replaceFirst(appRoute, "");
    if (optionRoute != null && !optionRoute.isEmpty()) {
      return route;
    }
    if (menu != null) {
      var selectedRoute = getSelectedRoute(menu, route, true);
      if (selectedRoute != null) {
        return selectedRoute;
      }
      selectedRoute = getSelectedRoute(menu, route, false);
      if (selectedRoute != null) {
        return selectedRoute;
      }
      for (MenuOptionDto option : menu) {
        if (option.selected()) {
          return option.destination().route();
        }
      }
      if (!menu.isEmpty()) {
        return menu.getFirst().destination().route();
      }
    }
    return "/home";
  }

  private static String getSelectedRoute(List<MenuOptionDto> menu, String route, boolean exact) {
    for (MenuOptionDto option : menu) {
      if (option.destination() != null) {
        var matches =
            exact
                ? option.destination().route() != null && option.destination().route().equals(route)
                : route.startsWith(option.destination().route());
        if (matches) {
          return route;
        }
      }
      var selectedRoute = getSelectedRoute(option.submenus(), route, exact);
      if (selectedRoute != null) {
        return selectedRoute;
      }
    }
    return null;
  }

  @SneakyThrows
  public static String getRoute(
      Object componentSupplier, Object instance, HttpRequest httpRequest, String route) {
    Class<?> instanceClass = instance.getClass();
    if (componentSupplier == null) {
      if (instance instanceof App app) {
        if (app.serverSideType() != null && !"".equals(app.serverSideType())) {
          instanceClass = Class.forName(app.serverSideType());
        }
      }
    }
    Pattern pattern = null;
    if (componentSupplier instanceof RouteResolver routeResolver) {
      pattern = routeResolver.matchingPattern(route).orElse(null);
    }
    if (pattern == null && instance != null) {
      if (instanceClass.isAnnotationPresent(Route.class)) {
        for (Route routeAnnotation : instanceClass.getAnnotationsByType(Route.class)) {
          String patternString = routeAnnotation.value();
          pattern = returnPatternIfMatches(patternString, route);
        }
      }
    }
    if (pattern == null && componentSupplier != null) {
      if (componentSupplier.getClass().isAnnotationPresent(Route.class)) {
        for (Route routeAnnotation :
            componentSupplier.getClass().getAnnotationsByType(Route.class)) {
          String patternString = routeAnnotation.value();
          pattern = returnPatternIfMatches(patternString, route);
        }
      }
    }
    if (pattern == null && instance != null) {
      if (instance.getClass().isAnnotationPresent(MateuUI.class)) {
        for (MateuUI routeAnnotation : instance.getClass().getAnnotationsByType(MateuUI.class)) {
          String patternString = "";
          pattern = returnPatternIfMatches(patternString, route);
        }
      }
    }
    if (pattern != null) {
      Pattern basePattern =
          Pattern.compile(pattern.pattern().substring(0, pattern.pattern().indexOf(".*")));
      StringBuilder accumulated = new StringBuilder();
      var matched = false;
      for (String token :
          Arrays.stream(route.split("/")).filter(token -> !"".equals(token)).toList()) {
        if ("".equals(basePattern.pattern())) {
          accumulated.append("/");
          break;
        }
        if (!basePattern.matcher(accumulated + "/" + token).matches()) {
          if (matched) {
            break;
          }
        } else {
          matched = true;
        }
        accumulated.append("/").append(token);
      }
      return matched ? accumulated.toString() : "/";
    }
    return "/";
  }

  private static Pattern returnPatternIfMatches(String patternString, String route) {
    if (!patternString.endsWith(".*")) {
      patternString += ".*";
    }
    var pattern = Pattern.compile(patternString);
    if (pattern.matcher(route).matches()) {
      return pattern;
    }
    return null;
  }

  public static List<MenuOptionDto> getMenu(
      Object instance, String baseUrl, String route, String appRoute, HttpRequest httpRequest) {
    if (instance instanceof MenuSupplier hasMenu) {
      var menuFromApp = hasMenu.menu(httpRequest);
      var selectedRoute =
          appRoute.equals(route)
              ? menuFromApp.stream()
                  .filter(Actionable::selected)
                  .findFirst()
                  .map(Actionable::path)
                  .orElse(route)
              : route;
      var menu =
          menuFromApp.stream()
              .map(
                  option ->
                      new MenuOptionDto(
                          MenuTypeDto.MenuOption,
                          "icon",
                          option.label(),
                          option.component() != null
                              ? mapComponentToDto(
                                  null, option.component(), baseUrl, route, httpRequest)
                              : null,
                          new GoToRouteDto("", option.path(), ""),
                          List.of(),
                          0,
                          true,
                          isSelected(option, appRoute, selectedRoute),
                          false,
                          false,
                          null,
                          null,
                          false))
              .toList();
      return menu;
    }
    return List.of();
  }

  public static boolean isSelected(Actionable actionable, String appRoute, String route) {
    if (route != null && !route.isEmpty() && !appRoute.equals(route)) {
      return actionable.path() != null && actionable.path().equals(route);
    }
    return actionable.selected();
  }
}
