package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.out.componentmapper.ReflectionAppMapper.getSelectedOption;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;
import static io.mateu.core.domain.out.fragmentmapper.reflectionbased.ReflectionAppMapper.isSelected;
import static io.mateu.core.domain.out.fragmentmapper.reflectionbased.ReflectionAppMapper.totalMenuOptions;
import static io.mateu.uidl.Humanizer.toCamelCase;

import io.mateu.dtos.*;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.FieldLink;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.MenuSeparator;
import io.mateu.uidl.data.MethodLink;
import io.mateu.uidl.data.RemoteMenu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.SneakyThrows;

public final class AppComponentToDtoMapper {

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
      appRoute = route;
    }
    var appRouteForMenu = appRoute;
    if (app.serverSideType() != null) {
      var appType = Class.forName(app.serverSideType());
      if (appType.isAnnotationPresent(Route.class)) {
        // app route has already been added to the links
        appRouteForMenu = "";
        if (route.equals(appType.getAnnotation(Route.class).value())
            || route.equals(appType.getAnnotation(Route.class).value() + "/")) {
          appRouteForMenu = route;
          route = "/_page";
        }
      }
    }
    var menu = getMenu(app, route, appRouteForMenu);
    var selectedOption = getSelectedOption(appRoute, route, app.menu(), httpRequest);
    var appDto =
        AppDto.builder()
            .favicon(app.favicon())
            .title(app.title())
            .subtitle(app.subtitle())
            .logo(app.logo())
            .route(appRoute)
            .rootRoute(appRoute)
            .variant(AppVariantDto.valueOf(app.variant().name()))
            .homeRoute(
                getHomeRoute(
                    app,
                    route,
                    appRoute,
                    httpRequest,
                    selectedOption)) // getHomeRoute(menu, route, appRoute))
            .homeConsumedRoute(
                getHomeConsumedRoute(app, route, appRoute, httpRequest, selectedOption))
            .homeBaseUrl(getHomeBaseUrl(app, route, appRoute, httpRequest, selectedOption))
            .homeAppServerSideType(
                getHomeAppServerSideType(app, route, appRoute, httpRequest, selectedOption))
            .homeUriPrefix(getHomeUriPrefix(app, route, appRoute, httpRequest, selectedOption))
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
        appDto,
        UUID.randomUUID().toString(),
        mapWidgets(app.widgets(), baseUrl, route, consumedRoute, initiatorComponentId, httpRequest),
        app.style(),
        app.cssClasses(),
        null);
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

  @SneakyThrows
  private static String getHomeRoute(
      App app,
      String route,
      String appRoute,
      HttpRequest httpRequest,
      Optional<Actionable> selectedOption) {
    /*
    if (route != null && !route.isEmpty() && !route.equals(appRoute)) {
      if (selectedOption.isPresent() && selectedOption.get() instanceof RemoteMenu remoteMenu) {
        return route.substring(remoteMenu.path().length());
      } else if (!route.equals("/_page") && !route.startsWith(appRoute)) {
        route = appRoute + route;
      }
      return addQueryParams(route, httpRequest);
    }
    String homeRoute = getHomeRouteInternal(instance, route);
    if (instance instanceof App app) {
      if ("_no_home_route".equals(app.homeRoute())) {
        if (selectedOption.isPresent() && selectedOption.get() instanceof RemoteMenu remoteMenu) {
          return homeRoute.substring(remoteMenu.path().length());
        }
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

       */

    var effectiveRoute = route;
    if (selectedOption.isPresent() && selectedOption.get() instanceof RemoteMenu remoteMenu) {
      effectiveRoute = app.homeRoute();
    } else {
      if ("".equals(effectiveRoute)
          || "/".equals(effectiveRoute)
          || effectiveRoute.endsWith("_page")
          || selectedOption.isEmpty()) {
        effectiveRoute = app.homeRoute();
      } else {
        if (!effectiveRoute.startsWith(appRoute)) {
          effectiveRoute = appRoute + effectiveRoute;
        }
      }
    }
    if (effectiveRoute == null) {
      effectiveRoute = appRoute;
    }
    if ("_no_home_route".equals(effectiveRoute)) {
      effectiveRoute = "_page";
    }
    return addQueryParams(effectiveRoute, httpRequest);
  }

  private static String getHomeConsumedRoute(
      App app,
      String route,
      String appRoute,
      HttpRequest httpRequest,
      Optional<Actionable> selectedOption) {
    return app.homeConsumedRoute() != null ? app.homeConsumedRoute() : appRoute;
  }

  private static String getHomeBaseUrl(
      App app,
      String route,
      String appRoute,
      HttpRequest httpRequest,
      Optional<Actionable> selectedOption) {
    return app.homeBaseUrl() != null
        ? app.homeBaseUrl()
        : (String) httpRequest.getAttribute("baseUrl");
  }

  private static String getHomeAppServerSideType(
      App app,
      String route,
      String appRoute,
      HttpRequest httpRequest,
      Optional<Actionable> selectedOption) {
    return app.homeAppServerSideType() != null ? app.homeAppServerSideType() : app.serverSideType();
  }

  private static String getHomeUriPrefix(
      App app,
      String route,
      String appRoute,
      HttpRequest httpRequest,
      Optional<Actionable> selectedOption) {
    return app.homeUriPrefix();
  }

  public static String addQueryParams(String route, HttpRequest httpRequest) {
    if (httpRequest.getParameterNames().isEmpty()) {
      return route;
    }
    return route
        + "?"
        + httpRequest.getParameterNames().stream()
            .map(name -> name + "=" + httpRequest.getParameterValue(name))
            .collect(Collectors.joining("&"));
  }

  private static List<MenuOptionDto> getMenu(App app, String route, String appRoute) {
    return buildMenu(app.menu(), route, appRoute, "");
  }

  private static List<MenuOptionDto> buildMenu(
      List<Actionable> menu, String route, String appRoute, String prefix) {
    return menu.stream()
        .map(
            option -> {
              var path = getPath(prefix, option);
              return MenuOptionDto.builder()
                  .label(option.label())
                  .destination(
                      option instanceof RouteLink
                              || option instanceof ContentLink
                              || option instanceof FieldLink
                              || option instanceof MethodLink
                              || option instanceof RemoteMenu
                          ? new GoToRouteDto("", path, null)
                          : null)
                  .actionId(getActionId(option))
                  .selected(isSelected(option, appRoute, route))
                  .visible(true)
                  .itemData(option.itemData())
                  .submenus(
                      option instanceof Menu asMenu
                          ? buildMenu(asMenu.submenu(), route, appRoute, prefix + asMenu.path())
                          : List.of())
                  .separator(option instanceof MenuSeparator)
                  .remote(option instanceof RemoteMenu)
                  .baseUrl((option instanceof RemoteMenu remoteMenu) ? remoteMenu.baseUrl() : null)
                  .route((option instanceof RemoteMenu remoteMenu) ? remoteMenu.route() : null)
                  .consumedRoute(
                      (option instanceof RemoteMenu remoteMenu) ? remoteMenu.consumedRoute() : null)
                  .appServerSideType(
                      (option instanceof RemoteMenu remoteMenu)
                          ? remoteMenu.appServerSideType()
                          : null)
                  .serverSideType(
                      (option instanceof RemoteMenu remoteMenu)
                          ? remoteMenu.serverSideType()
                          : null)
                  .params((option instanceof RemoteMenu remoteMenu) ? remoteMenu.params() : null)
                  .build();
            })
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
    if (option instanceof RouteLink routeLink) {
      option = routeLink.withPath(prepend(appRoute, routeLink.path()));
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
    if (option instanceof RemoteMenu remoteMenu) {
      option =
          remoteMenu.withPath(
              remoteMenu.path().startsWith(appRoute)
                  ? remoteMenu.path()
                  : prepend(appRoute, remoteMenu.path()));
    }
    return option.path();
  }

  public static String prepend(String appRoute, String path) {
    var prefix = appRoute.endsWith("/") ? appRoute.substring(0, appRoute.length() - 1) : appRoute;
    var suffix = path.startsWith("/") ? path.substring(1) : path;
    return prefix + "/" + suffix;
  }
}
