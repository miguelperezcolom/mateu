package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ResponsiveGridDto;
import io.mateu.uidl.data.ResponsiveGrid;
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
            .build(),
        grid.id(),
        grid.content() != null
            ? grid.content().stream()
                .map(
                    child ->
                        mapComponentToDto(
                            null,
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
}
