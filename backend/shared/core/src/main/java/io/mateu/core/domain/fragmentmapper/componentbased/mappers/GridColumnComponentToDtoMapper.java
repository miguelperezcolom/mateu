package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DataPageDto;
import io.mateu.dtos.GridColumnDto;
import io.mateu.uidl.data.Grid;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class GridColumnComponentToDtoMapper {

  public static ClientSideComponentDto mapGridColumnToDto(
      GridColumn gridColumn, String baseUrl, String route, HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        GridColumnDto.builder()
            .dataType(gridColumn.dataType().name())
            .stereotype(gridColumn.stereotype().name())
            .autoWidth(gridColumn.autoWidth())
            .cssClasses(gridColumn.cssClasses())
            .filterable(gridColumn.filterable())
            .flexGrow(gridColumn.flexGrow())
            .frozen(gridColumn.frozen())
            .frozenToEnd(gridColumn.frozenToEnd())
            .id(gridColumn.id())
            .label(gridColumn.label())
            .resizable(gridColumn.resizable())
            .sortable(gridColumn.sortable())
            .sortingProperty(gridColumn.sortingProperty())
            .width(gridColumn.width())
            .build(),
        gridColumn.id(),
        List.of(),
        gridColumn.style(),
        gridColumn.cssClasses());
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
