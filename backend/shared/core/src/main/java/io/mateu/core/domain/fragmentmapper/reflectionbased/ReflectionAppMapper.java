package io.mateu.core.domain.fragmentmapper.reflectionbased;

import static io.mateu.core.domain.fragmentmapper.reflectionbased.ReflectionCommonMapper.getSubtitle;
import static io.mateu.core.domain.fragmentmapper.reflectionbased.ReflectionCommonMapper.getTitle;

import io.mateu.dtos.AppDto;
import io.mateu.dtos.AppVariantDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.GoToRouteDto;
import io.mateu.dtos.MenuDto;
import io.mateu.dtos.MenuTypeDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.App;
import io.mateu.uidl.interfaces.HasMenu;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteResolver;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.regex.Pattern;

public class ReflectionAppMapper {

  public static UIFragmentDto mapAppToFragment(
      App app, String baseUrl, String route, String initiatorComponentId, HttpRequest httpRequest) {
    var appRoute = getRoute(app, httpRequest, route);
    var menu = getMenu(app, route, appRoute, httpRequest);
    var appDto =
        new AppDto(
            appRoute,
            AppVariantDto.TABS,
            "icon",
            "logo",
            getTitle(app),
            getSubtitle(app),
            menu,
            getHomeRoute(menu, route),
            "login_url",
            "welcome_message",
            "logout_url",
            List.of());
    var component = new ComponentDto(appDto, "component_id", app.getClass().getName(), List.of());
    return new UIFragmentDto(initiatorComponentId, component, app);
  }

  public static String getHomeRoute(List<MenuDto> menu, String route) {
    if (menu != null) {
      for (MenuDto option : menu) {
        if (option.destination() != null && option.destination().route().equals(route)) {
          return option.destination().route();
        }
      }
      for (MenuDto option :
          menu.stream()
              .sorted(
                  Comparator.comparingInt(
                      option ->
                          option.destination() != null ? option.destination().route().length() : 0))
              .toList()) {
        if (option.destination() != null && route.startsWith(option.destination().route())) {
          return route;
        }
      }
      for (MenuDto option : menu) {
        if (option.selected()) {
          return option.destination().route();
        }
      }
      if (!menu.isEmpty()) {
        return menu.get(0).destination().route();
      }
    }
    return "/home";
  }

  public static String getRoute(Object app, HttpRequest httpRequest, String route) {
    Pattern pattern = null;
    if (app instanceof RouteResolver routeResolver) {
      pattern = routeResolver.getMatchingPattern(route).orElse(null);
    }
    if (pattern == null) {
      if (app.getClass().isAnnotationPresent(Route.class)) {
        for (Route routeAnnotation : app.getClass().getAnnotationsByType(Route.class)) {
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
        if (!basePattern.matcher(accumulated + "/" + token).matches()) {
          if (matched) {
            break;
          }
        } else {
          matched = true;
        }
        accumulated.append("/").append(token);
      }
      return accumulated.toString();
    }
    return route;
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

  public static List<MenuDto> getMenu(
      Object instance, String route, String appRoute, HttpRequest httpRequest) {
    if (instance instanceof HasMenu hasMenu) {
      var menuFromApp = hasMenu.createMenu(httpRequest);
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
                      new MenuDto(
                          MenuTypeDto.MenuOption,
                          "icon",
                          option.label(),
                          new GoToRouteDto("", option.path(), ""),
                          List.of(),
                          0,
                          true,
                          isSelected(option, appRoute, selectedRoute),
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
