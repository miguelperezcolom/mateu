package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.Humanizer.camelcasize;
import static io.mateu.core.domain.out.fragmentmapper.reflectionbased.ReflectionAppMapper.getHomeRoute;
import static io.mateu.core.domain.out.fragmentmapper.reflectionbased.ReflectionAppMapper.getRoute;
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
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HomeRouteSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.SneakyThrows;

import java.util.List;
import java.util.UUID;

public final class AppComponentToDtoMapper {

  public static ClientSideComponentDto mapAppToDto(
      ComponentTreeSupplier componentSupplier,
      App app,
      String baseUrl,
      String route,
      HttpRequest httpRequest) {
    var appRoute = getRoute(componentSupplier, app, httpRequest, route);
    var menu = getMenu(app, route, appRoute);
    var appDto =
        AppDto.builder()
            .title(app.title())
            .subtitle(app.subtitle())
            .route(app.route() != null?app.route():"/")
            .variant(AppVariantDto.valueOf(app.variant().name()))
            .homeRoute(getHomeRoute(app, route)) // getHomeRoute(menu, route, appRoute))
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
  private static String getHomeRoute(Object instance, String route) {
    String homeRoute = getHomeRouteInternal(instance, route);
    if (route != null && !route.isEmpty() && !homeRoute.startsWith(route)) {
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
      if (app.homeRoute() != null) {
        return app.homeRoute();
      }
      if (app.serverSideType() != null && !app.serverSideType().isEmpty()) {
        Class<?> appClass = Class.forName(app.serverSideType());
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
                            ? new GoToRouteDto("", getPath(appRoute, option), null)
                            : null)
                    .selected(isSelected(option, appRoute, route))
                    .visible(true)
                    .submenus(
                        option instanceof Menu asMenu
                            ? buildMenu(asMenu.submenu(), route, appRoute)
                            : List.of())
                    .separator(option instanceof MenuSeparator)
                    .build())
        .toList();
  }

  private static String getPath(String appRoute, Actionable option) {
    if (option.path() == null) {
      return appRoute + "/" + camelcasize(option.label());
    }
    return option.path();
  }
}
