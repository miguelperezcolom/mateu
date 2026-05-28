package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.componentmapper.HomeRouteResolver.getSelectedOption;
import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;
import static io.mateu.core.domain.out.fragmentmapper.ReflectionAppMapper.totalMenuOptions;
import static io.mateu.core.domain.out.fragmentmapper.mappers.AppHomeRouteResolver.*;
import static io.mateu.core.domain.out.fragmentmapper.mappers.AppMenuDtoBuilder.buildMenu;

import io.mateu.dtos.AppDto;
import io.mateu.dtos.AppVariantDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.annotations.AI;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.UUID;
import lombok.SneakyThrows;

public final class AppMapper {

  @SneakyThrows
  public static ClientSideComponentDto mapAppToDto(
      ComponentTreeSupplier componentSupplier,
      App app,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (componentSupplier != null && app.serverSideType() == null) {
      app = app.withServerSideType(componentSupplier.getClass().getName());
    }
    String appRoute = (String) httpRequest.getAttribute("resolvedRoute");
    if (appRoute == null) {
      appRoute = "";
    }
    if (appRoute.startsWith(baseUrl)) {
      appRoute = appRoute.substring(baseUrl.length());
    }
    var appRouteForMenu = appRoute;
    if (app.serverSideType() != null) {
      var appType = Class.forName(app.serverSideType());
      if (appType.isAnnotationPresent(Route.class)) {
        appRouteForMenu = "";
        if (route.equals(appType.getAnnotation(Route.class).value())
            || route.equals(appType.getAnnotation(Route.class).value() + "/")) {
          appRouteForMenu = route;
          route = "/_page";
        }
      }
    }
    var menu = buildMenu(app, route, appRouteForMenu);
    var selectedOption = getSelectedOption(appRoute, route, app.menu(), httpRequest);
    var appDto =
        AppDto.builder()
            .favicon(app.favicon())
            .title(app.title())
            .subtitle(app.subtitle())
            .logo(app.logo())
            .route(app.route())
            .rootRoute(appRoute)
            .variant(AppVariantDto.valueOf(app.variant().name()))
            .homeRoute(getHomeRoute(app, route, appRouteForMenu, httpRequest, selectedOption))
            .homeConsumedRoute(
                getHomeConsumedRoute(app, route, appRouteForMenu, httpRequest, selectedOption))
            .homeBaseUrl(getHomeBaseUrl(app, route, appRouteForMenu, httpRequest, selectedOption))
            .homeServerSideType(
                getHomeServerSideType(app, route, appRouteForMenu, httpRequest, selectedOption))
            .homeUriPrefix(
                getHomeUriPrefix(app, route, appRouteForMenu, httpRequest, selectedOption))
            .serverSideType(
                getAppServerSideType(
                    componentSupplier, app, route, appRouteForMenu, httpRequest, selectedOption))
            .menu(menu)
            .totalMenuOptions(totalMenuOptions(menu))
            .drawerClosed(app.drawerClosed())
            .style(app.style())
            .cssClasses(app.cssClasses())
            .home(null)
            .sseUrl(getSseUrl(app))
            .build();
    return new ClientSideComponentDto(
        appDto,
        app.clientSideComponentId() != null
            ? app.clientSideComponentId()
            : UUID.randomUUID().toString(),
        mapWidgets(app.widgets(), baseUrl, route, consumedRoute, initiatorComponentId, httpRequest),
        app.style(),
        app.cssClasses(),
        null);
  }

  @SneakyThrows
  private static String getSseUrl(App app) {
    if (app.serverSideType() == null) return null;
    var appClass = Class.forName(app.serverSideType());
    if (appClass.isAnnotationPresent(AI.class)) {
      return appClass.getAnnotation(AI.class).sse();
    }
    return null;
  }

  private static List<ComponentDto> mapWidgets(
      List<Component> widgets,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (widgets == null) {
      return List.of();
    }
    return widgets.stream()
        .map(
            widget ->
                mapComponentToDto(
                        null,
                        widget,
                        baseUrl,
                        route,
                        consumedRoute,
                        initiatorComponentId,
                        httpRequest)
                    .setSlot("widgets"))
        .toList();
  }
}
