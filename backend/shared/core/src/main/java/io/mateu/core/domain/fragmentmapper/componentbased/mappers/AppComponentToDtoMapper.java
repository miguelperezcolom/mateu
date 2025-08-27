package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.Humanizer.camelcasize;
import static io.mateu.core.domain.fragmentmapper.reflectionbased.ReflectionAppMapper.getHomeRoute;
import static io.mateu.core.domain.fragmentmapper.reflectionbased.ReflectionAppMapper.getRoute;
import static io.mateu.core.domain.fragmentmapper.reflectionbased.ReflectionAppMapper.isSelected;
import static io.mateu.core.domain.fragmentmapper.reflectionbased.ReflectionAppMapper.totalMenuOptions;

import io.mateu.dtos.AppDto;
import io.mateu.dtos.AppVariantDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.GoToRouteDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.MenuSeparator;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
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
            .route(getRoute(componentSupplier, app, httpRequest, route))
            .variant(AppVariantDto.valueOf(app.variant().name()))
            .homeRoute(getHomeRoute(menu, route))
            .menu(menu)
            .totalMenuOptions(totalMenuOptions(menu))
            .style(app.style())
            .cssClasses(app.cssClasses())
            .build();
    return new ClientSideComponentDto(
        appDto,
            UUID.randomUUID().toString(),
        List.of(),
        componentSupplier.style(),
        componentSupplier.cssClasses(),
        null);
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
                        option instanceof RouteLink || option instanceof ContentLink
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
