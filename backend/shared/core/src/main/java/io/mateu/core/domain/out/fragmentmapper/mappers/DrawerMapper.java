package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DrawerDto;
import io.mateu.dtos.DrawerPositionDto;
import io.mateu.dtos.PeerNavDto;
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
            .subtitle(drawer.subtitle())
            .position(mapPosition(drawer.position()))
            .width(drawer.width())
            .size(drawer.size() != null ? drawer.size().name() : null)
            .maximizable(drawer.maximizable())
            .collapsible(drawer.collapsible())
            .peerNav(
                drawer.peerNav() != null
                    ? new PeerNavDto(
                        drawer.peerNav().prevLabel(),
                        drawer.peerNav().prevRoute(),
                        drawer.peerNav().nextLabel(),
                        drawer.peerNav().nextRoute())
                    : null)
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
    if (position == DrawerPosition.start) return DrawerPositionDto.start;
    if (position == DrawerPosition.bottom) return DrawerPositionDto.bottom;
    return DrawerPositionDto.end;
  }
}
