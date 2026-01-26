package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DataPageDto;
import io.mateu.dtos.GridColumnDto;
import io.mateu.uidl.data.ColumnAlignment;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.Grid;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class GridColumnComponentToDtoMapper {

  public static ClientSideComponentDto mapGridColumnToDto(
      GridColumn gridColumn, String baseUrl, String route, HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        GridColumnDto.builder()
            .align(getAlignment(gridColumn))
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
            .width(getWidth(gridColumn))
            .tooltipPath(gridColumn.tooltipPath())
            .actionId(gridColumn.actionId())
            .text(gridColumn.text())
            .style(gridColumn.style())
            .build(),
        gridColumn.id(),
        List.of(),
        gridColumn.style(),
        gridColumn.cssClasses(),
        null);
  }

  private static String getWidth(GridColumn gridColumn) {
    if (gridColumn.width() != null) {
      return gridColumn.width();
    }
    if (FieldDataType.money.equals(gridColumn.dataType())) {
      return "9rem";
    }

    return "10rem";
  }

  private static String getAlignment(GridColumn gridColumn) {
    if (gridColumn.align() != null) {
      return gridColumn.align().name();
    }
    if (List.of(FieldDataType.integer, FieldDataType.number, FieldDataType.money)
        .contains(gridColumn.dataType())) {
      return ColumnAlignment.end.name();
    }
    if (List.of(FieldDataType.bool).contains(gridColumn.dataType())) {
      return ColumnAlignment.center.name();
    }
    return null;
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
