package io.mateu.core.domain.fragmentmapper.componentbased;

import static io.mateu.core.domain.fragmentmapper.reflectionbased.ReflectionAppMapper.getHomeRoute;
import static io.mateu.core.domain.fragmentmapper.reflectionbased.ReflectionAppMapper.getRoute;
import static io.mateu.core.domain.fragmentmapper.reflectionbased.ReflectionAppMapper.isSelected;

import io.mateu.dtos.AppDto;
import io.mateu.dtos.AppVariantDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.GoToRouteDto;
import io.mateu.dtos.MenuDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.ComponentSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public final class ComponentAppMapper {

  public static UIFragmentDto mapAppToFragment(
      ComponentSupplier componentSupplier,
      App app,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return new UIFragmentDto(
        initiatorComponentId,
        mapAppToComponentDto(componentSupplier, app, baseUrl, route, httpRequest),
        componentSupplier);
  }

  private static ComponentDto mapAppToComponentDto(
      ComponentSupplier componentSupplier,
      App app,
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
            .homeRoute(getHomeRoute(menu))
            .menu(menu)
            .build();
    return new ComponentDto(
        appDto, "component_id", componentSupplier.getClass().getName(), List.of());
  }

  private static List<MenuDto> getMenu(App app, String route, String appRoute) {
    var selectedRoute =
        appRoute.equals(route)
            ? app.menu().stream()
                .filter(Menu::selected)
                .findFirst()
                .map(option -> option.destination().route())
                .orElse(route)
            : route;
    return app.menu().stream()
        .map(
            option ->
                MenuDto.builder()
                    .label(option.label())
                    .destination(new GoToRouteDto("", option.destination().route(), null))
                    .selected(isSelected(option, selectedRoute))
                    .build())
        .toList();
  }
}
