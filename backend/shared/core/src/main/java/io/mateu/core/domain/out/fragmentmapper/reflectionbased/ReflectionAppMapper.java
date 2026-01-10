package io.mateu.core.domain.out.fragmentmapper.reflectionbased;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.AppComponentToDtoMapper.getActionId;

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

  @SneakyThrows
  public static String getRoute(
      Object componentSupplier,
      Object instance,
      HttpRequest httpRequest,
      String route,
      String consumedRoute) {
    if (httpRequest.getAttribute("resolvedRoute") != null) {
      return (String) httpRequest.getAttribute("resolvedRoute");
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
      pattern = routeResolver.matchingPattern(route, consumedRoute).orElse(null);
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


  public static boolean isSelected(Actionable actionable, String appRoute, String route) {
    if (route != null && !route.isEmpty() && !appRoute.equals(route)) {
      return actionable.path() != null && actionable.path().equals(route);
    }
    return actionable.selected();
  }
}
