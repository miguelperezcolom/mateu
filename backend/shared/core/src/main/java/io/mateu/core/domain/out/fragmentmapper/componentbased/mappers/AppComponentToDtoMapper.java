package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.Humanizer.toCamelCase;
import static io.mateu.core.domain.out.fragmentmapper.reflectionbased.ReflectionAppMapper.isSelected;
import static io.mateu.core.domain.out.fragmentmapper.reflectionbased.ReflectionAppMapper.totalMenuOptions;

import io.mateu.dtos.AppDto;
import io.mateu.dtos.AppVariantDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.GoToRouteDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.uidl.annotations.HomeRoute;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.FieldLink;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.MenuSeparator;
import io.mateu.uidl.data.MethodLink;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HomeRouteSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.UUID;
import lombok.SneakyThrows;

public final class AppComponentToDtoMapper {

  public static ClientSideComponentDto mapAppToDto(
      ComponentTreeSupplier componentSupplier,
      App app,
      String baseUrl,
      String route,
      HttpRequest httpRequest) {
    if (componentSupplier != null && app.serverSideType() == null) {
      app = app.withServerSideType(componentSupplier.getClass().getName());
    }
    String appRoute = (String) httpRequest.getAttribute("resolvedRoute");
    System.out.println("" + app.serverSideType() + " --> appRoute: " + appRoute);
    if (appRoute == null) {
      appRoute = route;
    }
    var menu = getMenu(app, route, appRoute);
    var appDto =
        AppDto.builder()
            .favicon(app.favicon())
            .title(app.title())
            .subtitle(app.subtitle())
            .logo(app.logo())
            .route(appRoute)
            .variant(AppVariantDto.valueOf(app.variant().name()))
            .homeRoute(
                getHomeRoute(
                    app, route, appRoute, httpRequest)) // getHomeRoute(menu, route, appRoute))
            .appServerSideType(
                componentSupplier != null
                    ? componentSupplier.getClass().getName()
                    : app.serverSideType())
            .menu(menu)
            .totalMenuOptions(totalMenuOptions(menu))
            .drawerClosed(app.drawerClosed())
            .style(app.style())
            .cssClasses(app.cssClasses())
            .home(null)
            .build();
    return new ClientSideComponentDto(
        appDto, UUID.randomUUID().toString(), List.of(), app.style(), app.cssClasses(), null);
  }

  @SneakyThrows
  private static String getHomeRoute(
      Object instance, String route, String appRoute, HttpRequest httpRequest) {
    if (route != null && !route.isEmpty() && !route.equals(appRoute)) {
      return route;
    }
    String homeRoute = getHomeRouteInternal(instance, route);
    if (instance instanceof App app) {
      if ("xxx".equals(app.homeRoute())) {
        return homeRoute;
      }
    }
    if (("".equals(httpRequest.runActionRq().consumedRoute())
            || "/".equals(httpRequest.runActionRq().consumedRoute())
            || httpRequest.runActionRq().appServerSideType() != null)
        && route != null
        && !route.isEmpty()
        && !homeRoute.startsWith(route)) {
      return route;
    }
    return homeRoute;
  }

  @SneakyThrows
  private static String getHomeRouteInternal(Object instance, String route) {

    if (instance instanceof HomeRouteSupplier homeRouteSupplier) {
      return homeRouteSupplier.homeRoute();
    }
    if (instance.getClass().isAnnotationPresent(HomeRoute.class)) {
      return instance.getClass().getAnnotation(HomeRoute.class).value();
    }
    if (instance instanceof App app) {
      if (app.homeRoute() != null && !"xxx".equals(app.homeRoute())) {
        return app.homeRoute();
      }
      if (app.serverSideType() != null && !app.serverSideType().isEmpty()) {
        Class<?> appClass = Class.forName(app.serverSideType());
        if (HomeRouteSupplier.class.isAssignableFrom(appClass)) {
          return app.homeRoute();
        }
        if (appClass.isAnnotationPresent(HomeRoute.class)) {
          return appClass.getAnnotation(HomeRoute.class).value();
        }
      }
    }
    return "".equals(route) ? "_page" : route;
  }

  private static List<MenuOptionDto> getMenu(App app, String route, String appRoute) {
    return buildMenu(app.menu(), route, appRoute);
  }

  private static List<MenuOptionDto> buildMenu(
      List<Actionable> menu, String route, String appRoute) {
    return menu.stream()
        .map(
            option ->
                MenuOptionDto.builder()
                    .label(option.label())
                    .destination(
                        option instanceof RouteLink
                                || option instanceof ContentLink
                                || option instanceof FieldLink
                                || option instanceof MethodLink
                            ? new GoToRouteDto("", getPath(appRoute, option), null)
                            : null)
                    .actionId(getActionId(option))
                    .selected(isSelected(option, appRoute, route))
                    .visible(true)
                    .itemData(option.itemData())
                    .submenus(
                        option instanceof Menu asMenu
                            ? buildMenu(asMenu.submenu(), route, appRoute)
                            : List.of())
                    .separator(option instanceof MenuSeparator)
                    .build())
        .toList();
  }

  public static String getActionId(Actionable option) {
    if (option instanceof ContentLink contentLink) {
      return contentLink.path();
    }
    if (option instanceof FieldLink fieldLink) {
      return fieldLink.fieldName();
    }
    if (option instanceof MethodLink methodLink) {
      return methodLink.methodName();
    }
    return null;
  }

  private static String getPath(String appRoute, Actionable option) {
    if (option.path() == null) {
      return prepend(appRoute, toCamelCase(option.label()));
    }
    if (option instanceof ContentLink contentLink) {
      option = contentLink.withPath(prepend(appRoute, contentLink.path()));
    }
    if (option instanceof FieldLink fieldLink) {
      option = fieldLink.withPath(prepend(appRoute, fieldLink.path()));
    }
    if (option instanceof MethodLink methodLink) {
      option = methodLink.withPath(prepend(appRoute, methodLink.path()));
    }
    return option.path();
  }

  private static String prepend(String appRoute, String path) {
    var prefix = appRoute.endsWith("/") ? appRoute.substring(0, appRoute.length() - 1) : appRoute;
    var suffix = path.startsWith("/") ? path.substring(1) : path;
    return prefix + "/" + suffix;
  }
}
