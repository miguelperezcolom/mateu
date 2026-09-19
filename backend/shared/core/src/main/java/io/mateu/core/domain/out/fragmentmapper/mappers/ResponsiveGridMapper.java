package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ResponsiveGridDto;
import io.mateu.uidl.data.ResponsiveGrid;
import io.mateu.uidl.data.Slotted;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * Maps a {@link ResponsiveGrid} (coherence-plan #9) to its wire component: the tracks resolve to a
 * CSS {@code grid-template-columns} string, the children travel as component children.
 */
public class ResponsiveGridMapper {

  public static ClientSideComponentDto mapResponsiveGridToDto(
      ResponsiveGrid grid,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        ResponsiveGridDto.builder()
            .gridTemplateColumns(grid.gridTemplateColumns())
            .gap(grid.gap())
            .colSpans(grid.colSpans())
            .stackBelow(grid.stackBelow())
            .gridTemplateAreas(grid.gridTemplateAreas())
            .build(),
        grid.id(),
        grid.content() != null
            ? grid.content().stream()
                .map(
                    child ->
                        mapChild(
                            child,
                            baseUrl,
                            route,
                            consumedRoute,
                            initiatorComponentId,
                            httpRequest))
                .toList()
            : List.of(),
        grid.style(),
        null,
        null);
  }

  /**
   * Maps a grid child; a {@link Slotted} child (coherence-plan #7) maps its content and sets the
   * wire {@code slot} so the renderer places it in the matching named area.
   */
  private static ComponentDto mapChild(
      io.mateu.uidl.fluent.Component child,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (child instanceof Slotted slotted) {
      return mapComponentToDto(
              null,
              slotted.content(),
              baseUrl,
              route,
              consumedRoute,
              initiatorComponentId,
              httpRequest)
          .setSlot(slotted.slot());
    }
    return mapComponentToDto(
        null, child, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
  }
}
