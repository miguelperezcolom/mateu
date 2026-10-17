package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.GridGroupColumnDto;
import io.mateu.uidl.data.GridGroupColumn;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class GridGroupColumnMapper {

  /**
   * A header group: its grouped columns travel in {@code metadata.columns}, each mapped exactly
   * like a column of the grid itself (a ClientSide-wrapped {@code GridColumn}).
   */
  public static ClientSideComponentDto mapGridGroupColumnToDto(
      GridGroupColumn gridGroupColumn,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var columns =
        gridGroupColumn.columns() == null
            ? List.<io.mateu.dtos.ComponentDto>of()
            : gridGroupColumn.columns().stream()
                .map(
                    column ->
                        mapComponentToDto(
                            null,
                            column,
                            baseUrl,
                            route,
                            consumedRoute,
                            initiatorComponentId,
                            httpRequest))
                .toList();
    return new ClientSideComponentDto(
        GridGroupColumnDto.builder()
            .cssClasses(gridGroupColumn.cssClasses())
            .style(gridGroupColumn.style())
            .id(gridGroupColumn.id())
            .label(gridGroupColumn.label())
            .columns(columns)
            .build(),
        gridGroupColumn.id(),
        List.of(),
        gridGroupColumn.style(),
        gridGroupColumn.cssClasses(),
        null);
  }
}
