package io.mateu.core.infra.reflection.mappers;

import io.mateu.core.domain.Humanizer;
import io.mateu.core.domain.out.UiMapper;
import io.mateu.dtos.UIDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.FavIcon;
import io.mateu.uidl.fluent.UISupplier;
import io.mateu.uidl.interfaces.DynamicUI;
import io.mateu.uidl.interfaces.FaviconSupplier;
import io.mateu.uidl.interfaces.HomeRouteSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PageTitleSupplier;
import jakarta.inject.Named;
import java.util.List;
import java.util.Map;
import reactor.core.publisher.Mono;

@Named
public class ReflectionUiMapper implements UiMapper {

  @Override
  public boolean supports(Object instance) {
    return !(instance instanceof UISupplier);
  }

  @Override
  public Mono<UIDto> map(
      Object uiInstance,
      String baseUrl,
      String route,
      Map<String, Object> config,
      HttpRequest httpRequest) {
    if (uiInstance == null) {
      return null;
    }
    if (uiInstance instanceof DynamicUI dynamicUI) {
      return dynamicUI.build(baseUrl, httpRequest);
    }
    return Mono.just(
        new UIDto(
            getFavIcon(uiInstance),
            getTitle(uiInstance),
            getHomeRoute(uiInstance, route),
            new UIIncrementDto(
                List.of(), List.of(), List.of(), Map.of(), Map.of("config", config))));
  }

  private String getFavIcon(Object uiInstance) {
    if (uiInstance instanceof FaviconSupplier hasFavicon) {
      return hasFavicon.favicon();
    }
    if (uiInstance.getClass().isAnnotationPresent(FavIcon.class)) {
      return uiInstance.getClass().getAnnotation(FavIcon.class).value();
    }
    return null;
  }

  private String getTitle(Object uiInstance) {
    if (uiInstance instanceof PageTitleSupplier hasPageTitle) {
      return hasPageTitle.pageTitle();
    }
    return Humanizer.capitalize(uiInstance.getClass().getSimpleName());
  }

  public String getHomeRoute(Object uiInstance, String currentRoute) {
    if (currentRoute != null && !currentRoute.isEmpty() && !"/".equals(currentRoute)) {
      return currentRoute;
    }
    if (uiInstance instanceof HomeRouteSupplier hasHomeRoute) {
      return hasHomeRoute.homeRoute();
    }
    return "";
  }
}
