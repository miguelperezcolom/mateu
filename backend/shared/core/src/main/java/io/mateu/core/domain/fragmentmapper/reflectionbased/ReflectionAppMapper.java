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
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.interfaces.App;
import io.mateu.uidl.interfaces.HasMenu;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteResolver;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

public class ReflectionAppMapper {

  public static UIFragmentDto mapAppToFragment(
      App app, String baseUrl, String route, String initiatorComponentId, HttpRequest httpRequest) {
    var appRoute = getRoute(app, httpRequest, route);
    var menu = getMenu(app, route, appRoute);
    var appDto =
        new AppDto(
            appRoute,
            AppVariantDto.TABS,
            "icon",
            "logo",
            getTitle(app),
            getSubtitle(app),
            menu,
            getHomeRoute(menu),
            "login_url",
            "welcome_message",
            "logout_url",
            List.of());
    var component = new ComponentDto(appDto, "component_id", app.getClass().getName(), List.of());
    return new UIFragmentDto(initiatorComponentId, component, app);
  }

  /*
  private String getSelectedRoute(String appRoute, String fullRoute) {
    if (fullRoute.startsWith(appRoute)) {
      return fullRoute.substring(appRoute.length());
    }
    return fullRoute;
  }
   */

  public static String getHomeRoute(List<MenuDto> menu) {
    if (menu != null) {
      for (MenuDto option : menu) {
        if (option.selected()) {
          return option.destination().route();
        }
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
      for (String token :
          Arrays.stream(route.split("/")).filter(token -> !"".equals(token)).toList()) {
        if (!basePattern.matcher(accumulated + "/" + token).matches()) {
          break;
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

  public static List<MenuDto> getMenu(Object instance, String route, String appRoute) {
    if (instance instanceof HasMenu hasMenu) {
      var menuFromApp = hasMenu.createMenu();
      var selectedRoute =
          appRoute.equals(route)
              ? menuFromApp.stream()
                  .filter(Menu::selected)
                  .findFirst()
                  .map(option -> option.destination().route())
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
                          new GoToRouteDto("", option.destination().route(), ""),
                          List.of(),
                          0,
                          true,
                          isSelected(option, selectedRoute)))
              .toList();
      return menu;
    }
    return List.of();
  }

  public static boolean isSelected(Menu menu, String route) {
    if (route != null && !"".equals(route)) {
      return menu.destination().route().equals(route);
    }
    return menu.selected();
  }
}
