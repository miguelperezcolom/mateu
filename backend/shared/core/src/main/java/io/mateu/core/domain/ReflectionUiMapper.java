package io.mateu.core.domain;

import io.mateu.dtos.UIDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.FavIcon;
import io.mateu.uidl.fluent.UISupplier;
import io.mateu.uidl.interfaces.DynamicUI;
import io.mateu.uidl.interfaces.HasFavicon;
import io.mateu.uidl.interfaces.HasHomeRoute;
import io.mateu.uidl.interfaces.HasPageTitle;
import io.mateu.uidl.interfaces.HttpRequest;
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
    if (uiInstance instanceof HasFavicon hasFavicon) {
      return hasFavicon.getFavicon();
    }
    if (uiInstance.getClass().isAnnotationPresent(FavIcon.class)) {
      return uiInstance.getClass().getAnnotation(FavIcon.class).value();
    }
    return null;
  }

  private String getTitle(Object uiInstance) {
    if (uiInstance instanceof HasPageTitle hasPageTitle) {
      return hasPageTitle.getPageTitle();
    }
    return Humanizer.capitalize(uiInstance.getClass().getSimpleName());
  }

  String getHomeRoute(Object uiInstance, String currentRoute) {
    if (currentRoute != null && !currentRoute.isEmpty() && !"/".equals(currentRoute)) {
      return currentRoute;
    }
    if (uiInstance instanceof HasHomeRoute hasHomeRoute) {
      return hasHomeRoute.getHomeRoute();
    }
    return "";
  }
}
