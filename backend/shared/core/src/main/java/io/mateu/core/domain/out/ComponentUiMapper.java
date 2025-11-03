package io.mateu.core.domain.out;

import io.mateu.dtos.UIDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.fluent.UI;
import io.mateu.uidl.fluent.UISupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import java.util.List;
import java.util.Map;
import reactor.core.publisher.Mono;

@Named
public class ComponentUiMapper implements UiMapper {

  @Override
  public boolean supports(Object instance) {
    return instance instanceof UISupplier;
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
    UISupplier uiSupplier = (UISupplier) uiInstance;
    var ui = uiSupplier.getUI(httpRequest);
    return Mono.just(
        new UIDto(
            ui.favicon(),
            ui.pageTitle(),
            getHomeRoute(ui, route),
            new UIIncrementDto(
                List.of(), List.of(), List.of(), Map.of(), Map.of("config", config))));
  }

  String getHomeRoute(UI ui, String currentRoute) {
    if (currentRoute != null && !currentRoute.isEmpty() && !"/".equals(currentRoute)) {
      return currentRoute;
    }
    return ui.homeRoute();
  }
}
