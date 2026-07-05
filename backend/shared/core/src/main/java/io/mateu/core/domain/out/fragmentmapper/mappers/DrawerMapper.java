package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DrawerDto;
import io.mateu.dtos.DrawerPositionDto;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.DrawerPosition;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class DrawerMapper {

  public static ClientSideComponentDto mapDrawerToDto(
      Drawer drawer,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        DrawerDto.builder()
            .id(drawer.id())
            .initialData(drawer.initialData())
            .content(
                mapComponentToDto(
                    null,
                    drawer.content(),
                    baseUrl,
                    route,
                    consumedRoute,
                    initiatorComponentId,
                    httpRequest))
            .footer(
                mapComponentToDto(
                    null,
                    drawer.footer(),
                    baseUrl,
                    route,
                    consumedRoute,
                    initiatorComponentId,
                    httpRequest))
            .header(
                mapComponentToDto(
                    null,
                    drawer.header(),
                    baseUrl,
                    route,
                    consumedRoute,
                    initiatorComponentId,
                    httpRequest))
            .headerTitle(drawer.headerTitle())
            .position(mapPosition(drawer.position()))
            .width(drawer.width())
            .noPadding(drawer.noPadding())
            .modeless(drawer.modeless())
            .build(),
        "fieldId",
        List.of(),
        drawer.style(),
        drawer.cssClasses(),
        null);
  }

  private static DrawerPositionDto mapPosition(DrawerPosition position) {
    return position == DrawerPosition.start ? DrawerPositionDto.start : DrawerPositionDto.end;
  }
}
