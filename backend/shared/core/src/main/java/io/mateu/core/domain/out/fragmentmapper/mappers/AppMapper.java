package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.componentmapper.HomeRouteResolver.getSelectedOption;
import static io.mateu.core.domain.out.fragmentmapper.AppMappingUtils.totalMenuOptions;
import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.AppHomeRouteResolver.*;
import static io.mateu.core.domain.out.fragmentmapper.mappers.AppMenuDtoBuilder.buildMenu;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.dtos.*;
import io.mateu.uidl.annotations.AI;
import io.mateu.uidl.annotations.Fab;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import lombok.SneakyThrows;

public final class AppMapper {

  @SneakyThrows
  public static ClientSideComponentDto mapAppToDto(
      ComponentTreeSupplier componentSupplier,
      AppShell app,
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
            .layout(AppLayoutDto.valueOf(app.layout().name()))
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
            .fabs(getAppFabs(app))
            .themeToggle(getThemeToggle(app))
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
  private static List<FabDto> getAppFabs(AppShell app) {
    if (app.serverSideType() == null) return List.of();
    var appClass = Class.forName(app.serverSideType());
    return Arrays.stream(appClass.getMethods())
        .filter(method -> MetaAnnotations.isPresent(method, Fab.class))
        .sorted(Comparator.comparingInt(method -> MetaAnnotations.find(method, Fab.class).order()))
        .map(AppMapper::toFabDto)
        .toList();
  }

  private static FabDto toFabDto(Method method) {
    var ann = MetaAnnotations.find(method, Fab.class);
    var label =
        MetaAnnotations.isPresent(method, io.mateu.uidl.annotations.Label.class)
            ? MetaAnnotations.find(method, io.mateu.uidl.annotations.Label.class).value()
            : io.mateu.uidl.Humanizer.toUpperCaseFirst(method.getName());
    return FabDto.builder()
        .id(method.getName())
        .label(label)
        .icon(ann.icon())
        .actionId(method.getName())
        .buttonStyle(ann.buttonStyle().name())
        .build();
  }

  @SneakyThrows
  private static boolean getThemeToggle(AppShell app) {
    if (app.serverSideType() == null) return false;
    var appClass = Class.forName(app.serverSideType());
    if (MetaAnnotations.isPresent(appClass, io.mateu.uidl.annotations.App.class)) {
      return MetaAnnotations.find(appClass, io.mateu.uidl.annotations.App.class).themeToggle();
    }
    return false;
  }

  @SneakyThrows
  private static String getSseUrl(AppShell app) {
    if (app.serverSideType() == null) return null;
    var appClass = Class.forName(app.serverSideType());
    if (MetaAnnotations.isPresent(appClass, AI.class)) {
      return MetaAnnotations.find(appClass, AI.class).sse();
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
