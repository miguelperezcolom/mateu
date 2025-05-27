package io.mateu.core.domain.fragmentmapper.componentbased;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.fluent.ComponentSupplier;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public final class ComponentPageMapper {

  public static UIFragmentDto mapPageToFragment(
      ComponentSupplier componentSupplier,
      Page page,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return new UIFragmentDto(
        initiatorComponentId,
        mapPageToComponentDto(componentSupplier, page, route, httpRequest),
        componentSupplier);
  }

  private static ComponentDto mapPageToComponentDto(
      ComponentSupplier componentSupplier, Page page, String route, HttpRequest httpRequest) {
    var pageDto = PageDto.builder().title(page.title()).subtitle(page.subtitle()).build();
    return new ComponentDto(
        pageDto, "component_id", componentSupplier.getClass().getName(), List.of());
  }
}
