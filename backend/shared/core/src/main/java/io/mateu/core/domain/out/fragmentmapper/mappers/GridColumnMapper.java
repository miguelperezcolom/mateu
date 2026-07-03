package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DataPageDto;
import io.mateu.dtos.GridColumnDto;
import io.mateu.uidl.data.ColumnAlignment;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Grid;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class GridColumnMapper {

  public static ClientSideComponentDto mapGridColumnToDto(
      GridColumn gridColumn, String baseUrl, String route, HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        GridColumnDto.builder()
            .align(getAlignment(gridColumn))
            .dataType(gridColumn.dataType().name())
            .stereotype(gridColumn.stereotype().name())
            .autoWidth(gridColumn.autoWidth() || gridColumn.width() == null)
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
            .priority(gridColumn.priority() != Integer.MAX_VALUE ? gridColumn.priority() : null)
            .identifier(gridColumn.identifier())
            .editable(gridColumn.editable())
            .weight(gridColumn.weight())
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
    return null;
  }

  private static String getAlignment(GridColumn gridColumn) {
    if (gridColumn.align() != null) {
      return gridColumn.align().name();
    }
    if (List.of(FieldDataType.integer, FieldDataType.number, FieldDataType.money)
        .contains(gridColumn.dataType())) {
      return ColumnAlignment.end.name();
    }
    // A column flagged as money via @Stereotype(money) keeps dataType=string but is
    // formatted as currency, so it should be right-aligned like other numeric columns.
    if (gridColumn.stereotype() == FieldStereotype.money) {
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
