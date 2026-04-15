package io.mateu.core.domain.out.fragmentmapper.reflectionbased;

import io.mateu.dtos.MenuOptionDto;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.CompiledRouteValue;
import io.mateu.uidl.interfaces.HttpRequest;
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

  @SneakyThrows
  public static String getRoute(
      Object componentSupplier,
      Object instance,
      HttpRequest httpRequest,
      String route,
      String consumedRoute) {
    if (httpRequest.getAttribute("resolvedRoute") != null) {
      var resolvedRoute = (String) httpRequest.getAttribute("resolvedRoute");
      var baseUrl = (String) httpRequest.getAttribute("baseUrl");
      if (resolvedRoute.startsWith(baseUrl)) {
        return resolvedRoute.substring(baseUrl.length());
      }
      return resolvedRoute;
    }
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
      pattern =
          routeResolver
              .matchingPattern(route, consumedRoute)
              .map(CompiledRouteValue::routeRegex)
              .orElse(null);
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
      if (instance.getClass().isAnnotationPresent(UI.class)) {
        for (UI routeAnnotation : instance.getClass().getAnnotationsByType(UI.class)) {
          String patternString = routeAnnotation.value();
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

  public static boolean isSelected(Actionable actionable, String appRoute, String route) {
    if (route != null && !route.isEmpty() && !appRoute.equals(route)) {
      return actionable.path() != null
          && (actionable.path().equals(route) || route.startsWith(actionable.path() + "/"));
    }
    return actionable.selected();
  }
}
