package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ContentLayoutDto;
import io.mateu.uidl.data.ContentAsidePosition;
import io.mateu.uidl.data.ContentLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;

public class ContentLayoutMapper {

  public static ClientSideComponentDto mapContentLayoutToDto(
      ContentLayout contentLayout,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    List<ComponentDto> children = new ArrayList<>();
    addSlotted(
        children,
        contentLayout.main(),
        "main-",
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest);
    addSlotted(
        children,
        contentLayout.aside(),
        "aside-",
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest);
    addSlotted(
        children,
        contentLayout.footer(),
        "footer-",
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest);
    return new ClientSideComponentDto(
        ContentLayoutDto.builder()
            .asidePosition(
                (contentLayout.asidePosition() != null
                        ? contentLayout.asidePosition()
                        : ContentAsidePosition.end)
                    .name())
            .asideWidth(contentLayout.asideWidth())
            .asideSticky(contentLayout.asideSticky())
            .build(),
        contentLayout.id(),
        children,
        contentLayout.style(),
        contentLayout.cssClasses(),
        null);
  }

  private static void addSlotted(
      List<ComponentDto> children,
      List<Component> region,
      String slotPrefix,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (region == null) {
      return;
    }
    for (int i = 0; i < region.size(); i++) {
      Component component = region.get(i);
      if (component == null) {
        continue;
      }
      children.add(
          mapComponentToDto(
                  null, component, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest)
              .setSlot(slotPrefix + i));
    }
  }
}
