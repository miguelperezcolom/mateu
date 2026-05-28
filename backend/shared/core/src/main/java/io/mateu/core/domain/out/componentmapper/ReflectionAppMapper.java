package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.AppMenuBuilder.getMenu;
import static io.mateu.core.domain.out.componentmapper.AppMetadataExtractor.*;
import static io.mateu.core.domain.out.componentmapper.HomeRouteResolver.*;
import static io.mateu.core.domain.out.fragmentmapper.AppMappingUtils.getRoute;

import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.interfaces.HttpRequest;

public class ReflectionAppMapper {

  public static AppShell mapToAppComponent(
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var appRoute = getRoute(instance, instance, httpRequest, route, consumedRoute);
    var menu = getMenu(appRoute, instance, route, httpRequest);
    var selectedOption = getSelectedOption(appRoute, route, menu, httpRequest);
    return AppShell.builder()
        .route(appRoute)
        .homeRoute(getHomeRoute(instance, selectedOption, httpRequest))
        .homeBaseUrl(getHomeBaseUrl(baseUrl, selectedOption))
        .homeServerSideType(getHomeServerSideType(instance, selectedOption))
        .homeConsumedRoute(getHomeConsumedRoute(appRoute, selectedOption))
        .homeUriPrefix(getHomeUriPrefix(selectedOption))
        .serverSideType(instance.getClass().getName())
        .variant(getVariant(instance, menu))
        .pageTitle(getPageTitle(instance))
        .title(getTitle(instance))
        .favicon(getFavicon(instance))
        .logo(getLogo(instance))
        .subtitle(getSubtitle(instance))
        .menu(menu)
        .style(getStyle(instance))
        .cssClasses(getCssClasses(instance))
        .drawerClosed(isDrawerClosed(instance))
        .widgets(getWidgets(instance, baseUrl, route, initiatorComponentId, httpRequest))
        .build();
  }
}
