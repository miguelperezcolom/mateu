package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.Humanizer.camelcasize;
import static io.mateu.core.domain.fragmentmapper.reflectionbased.ReflectionAppMapper.getHomeRoute;
import static io.mateu.core.domain.fragmentmapper.reflectionbased.ReflectionAppMapper.getRoute;
import static io.mateu.core.domain.fragmentmapper.reflectionbased.ReflectionAppMapper.isSelected;

import io.mateu.dtos.AppDto;
import io.mateu.dtos.AppVariantDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.GoToRouteDto;
import io.mateu.dtos.MenuDto;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.ComponentSupplier;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public final class AppComponentToDtoMapper {

  public static ComponentDto mapAppToDto(
      App app,
      ComponentSupplier componentSupplier,
      String baseUrl,
      String route,
      HttpRequest httpRequest) {
    var appRoute = getRoute(componentSupplier, httpRequest, route);
    var menu = getMenu(app, route, appRoute);
    var appDto =
        AppDto.builder()
            .title(app.title())
            .subtitle(app.subtitle())
            .route(getRoute(componentSupplier, httpRequest, route))
            .variant(AppVariantDto.valueOf(app.variant().name()))
            .homeRoute(getHomeRoute(menu, route))
            .menu(menu)
            .build();
    return new ComponentDto(
        appDto, "component_id", componentSupplier.getClass().getName(), List.of());
  }

  private static List<MenuDto> getMenu(App app, String route, String appRoute) {
    return buildMenu(app.menu(), route, appRoute);
  }

  private static List<MenuDto> buildMenu(List<Actionable> menu, String route, String appRoute) {
    return menu.stream()
        .map(
            option ->
                MenuDto.builder()
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
