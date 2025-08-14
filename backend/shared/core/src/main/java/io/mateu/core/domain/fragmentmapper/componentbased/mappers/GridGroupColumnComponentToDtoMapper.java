package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DataPageDto;
import io.mateu.dtos.GridGroupColumnDto;
import io.mateu.uidl.data.Grid;
import io.mateu.uidl.data.GridGroupColumn;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class GridGroupColumnComponentToDtoMapper {

  public static ClientSideComponentDto mapGridGroupColumnToDto(
      GridGroupColumn gridGroupColumn, String baseUrl, String route, HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        GridGroupColumnDto.builder()
            .cssClasses(gridGroupColumn.cssClasses())
            .id(gridGroupColumn.id())
            .label(gridGroupColumn.label())
            .build(),
        gridGroupColumn.id(),
        List.of(),
        gridGroupColumn.style(),
        gridGroupColumn.cssClasses(),
        null);
  }

  private static DataPageDto gatePage(Grid grid) {
    if (grid == null) {
      return null;
    }
    if (grid.page() == null) {
      return null;
    }
    return new DataPageDto(grid.page().content(), grid.page().totalElements());
  }
}
